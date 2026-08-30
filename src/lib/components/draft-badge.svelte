<!--
	Marks an entry that is not published yet. Only ever rendered in dev — the
	draft filters in posts.ts and on /projects drop the entries entirely in a
	production build, so this never reaches a reader.
-->
<span class="draft-badge">Draft</span>

<style>
	/*
	 * A fixed rem size, not em: this sits beside a 1rem listing title in one
	 * place and a 3–5rem page title in the other, and a relative size would make
	 * it a banner on the second.
	 */
	.draft-badge {
		display: inline-block;
		margin-left: 0.5rem;
		padding: 0.15rem 0.4rem;
		/* The warmest of the callout colours, so the badge reads as a state rather
		   than introducing a colour the palette does not already have. --highlight
		   is not available: it means hover, everywhere else on the site. */
		background-color: var(--note-danger);
		color: var(--ink);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		line-height: 1;
		text-transform: uppercase;
		/* Sits with the text rather than on its baseline, which at 5rem would drop
		   the chip to the bottom of the line. */
		vertical-align: middle;
	}
</style>
