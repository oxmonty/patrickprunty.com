/**
 * Every component name markdown files can use without importing.
 *
 * Kept as a plain list (not derived from index.ts) because the preprocessor
 * runs inside the Vite config, before any Svelte or TypeScript is loadable.
 * Adding a component means adding it here and to index.ts.
 */
export const COMPONENT_NAMES = [
	'CodeBlock',
	'YouTube',
	'MP4',
	'MP3',
	'Spotify',
	'XCard',
	'OgCard',
	'ZoomImage',
	'Callout',
	'FootNotes',
	'FootNote',
	'Ref',
	'Latex',
	'LargeInlineMath',
	'LargeBlockMath',
	'StyledQuote',
	'QuoteAttribution',
	'Caption',
	'Steps',
	'Step',
	'ImageGrid',
	'ImageGridItem',
	'FullBleed',
	'LinkedCard',
	'DemoBoundary'
];
