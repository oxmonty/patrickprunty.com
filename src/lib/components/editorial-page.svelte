<script lang="ts">
	// Lucide has no two-bar menu glyph; `equal` is exactly that shape — two full
	// width rules at the same spacing — so it stands in rather than hand-rolling
	// an SVG and losing the set's sizing and stroke conventions.
	import Menu from '@lucide/svelte/icons/equal';
	import X from '@lucide/svelte/icons/x';

	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	import LastVisitor from '$lib/components/last-visitor.svelte';
	import UniqueVisitors from '$lib/components/unique-visitors.svelte';
	import { site } from '$lib/config/site';

	let {
		children,
		/*
		 * The site name is the page's heading everywhere except on a post, where
		 * the post's own title has to be the h1 — reader modes and search engines
		 * both read the article's heading from it, and a masthead standing in for
		 * it makes every post look like it is titled with the site name.
		 */
		masthead = 'h1'
	}: { children: import('svelte').Snippet; masthead?: 'h1' | 'p' } = $props();

	/*
	 * <details> holds itself open across a client-side navigation — the DOM node
	 * survives, so tapping a section would otherwise leave the menu covering the
	 * page you just asked for.
	 */
	let indexOpen = $state(false);
	afterNavigate(() => {
		indexOpen = false;
	});

	const FOUNDED = 2024;
	const currentYear = new Date().getFullYear();
</script>

{#snippet navLink(href: string, label: string, className = '')}
	<!--
		A section stays current for its posts too, so /blog/some-post still marks
		Blog. Home is the exception: it is a prefix of every path on the site, so
		it has to match exactly or it would mark itself current everywhere.

		Nothing renders aria-current visually today; it is here so a screen reader
		still announces which section the reader is in.
	-->
	{@const current =
		href === resolve('/') ? page.url.pathname === href : page.url.pathname.startsWith(href)}
	<a {href} class={className} aria-current={current ? 'page' : undefined}>{label}</a>
{/snippet}

{#snippet external(href: string, label: string)}
	<!--
		The arrow is the conventional off-site marker, so it is decorative and the
		new-tab note lives in the accessible name instead — a screen reader would
		otherwise announce "north east arrow" and still not mention the tab change.
	-->
	<a {href} target="_blank" rel="noopener noreferrer" aria-label="{label} (opens in a new tab)"
		>{label}<span aria-hidden="true" class="external-arrow">&#8599;</span></a
	>
{/snippet}

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') indexOpen = false;
	}}
/>

<a class="skip-link" href="#content">Skip to content</a>

