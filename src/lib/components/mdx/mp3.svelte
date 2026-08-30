<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';

	import { cn } from '$lib/utils';

	let {
		src,
		autoplay = false,
		loop = false,
		class: className = ''
	}: { src: string; autoplay?: boolean; loop?: boolean; class?: string } = $props();

	// ponytail: v1 wrapped react-audio-player. The native element still does all
	// the work — this only replaces its chrome, which cannot be styled and looks
	// like a different site in every browser.
	let currentTime = $state(0);
	let duration = $state(0);
	let paused = $state(true);
	let playbackRate = $state(1);

	const RATES = [1, 1.25, 1.5, 2];

	/** Elapsed counts up on the left, the right-hand figure counts down. */
	const remaining = $derived(Math.max(0, duration - currentTime));

	function clock(seconds: number): string {
		if (!Number.isFinite(seconds)) return '0:00';
		const whole = Math.floor(seconds);
		return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
	}

	function cycleRate() {
		playbackRate = RATES[(RATES.indexOf(playbackRate) + 1) % RATES.length];
	}

	/** Drives the black fill behind the thumb. Zero until a duration is known. */
	const played = $derived(duration ? (currentTime / duration) * 100 : 0);

	/** Saves under the file's own name rather than the last URL segment verbatim. */
	const filename = $derived(src.split('/').pop() || 'audio.mp3');
</script>

