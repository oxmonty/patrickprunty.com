import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SITE_URL || 'https://patrickprunty.com';

export const site = {
	name: 'Patrick Prunty',
	domain: 'patrickprunty.com',
	url,
	description: 'Software developer, writer, and occasional adventurer',
	locale: 'en_US',
	themeColor: '#F5F5F7',
	googleSiteVerification: '-iY6qDMJuHD3UtRxA28Hico0L_3ouq5lGdhwbbiZQ7A',
	author: {
		name: 'Patrick Prunty',
		email: 'patrickprunty.business@gmail.com',
		twitter: '@pprunty_'
	},
	links: {
		twitter: 'https://twitter.com/pprunty_',
		github: 'https://github.com/pprunty',
		/** This site's own repository, linked from the footer's build hash. */
		repo: 'https://github.com/oxmonty/patrickprunty.com',
		substack: 'https://substack.com/@pprunty',
		/** The publication itself, which is what /subscribe hangs off. */
		newsletter: 'https://pprunty.substack.com/subscribe',
		linkedin: 'https://www.linkedin.com/in/patrickprunty/',
		strava: 'https://www.strava.com/athletes/72636452',
		youtube: 'https://www.youtube.com/@pprunty',
		threads: 'https://www.threads.com/@pprunty97'
	},
	/** Carried over from v1's config; drives both /projects and the home aside. */
	/** Descriptions carry no closing full stop, by house style. */
	projects: [
		{
			name: 'Lotso',
			// TODO: replace the placeholder description and url with your own copy.
			video: '/projects/lotso.mp4',
			image: '/projects/lotso-poster.jpg',
			url: 'https://x.com/konstipaulus/status/2066534707496444317',
			description: 'TODO: one-line description of Lotso'
		},
		{
			name: 'Delta Components',
			video: '/projects/delta-demo.mp4',
			image: '/projects/delta-poster.jpg',
			url: 'https://deltacomponents.dev',
			description:
				'High-performance components registry built on top of shadcn/ui. From AI chat interfaces to interactive media. Copy, paste, and own the code'
		},
		{
			name: 'Biscuit',
			video: '/projects/biscuit.mp4',
			image: '/projects/biscuit-poster.jpg',
			url: 'https://github.com/oxmonty/biscuit',
			description:
				'Biscuit generates production-ready CLI repositories from OpenAPI specs. Every CLI is also an MCP server and chat TUI. Open source, in Go'
		},
		{
			name: 'Console',
			// TODO: real preview image.
			image: '/projects/placeholder.svg',
			url: 'https://github.com/oxmonty/console',
			description: 'Open-source alternative to Vercel with Google Cloud Platform integration'
		},
		{
			name: 'Doto',
			// TODO: real preview, description, and url.
			image: '/projects/placeholder.svg',
			url: '#',
			description: 'TODO: one-line description of Doto'
		},
		{
			name: 'Yoshi Notebooks',
			// TODO: real preview image.
			image: '/projects/placeholder.svg',
			url: 'https://yoshinotebooks.com',
			description:
				'Yoshi is a native, GPU-rendered Jupyter notebook desktop app for macOS and Linux, built in Rust on GPUI'
		}
	],
	relatedSites: [
		'deltacomponents.dev',
		'monthy.ai',
		'x.com/pprunty_',
		'github.com/pprunty',
		'linkedin.com/in/patrickprunty',
		'strava.com/athletes/72636452'
	]
} as const;

export type SiteConfig = typeof site;
