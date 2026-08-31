import { execSync } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
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

/**
 * Canonical origin, for the values that must name one domain however the site
 * was reached: the canonical link, og:url, the sitemap, and the RSS guids.
 *
 * Deliberately not the request's own origin, and not VERCEL_URL — both differ
 * per deployment, so every preview would self-canonicalise and the feed's guids
 * would churn on each push. VERCEL_PROJECT_PRODUCTION_URL names the production
 * domain even from a preview, which is the one that belongs in those tags. It
 * carries no scheme.
 *
 * PUBLIC_SITE_URL still overrides at runtime; this is only the fallback under
 * it, so an unset environment still gets the real domain rather than a literal
 * that goes stale.
 */
const siteUrl =
	process.env.PUBLIC_SITE_URL ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL &&
		`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
	'https://patrickprunty.com';

export default defineConfig({
	define: {
		__GIT_HASH__: JSON.stringify(gitHash),
		__SITE_URL__: JSON.stringify(siteUrl)
	},
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

			// Vercel, which is where this deploys. adapter-node emits a server you
			// start yourself, so Vercel found nothing to serve and answered every
			// path with its own 404. The OG cards are prerendered, so the `read`
			// they use from $app/server runs at build time and needs nothing of the
			// adapter at runtime.
			// Pinned rather than inferred: the adapter reads the runtime from the
			// Node running the build, which fails outright on a version it does not
			// recognise — a local toolchain bump should not be able to break the
			// deploy.
			adapter: adapter({ runtime: 'nodejs22.x' })
		})
	]
});
