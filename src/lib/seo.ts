import { site } from '$lib/config/site';

export function absoluteUrl(path: string): string {
	return new URL(path, site.url).href;
}

/**
 * Address of a page's OpenGraph card. Mirrors the page's own path, with 'home'
 * standing in for the root, which has no segment of its own. The card route
 * generates exactly these paths — keep the two in step.
 */
export function ogPath(path: string): string {
	const segment = path.replace(/^\/|\/$/g, '');
	return `/og/${segment || 'home'}.png`;
}

export interface SeoInput {
	title?: string;
	description?: string;
	/** Path or absolute URL. Defaults to the site OG image. */
	image?: string;
	/** Path or absolute URL of the page itself, for the canonical link. */
	path?: string;
	type?: 'website' | 'article';
	authors?: string[];
	keywords?: string[];
	publishedTime?: string;
	modifiedTime?: string;
	noindex?: boolean;
}

export interface Seo extends Required<Omit<SeoInput, 'publishedTime' | 'modifiedTime'>> {
	canonical: string;
	/** True when `image` is the card drawn at build time, whose size we know. */
	generatedImage: boolean;
	publishedTime?: string;
	modifiedTime?: string;
}

/**
 * Title template: a page renders as "Patrick Prunty \\ Page", the site root as
 * the bare name. One place, so every route reads the same way in a tab strip.
 */
export function buildSeo(input: SeoInput = {}): Seo {
	const description = input.description ?? site.description;
	// An explicit image wins; everything else gets the card built for it at
	// build time, so no page falls back to the bare site icon.
	const generatedImage = !input.image;
	const image = absoluteUrl(input.image ?? ogPath(input.path ?? '/'));

	return {
		title: input.title ? `${site.name} \\ ${input.title}` : site.name,
		description,
		image,
		path: input.path ?? '/',
		canonical: absoluteUrl(input.path ?? '/'),
		generatedImage,
		type: input.type ?? 'website',
		authors: input.authors ?? [site.author.name],
		keywords: input.keywords ?? [],
		noindex: input.noindex ?? false,
		publishedTime: input.publishedTime,
		modifiedTime: input.modifiedTime
	};
}