<main class="editorial">
	<header class="nav-bar">
		<section class="cols">
			<div>
				<svelte:element this={masthead} class="masthead">
					<a
						href={resolve('/')}
						rel="home"
						aria-current={page.url.pathname === resolve('/') ? 'page' : undefined}>{site.name}</a
					>
				</svelte:element>
			</div>
			<div>
				<!-- Two navs on the page, so each says which one it is. -->
				<nav aria-label="Primary">
					{@render navLink(resolve('/blog'), 'Blog')}
					{@render navLink(resolve('/code'), 'Code')}
					{@render navLink(resolve('/projects'), 'Projects')}
				</nav>
				<!--
					The mobile bar, wrapped so the pair shows and hides as one.

					<details> rather than a button plus state: the UA already owns the
					toggle, the aria-expanded, and the keyboard, and the menu still opens
					if the JS never arrives — which matters here, because the nav above
					is display:none at this width and this is the only way through.
				-->
				<details class="index nav-mobile" bind:open={indexOpen}>
					<!--
						The icon is the whole control, so the name has to be supplied
						rather than read from the text inside. <summary> reports its own
						expanded state to assistive tech, so the label stays put and only
						the glyph changes.
					-->
					<summary class="nav-index" aria-label="Index">
						{#if indexOpen}
							<X size={30} strokeWidth={1.5} aria-hidden="true" />
						{:else}
							<Menu size={30} strokeWidth={1.5} aria-hidden="true" />
						{/if}
					</summary>
					<div class="index-menu">
						<nav aria-label="Sections">
							<ul>
								<li>{@render navLink(resolve('/'), 'About', 'not-prose')}</li>
								<li>{@render navLink(resolve('/blog'), 'Blog', 'not-prose')}</li>
								<li>{@render navLink(resolve('/code'), 'Code', 'not-prose')}</li>
								<li>{@render navLink(resolve('/projects'), 'Projects', 'not-prose')}</li>
							</ul>
						</nav>
					</div>
				</details>
			</div>
		</section>
	</header>

	<!-- tabindex="-1" so the skip link moves focus here, not just the scroll. -->
	<div id="content" tabindex="-1" inert={indexOpen}>
		{@render children()}
	</div>

	<footer inert={indexOpen}>
		<section class="cols">
			<div>
				<nav aria-label="Elsewhere">
					{@render external(site.links.github, 'GitHub')} &middot;
					{@render external(site.links.substack, 'Substack')} &middot;
					{@render external(site.links.twitter, 'X')}
				</nav>
				<!-- Build the site was cut from; shelved until it earns its place here.
				<span class="source"
					>(source
					<a
						href="{site.links.repo}/tree/{__GIT_HASH__}"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Browse the source at commit {__GIT_HASH__} (opens in a new tab)"
						>{__GIT_HASH__}</a
					>)</span
				>
				-->
			</div>
			<div>
				&copy; {FOUNDED}&mdash;{currentYear}
				{site.name}
				<LastVisitor />
				<UniqueVisitors />
			</div>
		</section>
	</footer>
</main>

<style>
	.nav-bar {
		padding-block: 0.4rem;
	}

	/*
	 * The desktop bar. No media query needed: this nav is display:none below
	 * 800px, so every rule here is desktop by construction.
	 *
	 * Flex with a gap rather than punctuation between the links — whitespace-only
	 * text between flex items is dropped, so the gap is the only thing setting
	 * the spacing and it stays even.
	 */
	nav[aria-label='Primary'] {
		display: flex;
		gap: 0.55rem;
		/* Matches .masthead's own line-height. Inheriting .editorial's 1.4 put
		   the nav's baseline below the masthead's across the bar. */
		line-height: 1;
	}

	/*
	 * Bare until hover. This is the treatment I argued against for the mobile
	 * bar, and the objection was specifically that touch has no hover state —
	 * here there is a pointer, so the affordance arrives when it is needed.
	 */
	nav[aria-label='Primary'] a {
		font-size: 1.05rem;
		text-decoration: none;
	}

	/*
	 * The section you are in keeps the underline the others only show on hover.
	 * aria-current is already on these links, so the cue is announced as well as
	 * drawn — it is not carried by appearance alone.
	 */
	nav[aria-label='Primary'] a:hover,
	nav[aria-label='Primary'] a[aria-current='page'] {
		text-decoration: underline;
	}

	/*
	 * The masthead reads as the fourth item in the bar, so it takes the sections'
	 * size and their bare-until-hover underline. Desktop only, and set on
	 * .nav-bar .masthead so it outranks layout.css's `.editorial .masthead`:
	 * below 800px there is no nav to align with, and the mobile masthead keeps
	 * the site-wide underline because touch has no hover to reveal one.
	 */
	@media screen and (min-width: 801px) {
		.nav-bar .masthead {
			font-size: 1.05rem;
		}

		.nav-bar .masthead a {
			text-decoration: none;
		}

		.nav-bar .masthead a:hover,
		.nav-bar .masthead a[aria-current='page'] {
			text-decoration: underline;
		}
	}

	/* Desktop shows the sections themselves, so the stand-in stays out. */
	.nav-mobile {
		display: none;
	}

	@media screen and (max-width: 800px) {
		/*
		 * Sticky on mobile only: on a phone the nav is otherwise a scroll back to
		 * the top, while on desktop it stays in view long enough not to need it.
		 * The bar carries its own background so content passes behind it rather
		 * than through it.
		 */
		.nav-bar {
			position: sticky;
			top: 0;
			/*
			 * Above the page-content band, which sits at 10: the code block's copy
			 * button and the listing's cursor preview both stack there, and a tie
			 * is broken by DOM order — so at 10 the header lost to everything
			 * below it. Under the skip link at 100, which outranks all of it.
			 */
			z-index: 20;
			/*
			 * Full-viewport background, not just the content box. .editorial pads
			 * the page by 1rem, but full-bleed media cancels that padding to reach
			 * the viewport edge — so a bar backgrounded only to its own box let the
			 * image scroll past in the 1rem strip down each side. The padding puts
			 * the content back where the margin took it.
			 */
			margin-inline: -1rem;
			padding-inline: 1rem;
			background-color: var(--paper);
		}

		/*
		 * .cols collapses to a single column at this width, which would stack
		 * Index under About. The bar wants them on one line, at either end.
		 */
		.nav-bar .cols {
			display: flex;
			/*
			 * Centred, not baseline-aligned: the icon box has no text in it, so its
			 * baseline is its bottom edge and aligning on it hangs the glyph low
			 * against the masthead. Centring matches the two optically instead.
			 */
			align-items: center;
			justify-content: space-between;
		}

		/*
		 * The section links only — named, not "every nav in the bar": the Index
		 * panel's own <nav> lives inside .nav-bar too, and an unqualified rule
		 * here emptied the menu.
		 */
		.nav-bar nav[aria-label='Primary'] {
			display: none;
		}

		.nav-mobile {
			display: block;
		}

		:global(html:has(.index[open])) {
			overflow: hidden;
		}

		/*
		 * No UA disclosure triangle; the icon is the affordance here. The padding
		 * takes the 26px glyph to roughly a 56px touch target, and the matching
		 * negative margin keeps that from moving the bar around — the box grows
		 * into the bar's own padding rather than pushing it open.
		 */
		.index summary {
			display: inline-flex;
			align-items: center;
			margin: -0.8rem;
			padding: 0.8rem;
			cursor: pointer;
			list-style: none;
			/*
			 * Optical, not geometric. align-items: center lines up the two boxes,
			 * but the masthead's box carries an underline and descenders that sit
			 * below its centre while the icon is centred in an empty box — which
			 * left the glyph reading 3px high against the text. Measured, not
			 * guessed.
			 */
			position: relative;
			top: 3px;
			/* Above .index-menu, so the X stays visible and clickable once the
			   panel has covered everything else in the bar. */
			z-index: 2;
		}

		/*
		 * Square ends. Lucide sets round caps and joins as presentation attributes
		 * on the <svg>; CSS outranks those, so this needs no prop plumbing through
		 * the icon component. :global because the element is rendered by Icon, not
		 * by this file, so it never receives the scoping class.
		 */
		.index summary :global(svg) {
			stroke-linecap: butt;
			stroke-linejoin: miter;
		}

		.index summary::-webkit-details-marker {
			display: none;
		}

		/*
		 * Drops from the bar rather than sitting under the word that opened it:
		 * the containing block is the sticky header, so left/right 0 spans the
		 * viewport and top: 100% lands it on the bar's lower edge. Being a child
		 * of the header also puts it in the header's stacking context, so it
		 * clears page content without a z-index of its own.
		 */
		/*
		 * Not laid out unless the menu is open. <details> hides its own contents,
		 * but newer WebKit does that with content-visibility on ::details-content,
		 * which keeps the box in layout — and an absolutely positioned box still
		 * contributes scrollable overflow. That left ~100dvh of black hanging
		 * below the footer on iOS, reachable by scrolling past the content.
		 */
		.index:not([open]) .index-menu {
			display: none;
		}

		.index-menu {
			/*
			 * Fixed to the viewport, not hung off the bar: the panel covers the
			 * whole screen including the masthead, so the menu is the only thing
			 * on it. The summary below is lifted above this so the close control
			 * survives the cover — without it the menu would have no way out but
			 * the keyboard.
			 */
			position: fixed;
			inset: 0;
			z-index: 1;
			/* Items sit well down the panel, clear of the X in the corner. */
			padding: 5rem 1rem 1rem;
			/* The page's own surface, so the panel reads as the site continuing
			   rather than a mode switch. Text colour is inherited. */
			background-color: var(--paper);
			/* Left, on the masthead's margin — the panel is its own page, so it
			   starts where every other line on the site starts. */
			text-align: left;
		}

		.index-menu ul {
			margin: 0;
			padding: 0;
			list-style: none;
		}

		/*
		 * The site's display size, the same one the page title takes at this
		 * width. Tight leading at that size runs the items together, so the gap
		 * between them is set here rather than left to line-height.
		 *
		 * No underline: at 3rem the site's link rule becomes a heavy bar under
		 * every word. The tap target is the whole line at this size, so nothing
		 * is lost by dropping it here.
		 */
		.index-menu li + li {
			margin-top: 1.15rem;
		}

		.index-menu a {
			display: block;
			font-size: 2.25rem;
			line-height: 1.1;
		}

		/*
		 * The section you are already in, dimmed to 50% of the way to full ink —
		 * around 4.2:1 on --paper, which still clears AA at this size while
		 * sitting clearly below the items that are worth tapping.
		 */
		.index-menu a[aria-current='page'] {
			color: color-mix(in oklab, var(--ink) 50%, var(--paper));
		}
	}

	/* Paired with the commented-out build line above: its own line, under the
	   links it belongs with.
	.source {
		display: block;
	}
	*/

	/*
	 * The native ↗ glyph rather than a drawn icon. It sits high and tight against
	 * the word, so a hair of leading space and a nudge put it on the same optical
	 * line as the text it follows.
	 */
	.external-arrow {
		display: inline-block;
		margin-left: 0.1em;
		font-size: 0.85em;
		vertical-align: 0.06em;
	}
</style>
