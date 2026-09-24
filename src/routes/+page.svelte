<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { pageMeta } from '$lib/config/pages';
	import { site } from '$lib/config/site';

	const meta = pageMeta('/');
</script>

<Seo path={meta.path} description={meta.description} />

<EditorialPage>
	<article>
		<div class="article-intro">
			<h2>About.</h2>
		</div>

		<section class="cols">
			<div>
				<p>
					Hi, I'm Patrick Prunty, a <a href="/code">software engineer</a> and
					<a href="/blog">writer</a>.
				</p>
				<p>
					I'm currently based in London, where I work at
					<a
						href="https://www.spotify.com"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Spotify (opens in a new tab)"
						>Spotify<span aria-hidden="true" class="external-arrow">&#8599;</span></a
					>, and I'm originally from Dublin, Ireland.
				</p>
				<p>
					Outside of work, I develop <a href="/projects">open-source projects</a>, compete in
					<a
						href={site.links.strava}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Endurance events on Strava (opens in a new tab)"
						>endurance events<span aria-hidden="true" class="external-arrow">&#8599;</span></a
					>, and explore different forms of creative digital media.
				</p>
				<p>
					If something you find here resonates with you or makes you think, feel free to reach out.
				</p>

				<!--
					Ported from v1: drawn as a CSS mask rather than an <img>, so the mark
					takes the page's ink colour instead of the SVG's hardcoded black.
				-->
				<div class="signature-row">
					<span class="signature" role="img" aria-label="Patrick Prunty's signature"></span>
				</div>
			</div>

			<div class="mobile-first">
				<img
					src="/portrait.svg"
					alt="Patrick Prunty"
					width="675"
					height="675"
					fetchpriority="high"
				/>
			</div>
		</section>
	</article>
</EditorialPage>

<style>
	.signature-row {
		display: flex;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.signature {
		display: block;
		width: 240px;
		aspect-ratio: 300 / 147;
		/* Ink, a shade off full so it reads as a signed mark rather than another
		   line of text. */
		background-color: var(--ink);
		opacity: 0.75;
		mask: url('/signature.svg') no-repeat center / contain;
	}
</style>
