import { createHighlighter } from 'shiki';

import { codeDark } from './code-theme.js';

/**
 * Build-time syntax highlighting for fenced code blocks.
 *
 * mdsvex calls this during preprocessing, so Shiki never reaches the browser.
 * The highlighter is created once and reused across every file in the build.
 *
 * One always-dark theme: the code block is its own surface and does not follow
 * the page's light/dark state.
 */

let highlighterPromise;

function getHighlighter() {
	highlighterPromise ??= createHighlighter({
		themes: [codeDark],
		langs: [
			'bash',
			'css',
			'diff',
			'html',
			'javascript',
			'json',
			'jsx',
			'markdown',
			'python',
			'svelte',
			'tsx',
			'typescript',
			'yaml'
		]
	});
	return highlighterPromise;
}

/**
 * Svelte reads `{`, `}` and backticks inside markup as template syntax, so the
 * highlighted HTML has to be escaped before it is handed back to the compiler.
 */
/** @param {string} html */
function escapeSvelte(html) {
	return html
		.replace(/[{}`]/g, (/** @type {string} */ char) => `&#${char.charCodeAt(0)};`)
		.replace(/\\([trn])/g, '&#92;$1');
}

/**
 * @param {string} code
 * @param {string | null} [lang] Absent for a fence with no language.
 */
export async function highlighter(code, lang) {
	const shiki = await getHighlighter();
	const language = lang && shiki.getLoadedLanguages().includes(lang) ? lang : 'text';

	// A single theme, not a light/dark pair: the block is always dark, so Shiki
	// can inline real colours and no CSS-variable swap is needed.
	const html = shiki.codeToHtml(code, { lang: language, theme: 'code-dark' });

	// Shiki puts tabindex="0" on the <pre> so keyboard users can scroll an
	// overflowing block. CodeBlock's wrapper is the element that actually
	// scrolls, and it carries the tabindex instead, so drop Shiki's.
	const accessible = html.replace(' tabindex="0"', '');

	return `<CodeBlock code={${JSON.stringify(code)}} language="${language}">${escapeSvelte(accessible)}</CodeBlock>`;
}
