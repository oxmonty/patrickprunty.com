<script lang="ts">
	import { resolve } from '$app/paths';

	import { site } from '$lib/config/site';

	let { children }: { children: import('svelte').Snippet } = $props();

	const FOUNDED = 2024;
	const currentYear = new Date().getFullYear();
</script>

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

<main class="editorial">
	<header>
		<section class="cols">
			<div>
				<h1>
					<a href={resolve('/')} rel="home">{site.name}</a>
					(<a href={resolve('/about')}>Info.</a>)
				</h1>
			</div>
			<div>
				<nav>
					<a href={resolve('/blog')}>Blog</a>,
					<a href={resolve('/code')}>Code</a>,
					<a href={resolve('/projects')}>Projects</a>
				</nav>
			</div>
		</section>
	</header>

	{@render children()}

	<footer>
		<section class="cols">
			<div>
				<nav>
					{@render external(site.links.github, 'GitHub')} &middot;
					{@render external(site.links.substack, 'Substack')} &middot;
					{@render external(site.links.twitter, 'X')}
				</nav>
			</div>
			<div>&copy; {FOUNDED}&mdash;{currentYear} {site.name}</div>
		</section>
	</footer>
</main>

<style>
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
