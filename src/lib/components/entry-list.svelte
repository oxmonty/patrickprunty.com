<script lang="ts">
	import { previewPlayback } from '$lib/actions/preview-playback';
	import { revealOnLoad } from '$lib/actions/reveal-on-load';
	import DraftBadge from '$lib/components/draft-badge.svelte';

	/**
	 * The listing body shared by /blog, /code, and /projects. Entries arrive with
	 * their href already resolved, so the same component serves internal post
	 * links and external project links without branching.
	 */
	export interface Entry {
		href: string;
		title: string;
		description: string;
		/** When present, a preview image sits above the title. */
		image?: string;
		/** Takes precedence over `image`: an autoplaying, muted loop. */
		video?: string;
		/** Revealed on title hover rather than shown inline. Desktop only. */
		preview?: string;
		/** Unpublished. Reaches the listing in dev only. */
		draft?: boolean;
	}

	let { tagline, entries }: { tagline: string; entries: Entry[] } = $props();

	/**
	 * Derived rather than configured: project entries point at other sites and
	 * open in a new tab, post entries stay in this one. Placeholder hrefs like
	 * '#' correctly read as internal, so they never spawn a blank tab.
	 */
	const isExternal = (href: string) => /^https?:\/\//.test(href);

	/**
	 * Title-hover preview, positioned at the pointer rather than in the layout.
	 * A single fixed element is reused by every entry — pinning one per entry
	 * would reserve space in the listing and reflow it.
	 */
	let preview = $state<{ src: string; x: number; y: number } | null>(null);

	/** Offset so the image never sits under the cursor itself. */
	const OFFSET = 20;

	function track(event: MouseEvent, src: string) {
		preview = { src, x: event.clientX + OFFSET, y: event.clientY + OFFSET };
	}
</script>

