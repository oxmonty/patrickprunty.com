import { execSync } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

import mdsvexConfig from './mdsvex.config.js';
import { injectMdxComponents } from './src/lib/mdx/inject-components.js';

/**
 * The commit the running site was built from, shown in the footer. CI usually
 * builds from a detached checkout with the SHA in the environment; the git call
 * is the local-dev path, and 'dev' covers a build from a tarball with no repo.
 */
const gitHash = (
	process.env.PUBLIC_GIT_SHA ||
	process.env.VERCEL_GIT_COMMIT_SHA ||
	process.env.CF_PAGES_COMMIT_SHA ||
	process.env.GITHUB_SHA ||
	(() => {
		try {
			return execSync('git rev-parse HEAD').toString().trim();
		} catch {
			return 'dev';
		}
	})()
).slice(0, 7);

export default defineConfig({
	define: { __GIT_HASH__: JSON.stringify(gitHash) },
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

			// Node rather than adapter-auto: `read` from $app/server, which the OG
			// route uses to load its font files, needs an adapter that can state
			// whether the target supports it. Build output runs with `node build`.
			// Node rather than adapter-auto: `read` from $app/server, which the OG
			// route uses for its font files, needs an adapter that knows whether the
			// target supports it. Run the output with `node build`.
			adapter: adapter()
		})
	]
});
