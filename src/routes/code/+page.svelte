<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import EntryList from '$lib/components/entry-list.svelte';
	import Seo from '$lib/components/seo.svelte';
	import Subscribe from '$lib/components/subscribe.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const entries = $derived(
		data.posts.map((post) => ({
			href: `/code/${post.slug}`,
			title: post.title,
			description: post.description,
			preview: post.image
		}))
	);
</script>

<Seo title="Code" path="/code" description="Notes on building things for the web." />

<EditorialPage>
	<EntryList tagline="Notes on building things for the web." {entries} />
	<article>
		<section class="cols">
			<div><Subscribe /></div>
		</section>
	</article>
</EditorialPage>
