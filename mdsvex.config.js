import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkMath from 'remark-math';
import path from 'node:path';
import { defineMDSveXConfig } from 'mdsvex';

import { rehypeHeadingAnchor } from './src/lib/mdx/rehype-heading-anchor.js';
import { remarkAutoEmbed } from './src/lib/mdx/remark-auto-embed.js';
import { highlighter } from './src/lib/mdx/highlight.js';

export default defineMDSveXConfig({
	extensions: ['.md'],
	// Absolute: mdsvex writes these straight into an import in the generated
	// component, where a relative path would resolve against the markdown file.
	//
	// Named layouts match on the path containing /<key>/, so both post
	// collections get the editorial chrome and a 5rem title. Anything else falls
	// through to the plain prose layout.
	layout: {
		blog: path.join(import.meta.dirname, 'src/lib/components/mdx/post-layout.svelte'),
		code: path.join(import.meta.dirname, 'src/lib/components/mdx/post-layout.svelte'),
		_: path.join(import.meta.dirname, 'src/lib/components/mdx/layout.svelte')
	},
	// mdsvex bundles the pre-micromark remark-parse, so remark plugins have to be
	// the legacy generation (remark-math 3, not 6) or they silently do nothing.
	// GFM needs no plugin at all here: that parser has tables and strikethrough
	// built in, which is why v1/monthy need remark-gfm and this does not.
	//
	// Math is worth the plugin because Svelte reads `{` in markup as the start of
	// an expression, so raw LaTeX in an attribute fails to compile. $…$ sidesteps
	// it and renders to HTML at build time.
	// Cast: mdsvex types plugins against unified 9's Node, not the mdast Root
	// these plugins declare.
	remarkPlugins: /** @type {any[]} */ ([remarkMath, remarkAutoEmbed]),
	rehypePlugins: /** @type {any[]} */ ([
		rehypeSlug,
		rehypeHeadingAnchor,
		// html, not the default htmlAndMathml: the MathML copy carries an
		// <annotation> holding the raw TeX, whose braces the Svelte compiler reads
		// as a template expression and 500s on. Screen-reader math would be worth
		// having — it needs the annotation escaped before the compiler sees it.
		[rehypeKatex, { output: 'html' }]
	]),
	highlight: { highlighter }
});
