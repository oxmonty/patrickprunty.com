/**
 * Code block theme, sampled directly from the reference screenshot rather than
 * matched by eye to a named theme.
 *
 * Always dark, on a light page. That is deliberate: the block reads as a
 * distinct surface rather than as part of the prose, so it does not follow the
 * site's light/dark state and needs no CSS-variable swap.
 */
const palette = {
	background: '#111111',
	foreground: '#eeeee3',
	keyword: '#7388f7',
	callable: '#f5bb5f',
	builtin: '#bad688',
	comment: '#6f6f68'
};

/** @type {import('shiki').ThemeRegistrationRaw} */
export const codeDark = {
	name: 'code-dark',
	type: 'dark',
	fg: palette.foreground,
	bg: palette.background,
	colors: {
		'editor.background': palette.background,
		'editor.foreground': palette.foreground
	},
	settings: [
		{ settings: { background: palette.background, foreground: palette.foreground } },
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: palette.comment, fontStyle: 'italic' }
		},
		{
			// Punctuation and operators stay in the body colour — the reference
			// keeps braces, dots, and semicolons unaccented.
			scope: [
				'punctuation',
				'meta.brace',
				'punctuation.separator',
				'punctuation.terminator',
				'punctuation.accessor',
				'keyword.operator'
			],
			settings: { foreground: palette.foreground }
		},
		{
			scope: [
				'keyword',
				'keyword.control',
				'storage',
				'storage.type',
				'storage.modifier',
				'keyword.operator.new',
				'variable.language'
			],
			settings: { foreground: palette.keyword }
		},
		{
			scope: [
				'entity.name.function',
				'support.function',
				'meta.function-call.generic',
				'variable.function',
				'constant.numeric',
				'constant.language',
				'keyword.other.unit'
			],
			settings: { foreground: palette.callable }
		},
		{
			scope: [
				'string',
				'punctuation.definition.string',
				'string.regexp',
				'support.class',
				'support.constant',
				'support.type',
				'entity.name.type',
				'entity.other.attribute-name',
				'markup.inserted'
			],
			settings: { foreground: palette.builtin }
		},
		{
			scope: ['variable', 'variable.other', 'variable.parameter', 'meta.object-literal.key'],
			settings: { foreground: palette.foreground }
		}
	]
};
