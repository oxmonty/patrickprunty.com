<script module lang="ts">
	// Element overrides are per-layout in mdsvex, so this repeats the default
	// layout's registry. The component registry itself is injected by the
	// preprocessor and needs nothing here.
	export { default as img } from './zoom-image.svelte';
	export { default as code } from './inline-code.svelte';
	export { default as CodeBlock } from './code-block.svelte';
</script>

<script lang="ts">
	import { page } from '$app/state';

	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';
	import Subscribe from '$lib/components/subscribe.svelte';
	import { site } from '$lib/config/site';
	import type { Post } from '$lib/posts';

	// Frontmatter arrives as props; the rest of it (description, date) is read by
	// the index loader, not rendered here.
	let {
		children,
		title,
		description,
		date,
		image
	}: {
		children: import('svelte').Snippet;
		title?: string;
		description?: string;
		date?: string;
		image?: string;
	} = $props();

	/*
	 * The section's own posts, newest first, loaded by src/routes/<section>/
	 * +layout.ts. Reading them here rather than per post keeps every markdown
	 * file free of navigation concerns.
	 */
	const section = $derived(page.url.pathname.split('/')[1] ?? '');
	const posts = $derived(((page.data as { posts?: Post[] }).posts ?? []) as Post[]);
	const current = $derived(posts.findIndex((post) => page.url.pathname.endsWith(`/${post.slug}`)));

	/** Wraps to the newest post, so the oldest one is still a way onward. */
	const next = $derived(posts.length > 1 ? posts[(current + 1) % posts.length] : undefined);

	const others = $derived(posts.filter((_, index) => index !== current));

	/*
	 * Server-rendered as the first other post so the link works with no
	 * JavaScript, then overwritten with a real pick on mount — randomising during
	 * render instead would make the server and client disagree about the href.
	 */
	let random = $derived(others[0]);
	$effect(() => {
		random = others[Math.floor(Math.random() * others.length)];
	});
</script>

<Seo {title} {description} {image} path={page.url.pathname} type="article" publishedTime={date} />

<EditorialPage>
	<article>
		<div class="article-intro">
			<h2>{title}</h2>
		</div>

		<div class="prose-editorial prose max-w-none prose-neutral dark:prose-invert">
			{@render children()}
		</div>

		<aside class="post-end">
			{#if next}
				<h3>Next up</h3>
				<p class="next-title"><a href="/{section}/{next.slug}">{next.title}</a></p>
			{/if}

			<p>
				Or, explore <a href="/{section}">the archive</a>, get updates
				<a href="/rss.xml">via RSS</a>{#if random}, read
					<a href="/{section}/{random.slug}">a random post</a>{/if}, or
				<a href="mailto:{site.author.email}">send me an email</a>.
			</p>

			<Subscribe />
		</aside>
	</article>
</EditorialPage>

<style>
	/* Same measure the prose column uses, so the form lines up with the text it
	   follows rather than running the full width of the article. */
	.post-end {
		margin-top: 6rem;
		max-width: 42rem;
	}

	@media screen and (min-width: 1024px) {
		.post-end {
			max-width: 50%;
		}
	}

	/* Reads as a post title, matching the listing and the page title above it. */
	.next-title {
		font-weight: 500;
		text-transform: uppercase;
	}

	/* The chrome h3 rule still underlines; post headings dropped that. */
	.post-end h3 {
		text-decoration: none;
	}
</style>
