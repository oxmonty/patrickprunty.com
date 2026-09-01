import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Build-time audit of the `image` each post unfurls with.
 *
 * A post's frontmatter image is its OpenGraph card, so it is subject to what
 * the unfurlers want rather than to what looks right in the listing. The
 * numbers below are theirs:
 *
 * - 1200x630 renders full width everywhere and is the one size worth hitting.
 * - Under 600x315 Facebook stops showing a large preview at all, and under
 *   200x200 it drops the image.
 * - X centre-crops the large card to 2:1, so anything far off that ratio loses
 *   its edges — a portrait image keeps only a band from the middle.
 * - X rejects over 5MB; staying under 1MB survives recompression better.
 *
 * Warnings only. A soft card is not worth failing a deploy over, and the check
 * needs the network, which a build should never depend on.
 */

const TARGET = { width: 1200, height: 630 };
const FLOOR = { width: 600, height: 315 };
/** X crops to 2:1, Facebook to 1.91:1. Outside this the crop starts to bite. */
const RATIO = { min: 1.5, max: 2.4 };
const BYTES_WARN = 1_000_000;
const BYTES_MAX = 5_000_000;

const SECTIONS = ['blog', 'code'];
/**
 * Wikimedia, where most of these images are hosted, answers 429 to a request
 * with no descriptive agent behind it. Their policy asks for a contact address.
 */
const AGENT = 'patrickprunty.com build check (https://github.com/oxmonty/patrickprunty.com)';
/** Enough of any of these formats to carry the dimensions in its header. */
const HEAD_BYTES = 65_536;

