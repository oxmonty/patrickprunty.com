<script lang="ts">
	/**
	 * The "Zigzag" frame from lab.anishfn.ink/handdrawn-frames, drawn around an
	 * image: two wobbly rectangles inside a sawtooth border, every line sketched
	 * in on load.
	 *
	 * Ported from that page's generator rather than its exported paths, because
	 * the original is drawn for a 112x156 opening and the portrait is square.
	 * Stretching the paths would skew the teeth; regenerating at the right
	 * opening keeps them even. Seeded, so the server and the client draw the
	 * same lines and hydration has nothing to patch.
	 */

	let { href, label }: { href: string; label: string } = $props();

	type Point = [number, number];

	// The opening has the portrait's own proportions, so the drawing fills it
	// edge to edge. The box is cut to the ink: the teeth of the sawtooth touch
	// its sides, so the frame is exactly as wide as its column.
	const OPENING = { x: 29, y: 29, w: 150, h: 164 };
	const WIDTH = OPENING.w + 2 * OPENING.x;
	const HEIGHT = OPENING.h + 2 * OPENING.y;

	function mulberry32(seed: number) {
		return () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
		};
	}

	/** Two summed sine waves: the hand's drift along a stroke. */
	function wobble(rng: () => number) {
		const [a, b, c, d] = [1 + 1.5 * rng(), 3 + 3 * rng(), 6.28 * rng(), 6.28 * rng()];
		return (t: number) => 0.7 * Math.sin(6.28 * a * t + c) + 0.3 * Math.sin(6.28 * b * t + d);
	}

	const round = (v: number) => Math.round(10 * v) / 10;

	/** Catmull-Rom through the points, emitted as cubic beziers. */
	function toPath(points: Point[]): string {
		const n = points.length;
		const at = (i: number) => points[Math.max(0, Math.min(n - 1, i))];
		let d = `M${round(points[0][0])} ${round(points[0][1])}`;
		for (let i = 0; i < n - 1; i++) {
			const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
			const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
			const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
			d += `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
		}
		return d;
	}

	/** One side: overshoots both ends, bows a little, and wobbles along its length. */
	function stroke(
		from: Point,
		to: Point,
		rng: () => number,
		{ over = 5, amp = 0.7 }: { over?: number; amp?: number } = {}
	): string {
		const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
		const length = Math.hypot(dx, dy);
		const [ux, uy] = [dx / length, dy / length];
		const start = -over * (0.4 + 0.8 * rng());
		const end = length + over * (0.4 + 0.8 * rng());
		const bow = (rng() - 0.5) * 2.2 * Math.min(1, length / 60);
		const drift = wobble(rng);
		const steps = Math.max(4, Math.round((end - start) / 14));
		const points: Point[] = [];
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const along = start + (end - start) * t;
			const across = bow * Math.sin(Math.PI * t) + drift(t) * amp;
			points.push([from[0] + ux * along - uy * across, from[1] + uy * along + ux * across]);
		}
		return toPath(points);
	}

	function rect(
		x: number,
		y: number,
		w: number,
		h: number,
		rng: () => number,
		options?: { over?: number; amp?: number }
	): string[] {
		const corners: Point[] = [
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h]
		];
		return corners.map((corner, i) => stroke(corner, corners[(i + 1) % 4], rng, options));
	}

	/** A sawtooth running round the rectangle, teeth pointing outward. */
	function zigzag(x: number, y: number, w: number, h: number, rng: () => number): string {
		const corners: Point[] = [
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h]
		];
		const points: Point[] = [];
		for (let i = 0; i < 4; i++) {
			const [from, to] = [corners[i], corners[(i + 1) % 4]];
			const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
			const [ux, uy] = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
			const teeth = Math.round(length / 10);
			for (let t = 0; t < 2 * teeth; t++) {
				const along = (t / (2 * teeth)) * length;
				const out = (t % 2 ? 5 : 0) + (rng() - 0.5) * 0.6;
				points.push([from[0] + ux * along + uy * out, from[1] + uy * along - ux * out]);
			}
		}
		return 'M' + points.map(([px, py]) => `${round(px)} ${round(py)}`).join('L') + 'Z';
	}

	// The original's insets from its opening, and its seed.
	const rng = mulberry32(113);
	const { x, y, w, h } = OPENING;
	const lines = [
		...rect(x - 3, y - 3, w + 6, h + 6, rng, { over: 4 }),
		...rect(x - 12, y - 12, w + 24, h + 24, rng, { over: 3 }),
		zigzag(x - 24, y - 24, w + 48, h + 48, rng)
	];

	const DURATION = 0.4;
	/** Each line starts a beat after the one before, the whole frame inside the duration. */
	const stagger = Math.min(0.025, DURATION / lines.length);
</script>

<svelte:head>
	<link rel="preload" as="image" {href} fetchpriority="high" />
</svelte:head>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label={label}>
	<image {href} {x} {y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
	<g
		fill="none"
		stroke="currentColor"
		stroke-width="0.7"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		{#each lines as d, i (i)}
			<path {d} pathLength="1" style="animation-delay: {round(i * stagger * 1000)}ms" />
		{/each}
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		/* The inner lines overshoot their corners by a few units; let them. */
		overflow: visible;
	}

	/*
	 * pathLength="1" makes every line one dash long whatever its real length,
	 * so a single offset draws all of them at the same pace. The opacity step
	 * hides the round cap that would otherwise sit at each start point before
	 * its line begins.
	 */
	path {
		stroke-dasharray: 1 1;
		animation: draw 400ms ease-out both;
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 1;
			opacity: 0;
		}
		2% {
			opacity: 1;
		}
		to {
			stroke-dashoffset: 0;
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		path {
			animation: none;
		}
	}
</style>
