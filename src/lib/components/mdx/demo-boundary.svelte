<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } =
		$props();
</script>

<!-- Isolates embedded demos from prose styling so they render as authored. -->
<div class={cn('not-prose my-6 overflow-hidden border border-border p-6', className)}>
	{@render children()}
</div>