<article>
	<div class="article-intro">
		<h2>{tagline}</h2>
	</div>

	<section class="cols">
		{#each entries as entry (entry.title)}
			<div>
				{#if entry.video}
					<!-- Decorative here: the title below names the entry. -->
					<a
						href={entry.href}
						class="preview"
						tabindex="-1"
						aria-hidden="true"
						target={isExternal(entry.href) ? '_blank' : undefined}
						rel={isExternal(entry.href) ? 'noopener noreferrer' : undefined}
					>
						<!--
							No `autoplay` attribute: the action decides, so touch devices autoplay
							and pointer devices wait for hover. Driving it from JS avoids a frame
							of playback before the pointer case is told to stop. preload="none"
							means the file is not fetched until it plays — the poster carries the
							tile until then. playsinline stops iOS taking it fullscreen.
						-->
						<video
							src={entry.video}
							poster={entry.image}
							muted
							loop
							playsinline
							preload="none"
							use:previewPlayback
							use:revealOnLoad
						></video>
					</a>
				{:else if entry.image}
					<a
						href={entry.href}
						class="preview"
						tabindex="-1"
						aria-hidden="true"
						target={isExternal(entry.href) ? '_blank' : undefined}
						rel={isExternal(entry.href) ? 'noopener noreferrer' : undefined}
					>
						<img src={entry.image} alt="" loading="lazy" use:revealOnLoad />
					</a>
				{/if}
				<h3>
					<a
						href={entry.href}
						target={isExternal(entry.href) ? '_blank' : undefined}
						rel={isExternal(entry.href) ? 'noopener noreferrer' : undefined}
						aria-label={isExternal(entry.href) ? `${entry.title} (opens in a new tab)` : undefined}
						onmouseenter={(event) => entry.preview && track(event, entry.preview)}
						onmousemove={(event) => entry.preview && track(event, entry.preview)}
						onmouseleave={() => (preview = null)}
						>{entry.title}{#if isExternal(entry.href)}<span
								aria-hidden="true"
								class="external-arrow">&#8599;</span
							>{/if}</a
					>{#if entry.draft}<DraftBadge />{/if}
				</h3>

				<p class="entry-description">
					{entry.description}
					<a
						href={entry.href}
						target={isExternal(entry.href) ? '_blank' : undefined}
						rel={isExternal(entry.href) ? 'noopener noreferrer' : undefined}
						aria-label={isExternal(entry.href)
							? `${entry.title} (opens in a new tab)`
							: `Continue reading: ${entry.title}`}
					>
						<!--
							Drawn rather than typed: the long-arrow glyph (⟶) is missing from the
							SF Pro stack and would silently fall back to another font at a
							different weight. 1.5px stroke matches the 400-weight text beside it.
						-->
						<svg
							class="read-more"
							viewBox="0 0 22 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M1 8h19" />
							<path d="M13 2l6 6-6 6" />
						</svg>
					</a>
				</p>
			</div>
		{:else}
			<div>
				<p>Nothing here yet.</p>
			</div>
		{/each}
	</section>
</article>

{#if preview}
	<!-- Decorative: it mirrors the title the pointer is already on. -->
	<img
		class="cursor-preview"
		src={preview.src}
		alt=""
		aria-hidden="true"
		style="left: {preview.x}px; top: {preview.y}px"
	/>
{/if}

<style>
	/*
	 * Follows the pointer rather than sitting in the listing, so it reserves no
	 * space and cannot reflow the entries. Touch devices never fire these mouse
	 * events, and pointer-events: none stops it stealing the hover it depends on.
	 */
	.cursor-preview {
		position: fixed;
		z-index: 10;
		width: 14rem;
		max-width: 40vw;
		pointer-events: none;
		/* Square regardless of the source asset, so every title hover shows the
		   same tile rather than the listing jumping between portrait and
		   landscape. */
		aspect-ratio: 1;
		object-fit: cover;
	}

	/* Touch devices synthesise a mouseenter on tap, which would flash the preview
	   next to the finger before the navigation. There is no hover to preview. */
	@media (hover: none) {
		.cursor-preview {
			display: none;
		}
	}

	/*
	 * Sized in em so the arrow tracks the paragraph it trails, and shifted down a
	 * hair because the crossbar sits above the text baseline when centred
	 * geometrically.
	 */
	/*
	 * The image is the entry's title, so it gets the space a heading would have
	 * had. `block` kills the inline-image baseline gap that would otherwise show
	 * as a stripe of link underline beneath it.
	 */
	/*
	 * The same 500 the markdown headings sit at, so a listing title and a heading
	 * inside a post read as one rank. Scoped under .cols so it outranks the
	 * global `.editorial h3` rule on specificity rather than relying on
	 * stylesheet order. SF Pro ships a real Medium, so this is an actual cut, not
	 * a synthesised bold.
	 */
	.cols h3 {
		font-weight: 500;
	}

	.preview {
		display: block;
		margin-bottom: 0.6rem;
		text-decoration: none;
	}

	/*
	 * One ratio for every preview, so the tiles line up regardless of what the
	 * source asset happens to be. Only /projects renders these — blog and code
	 * pass `preview` for the cursor tile instead, never `image` or `video`.
	 *
	 * Every source is wider than 3/2 (1.50 for biscuit, 1.59 for the webp
	 * screenshots, 1.65 for delta, 1.78 for lotso), so `cover` only ever trims
	 * the sides. Nothing loses its top or bottom edge.
	 */
	.preview img,
	.preview video {
		opacity: 0;
		transition: opacity 400ms ease-out;
		display: block;
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
	}

	.preview :global(.is-loaded) {
		opacity: 1;
	}

	/* A fade is decoration; anyone asking for less motion just gets the media. */
	@media (prefers-reduced-motion: reduce) {
		.preview img,
		.preview video {
			opacity: 1;
			transition: none;
		}
	}

	/*
	 * Same native glyph the footer uses. Decorative: the link already announces
	 * that it opens in a new tab through its own accessible name.
	 */
	.external-arrow {
		display: inline-block;
		margin-left: 0.1em;
		font-size: 0.85em;
		vertical-align: 0.06em;
	}

	/* Secondary to the title above it, at the site's one muted step. */
	.entry-description {
		color: var(--ink-muted);
	}

	/* The continue-reading link stays at full strength — it is the action in the
	   entry, not part of the description it trails. */
	.entry-description a {
		color: var(--ink);
	}

	.read-more {
		display: inline-block;
		width: 1.375em;
		height: 1em;
		vertical-align: -0.15em;
		/* text-decoration does not apply to an SVG, so the rule is drawn instead.
		   0.1em keeps it clear of the arrowhead's lower stroke. */
		border-bottom: 1px solid currentColor;
		padding-bottom: 0.1em;
	}
</style>
