<script lang="ts">
	import { dev } from '$app/environment';

	import EditorialPage from '$lib/components/editorial-page.svelte';
	import EntryList from '$lib/components/entry-list.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { pageMeta } from '$lib/config/pages';
	import { site } from '$lib/config/site';

	// Projects link out, so their href is the project's own site.
	// Same rule the posts use: drafts are readable while developing and absent
	// from a build.
	const entries = site.projects
		.filter((project) => dev || !project.draft)
		.map((project) => ({
			href: project.url,
			title: project.name,
			description: project.description,
			image: project.image,
			video: project.video,
			draft: project.draft
		}));

	const meta = pageMeta('/projects');
</script>

<Seo title={meta.title} path={meta.path} description={meta.description} />

<EditorialPage>
	<EntryList tagline={meta.description} {entries} />
</EditorialPage>
