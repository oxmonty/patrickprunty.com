import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

import mdsvexConfig from './mdsvex.config.js';
import { injectMdxComponents } from './src/lib/mdx/inject-components.js';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', ...(mdsvexConfig.extensions ?? ['.md'])],
			preprocess: [injectMdxComponents(mdsvexConfig), mdsvex(mdsvexConfig)],

			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				// mdsvex is also exempt: it emits `{...$$props}`, which runes mode rejects.
				// Our own components are all .svelte, so they still get runes.
				runes: ({ filename }) => {
					if (filename.split(/[/\\]/).includes('node_modules')) return undefined;
					if (filename.endsWith('.md')) return false;
					return true;
				}
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	]
});
