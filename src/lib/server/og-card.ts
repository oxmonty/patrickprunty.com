import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

import { read } from '$app/server';
import arimoMedium from '$lib/server/fonts/Arimo-Medium.ttf';
import arimoRegular from '$lib/server/fonts/Arimo-Regular.ttf';
import { site } from '$lib/config/site';

/**
 * OpenGraph card, following the pattern monthy/www uses — but drawn in this
 * site's own language: paper ground, ink text, and the hairline frame.
 *
 * Rendered at build time, once per page, so satori and resvg never run in
 * production and an unfurler is served a static PNG.
 *
 * Satori needs real font data and cannot reach the system SF Pro stack, so this
 * renders in Arimo, which is metric-compatible with the Helvetica/Arial
 * fallbacks the site already declares.
 */

const WIDTH = 1200;
const HEIGHT = 630;

/** Distance the frame sits in from each edge, as monthy/www draws it. */
const FRAME_INSET = 64;

/**
 * The inset frame from monthy/www's card, drawn in --rule rather than ink so it
 * reads as the page's hairline instead of competing with the title. Absolute,
 * so it never enters the content flow.
 */
const frame = [
	{ top: 0, bottom: 0, left: FRAME_INSET, width: 1 },
	{ top: 0, bottom: 0, right: FRAME_INSET, width: 1 },
	{ left: 0, right: 0, top: FRAME_INSET, height: 1 },
	{ left: 0, right: 0, bottom: FRAME_INSET, height: 1 }
].map((rule) => ({
	type: 'div',
	props: {
		style: {
			position: 'absolute',
			display: 'flex',
			backgroundColor: '#413d44',
			...rule
		}
	}
}));

/** Long titles step down a size rather than overflowing the card. */
function titleSize(title: string): number {
	if (title.length > 70) return 64;
	if (title.length > 40) return 84;
	return 104;
}

// Static instances, not the variable build: satori's font parser reads the
// `fvar` table of a variable TTF and fails.
const [regular, medium] = await Promise.all([
	read(arimoRegular).arrayBuffer(),
	read(arimoMedium).arrayBuffer()
]);

export async function renderOgCard(
	rawTitle: string,
	rawDescription: string
): Promise<Uint8Array<ArrayBuffer>> {
	const title = rawTitle.trim() || site.name;
	const description = rawDescription.trim() || site.description;

	const markup = {
		type: 'div',
		props: {
			style: {
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				// --paper, the ground the site itself sits on.
				backgroundColor: '#fafafa',
				color: '#0a0a0a',
				padding: '104px 112px',
				fontFamily: 'Arimo',
				position: 'relative'
			},
			children: [
				...frame,
				{
					type: 'div',
					props: {
						// Capped short of the full width so a long line ends before the
						// corner mark rather than running into it, as monthy/www does.
						style: {
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							flexGrow: 1,
							maxWidth: 880
						},
						children: [
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										fontSize: titleSize(title),
										fontWeight: 500,
										letterSpacing: '-0.02em',
										lineHeight: 1.1
									},
									children: title
								}
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										marginTop: 40,
										fontSize: 32,
										lineHeight: 1.35,
										color: '#413d44'
									},
									children: description
								}
							}
						]
					}
				},
				{
					type: 'div',
					props: {
						// Bottom-right, where monthy/www puts its logo mark. Absolute so a
						// title long enough to fill the card cannot crowd it out of the
						// corner, and inset so it clears both frame lines by the same 48px.
						style: {
							position: 'absolute',
							right: 112,
							bottom: 112,
							display: 'flex',
							width: 48,
							height: 48,
							backgroundColor: '#3f3',
							border: '2px solid #0a0a0a'
						}
					}
				}
			]
		}
	};

	const svg = await satori(markup as never, {
		width: WIDTH,
		height: HEIGHT,
		fonts: [
			{ name: 'Arimo', data: regular, weight: 400, style: 'normal' },
			{ name: 'Arimo', data: medium, weight: 500, style: 'normal' }
		]
	});

	const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();

	// Copied into a buffer of its own: a Node Buffer views a slice of a shared
	// pool, and Response's body type will not take that.
	const bytes = new Uint8Array(png.byteLength);
	bytes.set(png);
	return bytes;
}
