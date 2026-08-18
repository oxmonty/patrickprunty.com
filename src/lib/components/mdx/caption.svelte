<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } =
		$props();
</script>

<!--
	A <div>, not a <figcaption>: this is authored standalone underneath a media
	component, so there is no <figure> parent to be a child of. Components that
	own their own <figure> (ZoomImage, ImageGridItem, XCard) take a `caption` prop.
-->
<div class={cn('-mt-4 mb-6 text-center text-sm text-muted-foreground', className)}>
	{@render children()}
</div>
