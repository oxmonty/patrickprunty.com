<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import EntryList from '$lib/components/entry-list.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { site } from '$lib/config/site';

	// Projects link out, so their href is the project's own site.
	const entries = site.projects.map((project) => ({
		href: project.url,
		title: project.name,
		description: project.description,
		image: project.image,
		video: 'video' in project ? project.video : undefined
	}));
</script>

<Seo title="Projects" path="/projects" description="Things I've built and maintain." />

<EditorialPage>
	<EntryList tagline="Things I've built and maintain." {entries} />
</EditorialPage>
