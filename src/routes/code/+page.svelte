<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import EntryList from '$lib/components/entry-list.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { pageMeta } from '$lib/config/pages';
	import Subscribe from '$lib/components/subscribe.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const entries = $derived(
		data.posts.map((post) => ({
			href: `/code/${post.slug}`,
			title: post.title,
			description: post.description,
			preview: post.image,
			draft: post.draft
		}))
	);

	const meta = pageMeta('/code');
</script>

<Seo title={meta.title} path={meta.path} description={meta.description} />

<EditorialPage>
	<EntryList tagline={meta.description} {entries} />
	<article>
		<section class="cols">
			<div><Subscribe /></div>
		</section>
	</article>
</EditorialPage>
