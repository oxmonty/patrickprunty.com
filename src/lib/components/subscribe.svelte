<script lang="ts">
	import type { Action } from 'svelte/action';

	import { site } from '$lib/config/site';

	let { label = 'Get new posts by email via Substack.' }: { label?: string } = $props();

	/**
	 * Sweeps the rule in when the row reaches the screen. The form sits below the
	 * fold at every width, so running it on mount would spend the animation
	 * before anyone could see it. Once only: the observer disconnects on the
	 * first intersection, so scrolling back does not replay it.
	 */
	const sweepIn: Action<HTMLElement> = (node) => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('sweep');
				observer.disconnect();
			},
			{ threshold: 0.5 }
		);
		observer.observe(node);

		return { destroy: () => observer.disconnect() };
	};
</script>

<!--
	A plain GET form rather than a fetch: Substack's /subscribe accepts the
	address as a query parameter, so there is no API call, no key, and nothing to
	go wrong client-side. The reader lands on Substack with the field prefilled
	and confirms there, which also keeps the double opt-in on their side.
-->
<form
	class="subscribe"
	action={site.links.newsletter}
	method="GET"
	target="_blank"
	rel="noopener noreferrer"
>
	<label for="subscribe-email">{label}</label>

	<div class="row" use:sweepIn>
		<input
			id="subscribe-email"
			type="email"
			name="email"
			required
			autocomplete="email"
			placeholder="enter your email..."
			spellcheck="false"
		/>
		<button type="submit">
			subscribe<span aria-hidden="true" class="arrow">⍈</span>
		</button>
	</div>
</form>

<style>
	.subscribe {
		margin-top: 4rem;
	}

	label {
		display: block;
		margin-bottom: 0.6rem;
	}

	/*
	 * One rule under the whole row rather than under the input alone, so the
	 * field and its trigger read as a single line of text. It sweeps in on load
	 * to match the underline animation on the rest of the site.
	 */
	.row {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding-bottom: 0.3rem;
	}

	.row::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		border-bottom: 1px solid var(--ink);
	}

	/* Added by the action, so the rule is drawn full width if JS never runs. */
	.row:global(.sweep)::after {
		animation: sweep 500ms ease-out;
	}

	@keyframes sweep {
		from {
			right: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row:global(.sweep)::after {
			animation: none;
		}
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
		text-transform: lowercase;
	}

	/* A prompt, not content: sits under the text the reader types over it. */
	input::placeholder {
		color: var(--ink-muted);
	}

	button {
		padding: 0;
		border: none;
		background: none;
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
		cursor: pointer;
		white-space: nowrap;
		text-align: right;
	}

	button:hover {
		background-color: var(--highlight);
	}

	.arrow {
		display: inline-block;
		margin-left: 0.35em;
	}
</style>
