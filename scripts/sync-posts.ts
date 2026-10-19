/**
 * Mirrors the Obsidian vault into the repo. The vault is the source of truth
 * for posts: a note in a vault folder named in obsidian.yaml becomes
 * src/routes/<section>/<slug>/+page.md, and a post with no note behind it is
 * removed. Edits made to the repo copies are overwritten on the next run.
 *
 * Run by hand (`make sync`), by the pre-push hook, and by the dev server on
 * every change to the vault (vite.config.ts).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';

export const CONFIG_FILE = 'obsidian.yaml';

export interface ObsidianConfig {
	/** Absolute path to the vault folder holding the section folders. */
	vault: string;
	/** Vault folder name → route section, e.g. `{ BLOG: 'blog' }`. */
	sections: Record<string, string>;
}

/** Reads obsidian.yaml, or returns undefined when the repo has none. */
export function loadObsidianConfig(repoRoot: string): ObsidianConfig | undefined {
	const file = path.join(repoRoot, CONFIG_FILE);
	if (!existsSync(file)) return undefined;

	const raw = parse(readFileSync(file, 'utf8')) as Partial<ObsidianConfig> | null;
	if (typeof raw?.vault !== 'string' || typeof raw.sections !== 'object' || !raw.sections) {
		throw new Error(`${CONFIG_FILE} needs a \`vault\` path and a \`sections\` map`);
	}
	return { vault: raw.vault.replace(/^~(?=$|\/)/, os.homedir()), sections: raw.sections };
}

/** The note's file name is its URL. Renaming a published note moves the post. */
function slugify(fileName: string): string {
	return fileName
		.replace(/\.md$/, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export interface Change {
	action: 'write' | 'delete';
	path: string;
}

export function syncPosts({ vault, sections }: ObsidianConfig, repoRoot: string): Change[] {
	const changes: Change[] = [];

	// Validate every folder before touching anything, so a misconfigured
	// section cannot leave the others half-synced. A missing folder is a
	// misconfiguration, not an empty section: treating it as empty would delete
	// every post in the section.
	for (const folder of Object.keys(sections)) {
		const source = path.join(vault, folder);
		if (!existsSync(source)) throw new Error(`${source} does not exist, refusing to sync`);
	}

	for (const [folder, section] of Object.entries(sections)) {
		const source = path.join(vault, folder);
		const routeDir = path.join(repoRoot, 'src/routes', section);
		const wanted = new Map<string, string>();
		for (const file of readdirSync(source)) {
			if (!file.endsWith('.md') || file.startsWith('.')) continue;
			const slug = slugify(file);
			// An empty slug would land on src/routes/<section>/+page.md, beside the
			// listing's +page.svelte, and SvelteKit refuses a route with two pages.
			if (!slug)
				throw new Error(`${file} in ${folder} has no letters or digits to make a URL from`);
			const other = wanted.get(slug);
			if (other)
				throw new Error(
					`${file} and ${path.basename(other)} in ${folder} would both be /${section}/${slug}`
				);
			wanted.set(slug, path.join(source, file));
		}

		for (const [slug, note] of wanted) {
			const target = path.join(routeDir, slug, '+page.md');
			const content = readFileSync(note, 'utf8');
			if (existsSync(target) && readFileSync(target, 'utf8') === content) continue;
			mkdirSync(path.dirname(target), { recursive: true });
			writeFileSync(target, content);
			changes.push({ action: 'write', path: target });
		}

		for (const entry of readdirSync(routeDir, { withFileTypes: true })) {
			const isPost = entry.isDirectory() && existsSync(path.join(routeDir, entry.name, '+page.md'));
			if (!isPost || wanted.has(entry.name)) continue;
			rmSync(path.join(routeDir, entry.name), { recursive: true });
			changes.push({ action: 'delete', path: path.join(routeDir, entry.name) });
		}
	}

	return changes;
}

if (import.meta.main) {
	const config = loadObsidianConfig(process.cwd());
	if (!config) {
		console.error(`No ${CONFIG_FILE} in the repo root; nothing to sync from.`);
		process.exit(1);
	}
	const changes = syncPosts(config, process.cwd());
	for (const change of changes)
		console.log(`${change.action}  ${path.relative(process.cwd(), change.path)}`);
	console.log(
		changes.length === 0
			? 'Posts already match the vault.'
			: `${changes.length} change(s) synced from the vault.`
	);
}
