<script lang="ts">
	let { id }: { id: string | number } = $props();

	/** Smooth-scrolls to the matching FootNote rather than jumping the page. */
	function scrollToNote(event: MouseEvent) {
		const target = document.getElementById(`f${id}`);
		if (!target) return;
		event.preventDefault();
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<sup
	><a href="#f{id}" id="s{id}" class="text-foreground/85 no-underline!" onclick={scrollToNote}
		>[{id}]</a
	></sup
>
