<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { site } from '$lib/config/site';
</script>

<Seo title="About" path="/about" description={site.description} />

<EditorialPage>
	<article>
		<div class="article-intro">
			<h2>Info.</h2>
		</div>

		<section class="cols">
			<div>
				<p>
					Software developer, writer, and occasional adventurer. I build things for the web and
					write about what I learn doing it.
				</p>
				<p>
					I write at <a href={site.links.substack}>Substack</a>, put code on
					<a href={site.links.github}>GitHub</a>, and occasionally post videos on
					<a href={site.links.youtube}>YouTube</a>.
				</p>
				<p>
					When I'm not at a keyboard I'm usually running, and logging it on
					<a href={site.links.strava}>Strava</a>.
				</p>

				<aside>
					<h3>Projects</h3>
					<p class="project-list">
						<!-- Same source as /projects, so the two can never drift apart. -->
						{#each site.projects as project (project.name)}<span
								><a href={project.url}>{project.name}</a></span
							>{/each}
					</p>
				</aside>

				<aside>
					<h3>Contact</h3>
					<p>Think I got something wrong? Want to build something? Let me know:</p>
					<p><a href="mailto:{site.author.email}">{site.author.email}</a></p>
				</aside>
			</div>

			<div class="mobile-first">
				<img src="/icon.webp" alt="Patrick Prunty" />
			</div>
		</section>
	</article>
</EditorialPage>

<style>
	/*
	 * Break between project names, never inside one. The separator carries an
	 * ordinary space so the line can wrap there, and each name is nowrap so a
	 * two-word title like "Delta Components" stays whole.
	 */
	/*
	 * Each name is nowrap so a two-word title like "Delta Components" never
	 * splits across lines. The separator is generated rather than written into
	 * the markup: Svelte trims literal whitespace and entities at element
	 * boundaries, so a plain space there disappears and an &nbsp; would forbid
	 * the very break we want. Generated content survives both, and its own
	 * `white-space: normal` makes its space the line's break opportunity.
	 */
	.project-list span {
		white-space: nowrap;
	}

	.project-list span + span::before {
		content: ', ';
		white-space: normal;
	}
</style>
