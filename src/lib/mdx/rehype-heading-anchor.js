import { visit } from 'unist-util-visit';

/**
 * Turns every heading rehype-slug has given an id into its own permalink, by
 * wrapping the heading text rather than hanging a `#` off the end of it — the
 * whole heading is the link, and nothing is added to the page visually.
 *
 * Rendered at build time rather than wired up on mount, so the link is in the
 * HTML a reader lands on and works with no JavaScript. Smooth scrolling comes
 * from `scroll-behavior` on the document, not from a click handler here.
 */

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export function rehypeHeadingAnchor() {
	/** @param {any} tree */
	return (tree) => {
		visit(tree, 'element', (/** @type {any} */ node) => {
			const id = node.properties?.id;
			if (!HEADINGS.has(node.tagName) || !id) return;

			node.children = [
				{
					type: 'element',
					tagName: 'a',
					properties: { href: `#${id}`, className: ['heading-anchor'] },
					children: node.children
				}
			];
		});
	};
}
