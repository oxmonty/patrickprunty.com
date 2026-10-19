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
		name: 'Delta Components',
		image: '/projects/delta-poster.webp',
		url: 'https://deltacomponents.dev',
		description:
			'A curated collection of UI components built with TypeScript. Free and open source via the shadcn registry.'
	},
	{
		name: 'Jigsaw Presents',
		image: '/projects/jigsaw-presents.webp',
		url: 'https://www.youtube.com/channel/UCx8iHEGQMyeInLgPQ81-EJA?sub_confirmation=1',
		description: 'Video essays exploring trending films, television, gaming, and music'
	}
];

export const site = {
	name: 'Patrick Prunty',
	domain: 'patrickprunty.com',
	url,
	description: 'Software engineer and writer',
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
		substack: 'https://pprunty.substack.com',
		/** The publication's subscribe endpoint, which the form posts to. */
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
