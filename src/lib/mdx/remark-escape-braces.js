import { visit } from 'unist-util-visit';

/**
 * Svelte reads `{` in markup as the start of an expression, so a brace typed
 * in prose — a placeholder, a set, a shrug — stops the whole post compiling,
 * and with it every listing that reads the post's frontmatter. No post writes
 * Svelte expressions in prose, so a brace in text is always literal.
 *
 * Text becomes a raw `html` node because the stringifier would otherwise turn
 * the entity's `&` into `&amp;`. Code, math, and component tags are other node
 * types and pass through untouched.
 */
export function remarkEscapeBraces() {
	/** @param {import('mdast').Root} tree */
	return (tree) => {
		visit(tree, 'text', (node, index, parent) => {
			if (!/[{}]/.test(node.value) || !parent || index === undefined) return;
			parent.children[index] = {
				type: 'html',
				value: node.value
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\{/g, '&#123;')
					.replace(/\}/g, '&#125;')
			};
		});
	};
}
