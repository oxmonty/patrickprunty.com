/**
 * Svelte preprocessor that gives every markdown file the MDX registry.
 *
 * mdsvex layouts can only substitute *HTML element* names — a layout export
 * named `img` replaces `<img>`, but an export named `YouTube` does nothing for
 * `<YouTube />`. Components have to be imported by the markdown file itself, so
 * this injects the import ahead of mdsvex rather than asking every author (and
 * remark-auto-embed, which has no way to add imports) to do it by hand.
 *
 * Rollup drops unreferenced components from the production build, but only when
 * nothing in them has a side effect — a component with a top-level CSS import
 * survives and drags its dependencies into the shared chunk with it. Keep the
 * registry free of components that pull heavy libraries in at module scope.
 */

import { COMPONENT_NAMES } from '../components/mdx/names.js';

const IMPORT = `import { ${COMPONENT_NAMES.join(', ')} } from '$lib/components/mdx';`;

/** Frontmatter has to stay the first thing in the file for mdsvex to see it. */
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export function injectMdxComponents({ extensions = ['.md'] } = {}) {
	return {
		name: 'inject-mdx-components',
		/** @type {import('svelte/compiler').MarkupPreprocessor} */
		markup({ content, filename }) {
			if (!filename || !extensions.some((extension) => filename.endsWith(extension))) return;

			const frontmatter = content.match(FRONTMATTER)?.[0] ?? '';
			const body = content.slice(frontmatter.length);

			// An author's own <script> block wins the top slot: merge into it rather
			// than emitting a second one, which mdsvex would reject.
			const existing = body.match(/^\s*<script([^>]*)>/);
			if (existing) {
				const insertAt = /** @type {number} */ (existing.index) + existing[0].length;
				return {
					code: frontmatter + body.slice(0, insertAt) + `\n\t${IMPORT}` + body.slice(insertAt)
				};
			}

			return { code: `${frontmatter}<script>\n\t${IMPORT}\n</script>\n\n${body}` };
		}
	};
}
