<script lang="ts">
	import EditorialPage from '$lib/components/editorial-page.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { pageMeta } from '$lib/config/pages';

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
				<!-- TODO: placeholder copy, pending the real thing. -->
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</p>
				<p>
					Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
					nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
					deserunt mollit anim id est laborum.
				</p>
				<p>
					Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
					laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
					architecto beatae vitae dicta sunt explicabo.
				</p>
				<p>
					Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
					consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
					est, qui dolorem ipsum quia dolor sit amet.
				</p>
				<p>
					At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
					voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
					cupiditate non provident.
				</p>

				<p>
					<strong>Note:</strong> This website's design is inspired by
					<a href="https://sacred.computer">sacred.computer</a>.
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
				<img src="/portrait.svg" alt="Patrick Prunty" width="675" height="675" />
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