/** @param {Buffer} b */
function readPng(b) {
	if (b.length < 24 || b.toString('ascii', 12, 16) !== 'IHDR') return null;
	return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/** @param {Buffer} b */
function readJpeg(b) {
	let offset = 2;
	while (offset + 9 < b.length) {
		if (b[offset] !== 0xff) {
			offset++;
			continue;
		}
		const marker = b[offset + 1];
		// Every SOFn carries the frame size except DHT/JPG/DAC, which share the range.
		const isFrame =
			(marker >= 0xc0 && marker <= 0xc3) ||
			(marker >= 0xc5 && marker <= 0xc7) ||
			(marker >= 0xc9 && marker <= 0xcb) ||
			(marker >= 0xcd && marker <= 0xcf);
		if (isFrame) return { height: b.readUInt16BE(offset + 5), width: b.readUInt16BE(offset + 7) };
		offset += 2 + b.readUInt16BE(offset + 2);
	}
	return null;
}

/** @param {Buffer} b */
function readWebp(b) {
	if (b.length < 30 || b.toString('ascii', 8, 12) !== 'WEBP') return null;
	const format = b.toString('ascii', 12, 16);
	if (format === 'VP8X') return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
	if (format === 'VP8 ')
		return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
	if (format === 'VP8L') {
		const bits = b.readUInt32LE(21);
		return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
	}
	return null;
}

/** @param {Buffer} b */
function dimensions(b) {
	if (b.length < 24) return null;
	if (b.readUInt32BE(0) === 0x89504e47) return readPng(b);
	if (b[0] === 0xff && b[1] === 0xd8) return readJpeg(b);
	if (b.toString('ascii', 0, 4) === 'RIFF') return readWebp(b);
	return null;
}

/** @param {string} image @param {string} root */
async function measure(image, root) {
	if (/^https?:\/\//.test(image)) {
		const response = await fetch(image, {
			headers: { range: `bytes=0-${HEAD_BYTES - 1}`, 'user-agent': AGENT },
			signal: AbortSignal.timeout(15_000)
		});
		if (!response.ok && response.status !== 206) return { error: `HTTP ${response.status}` };
		const head = Buffer.from(await response.arrayBuffer());
		// 206 reports the slice; 200 means the range was ignored and this is the file.
		const declared = Number(response.headers.get('content-range')?.split('/')?.[1]);
		const bytes = Number.isFinite(declared) ? declared : head.length;
		return { size: dimensions(head), bytes, remote: true };
	}

	const file = path.join(root, 'static', image.replace(/^\//, ''));
	const [head, info] = await Promise.all([readFile(file), stat(file)]);
	return { size: dimensions(head), bytes: info.size, remote: false };
}

/** @param {string} root */
async function posts(root) {
	const found = [];
	for (const section of SECTIONS) {
		const dir = path.join(root, 'src/routes', section);
		for (const entry of await readdir(dir, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const file = path.join(dir, entry.name, '+page.md');
			const source = await readFile(file, 'utf8').catch(() => null);
			if (!source) continue;
			const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
			const image = frontmatter?.match(/^image:\s*(.+?)\s*$/m)?.[1];
			found.push({ slug: `${section}/${entry.name}`, image });
		}
	}
	return found;
}

/**
 * @param {{ root?: string }} [options]
 * @returns {import('vite').Plugin}
 */
export function checkOgImages({ root = process.cwd() } = {}) {
	/** @type {import('vite').ResolvedConfig['logger'] | undefined} */
	let logger;

	return {
		name: 'check-og-images',
		apply: /** @type {const} */ ('build'),
		/** @param {import('vite').ResolvedConfig} config */
		configResolved(config) {
			logger = config.logger;
		},
		async buildStart() {
			// SvelteKit builds a client and an ssr environment. Vite loads this
			// module once per environment, so neither closure nor module state
			// dedupes the two runs — the environment's own name is what does.
			if (this.environment && this.environment.name !== 'client') return;

			/** @type {string[]} */
			const notes = [];

			for (const { slug, image } of await posts(root)) {
				// No frontmatter image is fine: the post falls back to its generated
				// card, which is already the right shape.
				if (!image) continue;

				let measured;
				try {
					measured = await measure(image, root);
				} catch (cause) {
					notes.push(`${slug}: could not read ${image} (${/** @type {Error} */ (cause).message})`);
					continue;
				}

				if (measured.error) {
					notes.push(`${slug}: ${image} returned ${measured.error}`);
					continue;
				}

				const { size, bytes } = measured;
				if (!size) {
					notes.push(`${slug}: could not read dimensions from ${image}`);
					continue;
				}

				const { width, height } = size;
				const ratio = Number((width / height).toFixed(2));
				const problems = [];

				if (width < FLOOR.width || height < FLOOR.height) {
					problems.push(
						`${width}x${height} is below the ${FLOOR.width}x${FLOOR.height} floor, so it will not unfurl as a large card`
					);
				} else if (width < TARGET.width || height < TARGET.height) {
					problems.push(
						`${width}x${height} is under ${TARGET.width}x${TARGET.height} and will be upscaled`
					);
				}

				if (ratio < RATIO.min || ratio > RATIO.max) {
					problems.push(
						`${ratio}:1 is outside ${RATIO.min}-${RATIO.max}:1, so the crop will cut into it`
					);
				}

				if (bytes > BYTES_MAX) problems.push(`${(bytes / 1e6).toFixed(1)}MB is over X's 5MB limit`);
				else if (bytes > BYTES_WARN)
					problems.push(
						`${(bytes / 1e6).toFixed(1)}MB is over the 1MB that survives recompression`
					);

				if (problems.length) notes.push(`${slug}: ${problems.join('; ')}`);
			}

			if (!notes.length) return;
			// The Vite logger rather than this.warn: a Rollup warning is replayed in
			// the summary of every environment SvelteKit builds, so it would be
			// printed once per environment for a single run of this hook.
			(logger?.warn ?? console.warn)(
				`\n[og-image] ${notes.length} post image${notes.length > 1 ? 's are' : ' is'} not shaped ` +
					`for an unfurl (want ${TARGET.width}x${TARGET.height}):\n  ${notes.join('\n  ')}\n`
			);
		}
	};
}
