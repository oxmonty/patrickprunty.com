<script lang="ts">
	import { onMount } from 'svelte';

	import { cn } from '$lib/utils';
	import Skeleton from './skeleton.svelte';

	let { url, class: className = '' }: { url: string; class?: string } = $props();

	interface OgData {
		title: string | null;
		description: string | null;
		image: string | null;
		domain: string;
	}

	/**
	 * One request per URL per page load, shared by every card pointing at it.
	 * Rejections are kept too, so a dead link fails instantly for the rest of the
	 * session instead of re-queuing a round trip on every remount.
	 */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a plain request cache; nothing renders from it
	const requests = new Map<string, Promise<OgData>>();

	function loadOg(target: string): Promise<OgData> {
		let pending = requests.get(target);
		if (!pending) {
			pending = fetch(`/api/og?url=${encodeURIComponent(target)}`).then((response) =>
				response.ok ? (response.json() as Promise<OgData>) : Promise.reject(response.status)
			);
			requests.set(target, pending);
		}
		return pending;
	}

	// Client-only: /api/og is a relative URL, which SSR cannot resolve, and the
	// preview is an enhancement over the link that is already rendered below.
	let data = $state<OgData | null>(null);
	let failed = $state(false);
	let imageFailed = $state(false);

	const domain = $derived.by(() => {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	});

	let loading = $state(true);

	onMount(async () => {
		try {
			data = await loadOg(url);
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	});
</script>

<!-- Always an anchor first: if the metadata never arrives, the link survives. -->
<a
	href={url}
	target="_blank"
	rel="noopener noreferrer"
	class={cn(
		'not-prose my-6 block overflow-hidden border border-border no-underline transition-colors hover:bg-muted/50',
		className
	)}
>
	{#if data}
		{#if data.image && !imageFailed}
			<img
				src={data.image}
				alt=""
				loading="lazy"
				class="aspect-[1.91/1] w-full bg-muted object-contain"
				onerror={() => (imageFailed = true)}
			/>
		{/if}
		<div class="flex flex-col gap-1 p-4">
			<span class="text-xs tracking-wide text-muted-foreground uppercase">{data.domain}</span>
			{#if data.title}
				<span class="leading-snug font-medium text-foreground">{data.title}</span>
			{/if}
			{#if data.description}
				<span class="line-clamp-2 text-sm text-muted-foreground">{data.description}</span>
			{/if}
		</div>
	{:else if loading && !failed}
		<Skeleton class="h-40 w-full rounded-none" />
		<div class="p-4 text-sm text-muted-foreground">{domain}</div>
	{:else}
		<div class="flex flex-col gap-1 p-4">
			<span class="text-xs tracking-wide text-muted-foreground uppercase">{domain}</span>
			<span class="text-sm break-all text-foreground">{url}</span>
		</div>
	{/if}
</a>
