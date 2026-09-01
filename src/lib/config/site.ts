import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SITE_URL || __SITE_URL__;

export interface Project {
	name: string;
	url: string;
	description: string;
	/** Tile artwork, or a poster frame when `video` is set. */
	image?: string;
	/** Autoplaying, muted loop shown in place of the image. */
	video?: string;
	/** Listed while developing, dropped from a production build. */
	draft?: boolean;
}

/** Drives both /projects and the About page aside. Descriptions carry no
 * closing full stop, by house style. */
const projects: Project[] = [
	{
		name: 'Console',
		draft: true,
		// TODO: real preview image. Splash artwork stands in.
		image: '/projects/console.svg',
		url: 'https://github.com/oxmonty/console',
		description: 'Open-source alternative to Vercel with Google Cloud Platform integration'
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
		name: 'Delta Components',
		draft: true,
		video: '/projects/delta-demo.mp4',
		image: '/projects/delta-poster.jpg',
		url: 'https://deltacomponents.dev',
		description:
			'High-performance components registry built on top of shadcn/ui. From AI chat interfaces to interactive media. Copy, paste, and own the code'
	},
	{
		name: 'Jigsaw Presents',
		image: '/projects/jigsaw-presents.webp',
		url: 'https://www.youtube.com/channel/UCx8iHEGQMyeInLgPQ81-EJA?sub_confirmation=1',
		description: 'Video essays exploring trending films, television, gaming, and music'
	},
	{
		name: 'Monty',
		// TODO: replace the placeholder description with your own copy.
		image: '/projects/monty-preview.webp',
		url: 'https://monty.so',
		description: 'TODO: one-line description of Monty'
	},
	{
		name: 'Lotso',
		draft: true,
		// TODO: replace the placeholder description and url with your own copy.
		video: '/projects/lotso.mp4',
		image: '/projects/lotso-poster.jpg',
		url: 'https://x.com/konstipaulus/status/2066534707496444317',
		description: 'TODO: one-line description of Lotso'
	},
	{
		name: 'Doto',
		draft: true,
		// TODO: real preview, description, and url. Splash artwork stands in.
		image: '/projects/doto.svg',
		url: '#',
		description: 'TODO: one-line description of Doto'
	},
	{
		name: 'Patrick Prunty on Substack',
		draft: true,
		// TODO: real preview image. Splash artwork stands in.
		image: '/projects/substack.svg',
		url: 'https://pprunty.substack.com',
		description: 'Essays and notes, sent by email when they are written'
	},
	{
		name: 'Yoshi Notebooks',
		draft: true,
		// TODO: real preview image. Splash artwork stands in.
		image: '/projects/yoshi.svg',
		url: 'https://yoshinotebooks.com',
		description:
			'Yoshi is a native, GPU-rendered Jupyter notebook desktop app for macOS and Linux, built in Rust on GPUI'
	}
];

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
	projects,
	/**
	 * Display toggles for the two visitor counters. Both keep recording either
	 * way — turning one off hides the number, it does not stop the tracking or
	 * lose the history behind it.
	 */
	show: {
		/** The view count beside a post's date. */
		postViews: false,
		/** The footer's last-visitor location and unique visitor total. */
		visitors: false,
		/** The `Go back` link above a post's title. */
		postBackLink: false
	},
	relatedSites: [
		'deltacomponents.dev',
		'monty.so',
		'x.com/pprunty_',
		'github.com/pprunty',
		'linkedin.com/in/patrickprunty',
		'strava.com/athletes/72636452'
	]
} as const;

export type SiteConfig = typeof site;
