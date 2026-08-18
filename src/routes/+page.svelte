<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { groupByDay, prettyDay, type Note } from '$lib/notes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/*
	 * Only the client-fetched pages live in state. The first page stays derived
	 * from `data`, so the server renders it and a filter change replaces it for
	 * free — initialising state from a prop would freeze it at its first value.
	 */
	let appended = $state<Note[]>([]);
	let cursorOverride = $state<number | null | undefined>(undefined);
	let loading = $state(false);
	let failed = $state(false);
	let lastTag = $state<string | null | undefined>(undefined);

	const notes = $derived<Note[]>([...data.notes, ...appended]);
	const cursor = $derived(cursorOverride === undefined ? data.nextCursor : cursorOverride);
	const groups = $derived(groupByDay(notes));

	// Navigating to a different ?tag= must not append onto the old filter's feed.
	$effect(() => {
		if (lastTag !== data.tag) {
			lastTag = data.tag;
			appended = [];
			cursorOverride = undefined;
			failed = false;
		}
	});

	async function loadMore() {
		if (loading || cursor === null) return;
		loading = true;
		try {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- throwaway, nothing renders from it
			const params = new URLSearchParams({ cursor: String(cursor) });
			if (data.tag) params.set('tag', data.tag);
			const response = await fetch(`/api/notes?${params}`);
			if (!response.ok) throw new Error(String(response.status));
			const page = await response.json();
			appended = [...appended, ...page.notes];
			cursorOverride = page.nextCursor;
		} catch {
			// Stop paging rather than retry-looping against a failing endpoint.
			cursorOverride = null;
			failed = true;
		} finally {
			loading = false;
		}
	}

	/*
	 * One dialog for the whole feed rather than one per image: notes render as
	 * HTML strings, so there is nothing to mount a component into, and clicks
	 * are caught by delegation on the container instead.
	 */
	let lightbox = $state<HTMLDialogElement | null>(null);
	let zoomed = $state<{ src: string; alt: string } | null>(null);

	function openZoom(event: MouseEvent) {
		const button = (event.target as HTMLElement).closest('button.zoom');
		const image = button?.querySelector('img');
		if (!image) return;
		zoomed = { src: image.src, alt: image.alt };
		lightbox?.showModal();
	}

	/** Prefetches well before the sentinel is visible, so paging feels seamless. */
	function infiniteScroll(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) loadMore();
			},
			{ rootMargin: '1500px' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<Seo title="Notes" path="/" description="Short, dated notes. Links, embeds, and quick thoughts." />

<EditorialPage>
	<article>
		<div class="article-intro">
			<h2>Short, dated notes.</h2>
		</div>

		{#if data.tags.length}
			<nav class="tag-bar" aria-label="Filter notes by tag">
				<!-- All stays the leftmost reset; the selected tag leads the tags themselves. -->
				<a href="/" class:is-active={!data.tag} aria-current={data.tag ? undefined : 'page'}>All</a>
				{#each data.tags as { tag, count } (tag)}
					{#if data.tag === tag}
						<a href="/?tag={encodeURIComponent(tag)}" class="is-active" aria-current="page"
							>#{tag} ({count})</a
						>
					{/if}
				{/each}
				{#each data.tags as { tag, count } (tag)}
					{#if data.tag !== tag}
						<a href="/?tag={encodeURIComponent(tag)}">#{tag} ({count})</a>
					{/if}
				{/each}
			</nav>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<!-- Delegated so one dialog serves every note; the targets are real buttons. -->
		<div onclick={openZoom}>
			{#each groups as group (group.day)}
				<section class="day">
					<h3 class="day-heading">
						<a href="#{group.day}" id={group.day}>{prettyDay(group.day)}</a>
					</h3>

					<div class="notes">
						{#each group.notes as note, i (note.id)}
							<!-- Anchor mirrors v1: the day plus this note's position within it. -->
							<div class="note" id="{group.day}-{i + 1}">
								<div class="prose-editorial prose max-w-none prose-neutral dark:prose-invert">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised server-side in render-note.ts -->
									{@html note.html}
								</div>
								{#if note.tags.length}
									<p class="tags">
										{#each note.tags as tag (tag)}<a href="/?tag={encodeURIComponent(tag)}"
												>#{tag}</a
											>{/each}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{:else}
				<p>
					{#if data.tag}
						No notes tagged <strong>#{data.tag}</strong>. <a href="/">Show all</a>.
					{:else}
						No notes yet.
					{/if}
				</p>
			{/each}
		</div>

		{#if cursor !== null}
			<div use:infiniteScroll class="sentinel" aria-hidden="true"></div>
			<p class="status" role="status">{loading ? 'Loading older notes…' : ''}</p>
		{:else if failed}
			<p class="status">Could not load older notes.</p>
		{/if}
	</article>
</EditorialPage>

<!-- Native dialog gives the modal, focus trap, and Esc-to-close for free. -->
<dialog bind:this={lightbox} onclick={() => lightbox?.close()} class="lightbox">
	{#if zoomed}
		<img src={zoomed.src} alt={zoomed.alt} />
	{/if}
</dialog>

<style>
	.note :global(button.zoom) {
		display: block;
		width: 100%;
		cursor: zoom-in;
	}

	.note :global(button.zoom img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.lightbox {
		margin: auto;
		max-width: 95vw;
		max-height: 90dvh;
		background: transparent;
		border: none;
		padding: 0;
	}

	.lightbox::backdrop {
		background: rgb(0 0 0 / 0.8);
	}

	.lightbox img {
		max-width: 95vw;
		max-height: 90dvh;
		object-fit: contain;
		cursor: zoom-out;
	}

	/* Filter bar reads as a row of labels, so it drops the link underline. */
	.tag-bar {
		margin-bottom: 2.8rem;
		color: var(--ink-visited);
		font-size: 0.85em;
	}

	.tag-bar a,
	.tags a {
		text-decoration: none;
		white-space: nowrap;
	}

	/* Filters are controls, so they get real space rather than a word gap. */
	.tag-bar a {
		display: inline-block;
		margin-right: 0.9rem;
	}

	.tag-bar a:last-child {
		margin-right: 0;
	}

	/* Generated so the space survives: markup whitespace is trimmed here. */
	.tags a + a::before {
		content: '  ';
		white-space: normal;
	}

	/* The selected filter is the one thing here that gets full ink. */
	.tag-bar a.is-active {
		color: var(--ink);
		text-decoration: underline;
	}

	/*
	 * Hashtags inherit the green hover ground from `.editorial a:hover`; this
	 * adds the ink shift so the whole label lifts rather than only its ground.
	 */
	.tag-bar a:hover,
	.tags a:hover {
		color: var(--ink);
	}

	.day {
		margin-bottom: 4rem;
	}

	/* One step over body copy, matching the listing titles. */
	.day-heading {
		font-weight: 500;
	}

	/* The date is a label, not a title — same treatment as the aside headings. */
	.day-heading a {
		text-decoration: none;
	}

	.notes {
		margin-top: 1.4rem;
	}

	/*
	 * flow-root contains the note's floated media, so a tall image cannot spill
	 * past its own note — the separator below always sits under the image as
	 * well as the text. Notes read as a stream, so they are divided by a rule
	 * rather than boxed.
	 */
	.note {
		display: flow-root;
		padding-bottom: 1.4rem;
		margin-bottom: 1.4rem;
		border-bottom: 1px dashed var(--rule);
	}

	/* The rule separates notes, so the last one in a day has nothing to divide. */
	.note:last-child {
		padding-bottom: 0;
		margin-bottom: 0;
		border-bottom: none;
	}

	.tags {
		margin-top: 0.6rem;
		color: var(--ink-visited);
		font-size: 0.85em;
	}

	.sentinel {
		height: 1px;
	}

	.status {
		color: var(--ink-visited);
		font-size: 0.85em;
		min-height: 1.4em;
	}
</style>
