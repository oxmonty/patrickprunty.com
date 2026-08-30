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

	import DraftBadge from '$lib/components/draft-badge.svelte';
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import PostViews from '$lib/components/post-views.svelte';
	import Seo from '$lib/components/seo.svelte';
	import Subscribe from '$lib/components/subscribe.svelte';
	import { site } from '$lib/config/site';
	import type { Post } from '$lib/posts';

	// Frontmatter arrives as props. `image` is consumed by the listing (as the
	// hover preview) and by the feed, not by this page.
	let {
		children,
		title,
		description,
		date,
		draft
	}: {
		children: import('svelte').Snippet;
		title?: string;
		description?: string;
		date?: string;
		/** Frontmatter flag. The post is dropped from every listing in a build,
		    so the badge is only ever seen while developing. */
		draft?: boolean;
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
	 * An unquoted frontmatter date is YAML's date type, so this arrives as either
	 * a Date or a string depending on how it was written. Normalising here means
	 * the markup below never has to care which.
	 */
	const published = $derived(date ? new Date(date) : undefined);

	/*
	 * Pinned to UTC. The frontmatter names a day, not an instant, so resolving it
	 * in the reader's timezone would shift it a day either side of the date line
	 * and disagree with what the server rendered.
	 */
	const formatted = $derived(
		published?.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		})
	);

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

<!--
	`image` is listing artwork, not a card: every post unfurls with the OG card
	built for it at build time, so a hotlinked painting never stands in for one.
-->
<Seo {title} {description} path={page.url.pathname} type="article" publishedTime={date} />

<EditorialPage masthead="p">
	<article>
		<div class="article-intro">
			<!--
				Above the title, mirroring where the browser's own back button sits.
				Named for its destination rather than "go back", so it is predictable
				before the click. U+2347 mirrors the U+2348 on the subscribe button;
				it is decorative, and aria-label carries the fuller phrasing while
				keeping the visible word inside the accessible name.
			-->
			<p class="go-back">
				<a href="/{section}" aria-label="Back to {section}"
					><span aria-hidden="true" class="arrow">⍇</span>{section}</a
				>
			</p>
			<h1>{title}{#if draft}<DraftBadge />{/if}</h1>
			<!-- PostViews is what records the view, so it mounts whether or not it
			     renders anything and whether or not the post carries a date. -->
			<p class="post-meta">
				{#if published}<time datetime={published.toISOString().slice(0, 10)}>{formatted}</time
					>{/if}<PostViews />
			</p>
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
				Or, get updates <a href="/rss.xml">via RSS</a>{#if random}, read
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

	/* Set below body copy and softened, so it reads as a caption to the title
	   rather than as the first line of the post. */
	.post-meta {
		margin: 1rem 0 0;
		font-size: 0.85rem;
		color: var(--muted-foreground);
	}

	/* Reads as a post title, matching the listing and the page title above it. */
	/* Caps to sit with the `Next up` heading below it, which .editorial
	   uppercases; this is a link rather than a heading, so it takes the
	   treatment without claiming the semantics. */
	/*
	 * The rule is drawn as a border rather than left to text-decoration, which
	 * does not carry across the arrow — the same reason the listing's read-more
	 * arrow draws its own. One continuous line under the glyph, the gap, and the
	 * word.
	 */
	.go-back a {
		text-decoration: none;
		border-bottom: 1px solid currentColor;
	}

	/* First thing in the intro, so it takes no top margin; the gap below sets it
	   off from the title. */
	.go-back {
		margin-top: 0;
		/* Space rather than a muted colour to set it back from the title: the
		   editorial layer builds hierarchy from whitespace, and dimming it would
		   work against a link whose whole job is being easy to find. */
		margin-bottom: 3rem;
		text-transform: uppercase;
	}

	/* Mirrors subscribe's own .arrow, with the margin on the other side since the
	   glyph leads here rather than trails. */
	.arrow {
		display: inline-block;
		margin-right: 0.35em;
	}

	.next-title {
		font-weight: 500;
		text-transform: uppercase;
	}

	/* The chrome h3 rule still underlines; post headings dropped that. */
	.post-end h3 {
		text-decoration: none;
	}
</style>
