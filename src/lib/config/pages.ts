import { site } from './site';

/**
 * The fixed pages, in one place: each page's `<Seo>`, the tagline it renders as
 * its title, and the OpenGraph card built for it at build time all read from
 * here, so a card can never describe a page differently from the page itself.
 *
 * Posts are not listed — their copy comes from their own frontmatter.
 */
export interface PageMeta {
	/** Route path, and the key the OG card is generated under. */
	path: string;
	/** Absent on the site root, which renders as the bare site name. */
	title?: string;
	description: string;
}

export const PAGES: PageMeta[] = [
	{ path: '/', description: site.description },
	{
		path: '/blog',
		title: 'Blog',
		description: 'Essays on work, life, and the occasional adventure.'
	},
	{ path: '/code', title: 'Code', description: 'Notes on building things for the web.' },
	{ path: '/projects', title: 'Projects', description: 'Things I build and maintain.' }
];

export function pageMeta(path: string): PageMeta {
	return PAGES.find((page) => page.path === path) ?? PAGES[0];
}
