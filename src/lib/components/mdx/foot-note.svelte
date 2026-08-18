<script lang="ts">
	let { id, children }: { id: string | number; children: import('svelte').Snippet } = $props();

	function scrollToRef(event: MouseEvent) {
		const target = document.getElementById(`s${id}`);
		if (!target) return;
		event.preventDefault();
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<div class="flex gap-1 text-sm text-foreground/85 antialiased not-first:mt-3">
	<a
		href="#s{id}"
		id="f{id}"
		class="cursor-pointer font-medium text-foreground/85 no-underline! transition-colors hover:text-primary"
		onclick={scrollToRef}>[{id}].</a
	>
	<a
		href="#s{id}"
		class="font-medium text-foreground/85 no-underline! transition-colors hover:text-primary"
		onclick={scrollToRef}>^</a
	>
	<span>{@render children()}</span>
</div>
