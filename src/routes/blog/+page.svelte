<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import EntryList from '$lib/components/entry-list.svelte';
	import Subscribe from '$lib/components/subscribe.svelte';
	import Seo from '$lib/components/seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const entries = $derived(
		data.posts.map((post) => ({
			href: `/blog/${post.slug}`,
			title: post.title,
			description: post.description,
			preview: post.image
		}))
	);
</script>

<Seo title="Blog" path="/blog" description="Essays on work, life, and the occasional adventure." />

<EditorialPage>
	<EntryList tagline="Essays on work, life, and the occasional adventure." {entries} />
	<article>
		<section class="cols">
			<div><Subscribe /></div>
		</section>
	</article>
</EditorialPage>
