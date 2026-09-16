import { site } from '$lib/config/site';

export function absoluteUrl(path: string): string {
	return new URL(path, site.url).href;
}

export const SITE_IMAGE = '/images/og.png';

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
	/** True when `image` is the site card, whose size we know. */
	siteImage: boolean;
	publishedTime?: string;
	modifiedTime?: string;
}

/**
 * Title template: a page renders as "Patrick Prunty \\ Page", the site root as
 * the bare name. One place, so every route reads the same way in a tab strip.
 */
export function buildSeo(input: SeoInput = {}): Seo {
	const description = input.description ?? site.description;
	const siteImage = !input.image;
	const image = absoluteUrl(input.image ?? SITE_IMAGE);

	return {
		title: input.title ? `${site.name} \\ ${input.title}` : site.name,
		description,
		image,
		path: input.path ?? '/',
		canonical: absoluteUrl(input.path ?? '/'),
		siteImage,
		type: input.type ?? 'website',
		authors: input.authors ?? [site.author.name],
		keywords: input.keywords ?? [],
		noindex: input.noindex ?? false,
		publishedTime: input.publishedTime,
		modifiedTime: input.modifiedTime
	};
}