{#if src}
	<div class={cn('mp3 my-6', className)}>
		<!--
			Both icons stay in the DOM, one on top of the other, so the swap has an
			exit as well as an enter. Toggling with {#if} can only animate the
			arriving icon.
		-->
		<button
			type="button"
			class="transport"
			onclick={() => (paused = !paused)}
			aria-label={paused ? 'Play' : 'Pause'}
		>
			<span class="icon play" data-shown={paused}><Play class="size-4 fill-current" /></span>
			<span class="icon" data-shown={!paused}><Pause class="size-4 fill-current" /></span>
		</button>

		<span class="time">{clock(currentTime)}</span>

		<!--
			A real range input rather than a styled div: arrow-key seeking, the
			announced position, and drag behaviour all come with it.

			`max` falls back to 1 rather than 0 before metadata lands: min and max
			both 0 is a zero-length track, and a range input parks its thumb
			mid-track for that — the indicator appeared halfway along on first
			load. Value is still 0, so the thumb sits at the start, and the input
			stays disabled until a real duration arrives.
		-->
		<input
			type="range"
			class="scrubber"
			min="0"
			max={duration || 1}
			step="0.01"
			bind:value={currentTime}
			disabled={!duration}
			style:--played="{played}%"
			aria-label="Seek"
			aria-valuetext="{clock(currentTime)} of {clock(duration)}"
		/>

		<span class="time">-{clock(remaining)}</span>

		<span class="actions">
			<a class="action not-prose" href={src} download={filename} aria-label="Download audio">
				<Download class="size-4" />
			</a>

			<button
				type="button"
				class="action"
				onclick={cycleRate}
				aria-label="Playback speed: {playbackRate} times. Change."
			>
				<Gauge class="size-4" />
				{#if playbackRate !== 1}<span class="rate">{playbackRate}&times;</span>{/if}
			</button>
		</span>

		<audio
			{src}
			{autoplay}
			{loop}
			preload="metadata"
			bind:currentTime
			bind:duration
			bind:paused
			bind:playbackRate
		></audio>
	</div>
{/if}

<style>
	/*
	 * Concentric corners: outer = inner + padding + border. border-radius
	 * describes the border-box edge, so the 1px border sits between the two
	 * curves and counts toward the gap; leaving it out makes the container read
	 * a hair tighter at the corners than along the edges.
	 */
	.mp3 {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--mp3-inner-radius) + var(--mp3-inset) + 1px);
		background: #fff;
		padding: var(--mp3-inset);

		--mp3-inner-radius: 0.375rem;
		--mp3-inset: 0.625rem;
	}

	.transport {
		position: relative;
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--mp3-inner-radius);
		background: var(--muted);
		color: var(--ink);
		cursor: pointer;
		transform-origin: center;
		/*
		 * Promotes the button to its own layer, so the hover scale composites a
		 * rasterised copy rather than re-laying out its contents each frame. The
		 * icon is centred at a fractional pixel once the button is 1.06×, and
		 * without this it snaps between whole pixels as the animation runs.
		 */
		will-change: scale;
		/* Named outright, never `all`: `all` would animate the background swap on
		   the icons too and re-run on every unrelated property change. */
		transition:
			scale 150ms cubic-bezier(0.2, 0, 0, 1),
			background-color 150ms cubic-bezier(0.2, 0, 0, 1);
	}

	/*
	 * 44px tap target without growing the button: the visible square is 36px, so
	 * the hit box reaches 4px past it on each side. The row's 0.625rem gap keeps
	 * that clear of the next control.
	 */
	.transport::after {
		content: '';
		position: absolute;
		inset: -0.25rem;
	}

	.transport:hover {
		background: var(--border);
		scale: 1.06;
	}

	/*
	 * 0.96 on press. Anything under 0.95 reads as a flinch rather than a button
	 * taking the tap. The background change carries the same state for anyone who
	 * has motion turned off.
	 */
	.transport:active {
		scale: 0.96;
	}

	/*
	 * Cross-fade rather than a swap. Both icons are stacked and centred, so the
	 * outgoing one leaves as the incoming one arrives.
	 */
	.icon {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		inset: 0;
		transform-origin: center;
		opacity: 0;
		scale: 0.25;
		filter: blur(4px);
		transition:
			opacity 200ms cubic-bezier(0.2, 0, 0, 1),
			scale 200ms cubic-bezier(0.2, 0, 0, 1),
			filter 200ms cubic-bezier(0.2, 0, 0, 1);
	}

	.icon[data-shown='true'] {
		opacity: 1;
		scale: 1;
		filter: blur(0);
	}

	/*
	 * A triangle's mass sits left of its bounding box, so centring it
	 * geometrically leaves it looking off to the left. Applied as a translate
	 * rather than padding: padding is layout, and layout gets re-resolved and
	 * re-rounded while the parent scales.
	 */
	.icon.play {
		translate: 0.0625rem 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.transport,
		.icon {
			transition: none;
		}

		.transport:hover,
		.transport:active {
			scale: 1;
		}
	}

	/* Tabular figures: the clock must not shuffle sideways as the digits tick. */
	.time {
		flex: none;
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		color: var(--muted-foreground);
	}

	.actions {
		display: flex;
		flex: none;
		align-items: center;
	}

	/*
	 * Sized to a 40px target rather than the 16px icon. Siblings meet edge to
	 * edge with no gap, so the two hit boxes touch but never overlap.
	 */
	.action {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		min-width: 2.5rem;
		height: 2.5rem;
		color: var(--muted-foreground);
		cursor: pointer;
		text-decoration: none;
		transition: color 150ms cubic-bezier(0.2, 0, 0, 1);
	}

	.action:hover {
		color: var(--ink);
	}

	/* Tabular figures: 1.25 and 1.5 are different widths in proportional digits. */
	.rate {
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
	}

	/*
	 * The control is 40px tall so the whole band takes a click, not just the
	 * hairline. The visible 2px line is a centred background image on the track
	 * rather than the track itself, which keeps the line where it was while the
	 * target around it grows — and keeps it off the engines' differing ideas of
	 * where a short track sits vertically.
	 */
	.scrubber {
		flex: 1 1 auto;
		min-width: 0;
		height: var(--scrubber-height);
		appearance: none;
		background: transparent;
		cursor: pointer;

		--scrubber-height: 2.5rem;
		--scrubber-thumb: 0.7rem;
		--scrubber-line: linear-gradient(
			to right,
			var(--ink) 0 var(--played, 0%),
			var(--border) var(--played, 0%) 100%
		);
	}

	.scrubber:disabled {
		cursor: default;
		opacity: 0.5;
	}

	/*
	 * Track and thumb have no shared standard, so each engine's pseudo element
	 * gets its own rule. They cannot be grouped into one selector list: an
	 * unrecognised pseudo element invalidates the whole list.
	 */
	/*
	 * Both engines get the full-height track with the line drawn into it, so the
	 * played split needs no ::-moz-range-progress: the same gradient carries it.
	 */
	.scrubber::-webkit-slider-runnable-track {
		height: var(--scrubber-height);
		background: var(--scrubber-line) center / 100% 2px no-repeat;
	}

	.scrubber::-moz-range-track {
		height: var(--scrubber-height);
		background: var(--scrubber-line) center / 100% 2px no-repeat;
	}

	/* WebKit offsets the thumb from the top of the track; Firefox centres it. */
	.scrubber::-webkit-slider-thumb {
		appearance: none;
		width: var(--scrubber-thumb);
		height: var(--scrubber-thumb);
		border: none;
		border-radius: 50%;
		background: var(--ink);
		margin-top: calc((var(--scrubber-height) - var(--scrubber-thumb)) / 2);
	}

	.scrubber::-moz-range-thumb {
		width: var(--scrubber-thumb);
		height: var(--scrubber-thumb);
		border: none;
		border-radius: 50%;
		background: var(--ink);
	}

	audio {
		display: none;
	}
</style>
