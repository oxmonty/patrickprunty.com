<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import Seo from '$lib/components/seo.svelte';

	/** Back if there is somewhere to go back to, home otherwise. */
	function goBack() {
		if (history.length > 1) history.back();
		else location.assign('/');
	}
</script>

<Seo title="Not found" path="/" description="Page not found or moved." />

<!--
	Deliberately outside the site chrome: there is no header or footer here, so a
	dead end offers a way out rather than a full navigation surface. `editorial`
	still carries the site's type and link treatment.
-->
<main class="editorial not-found">
	<img src="/images/Pokeeball.webp" alt="" width="240" height="240" />

	<h1>{page.status} &mdash; {page.error?.message ?? 'Page not found or moved'}</h1>

	<nav>
		<button type="button" onclick={goBack}>Go back</button>
		<a href={resolve('/')}>Home</a>
	</nav>
</main>

<style>
	.not-found {
		display: flex;
		min-height: 100svh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.4rem;
		text-align: center;
	}

	img {
		width: 240px;
		max-width: 60vw;
		height: auto;
	}

	/*
	 * The site has one type size, and rank comes from case and underline — so the
	 * title sits at 1rem in caps rather than as a display heading.
	 */
	h1 {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		text-decoration: underline;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.9rem;
	}

	/*
	 * Back moves through history rather than to a URL, so it is a button — but it
	 * reads as one of the links beside it.
	 */
	button {
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	button:hover {
		background-color: var(--highlight);
	}
</style>
