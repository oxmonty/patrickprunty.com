<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } =
		$props();
</script>

<div class={cn('mb-12 ml-4 border-l border-border pl-8 [counter-reset:step]', className)}>
	{@render children()}
</div>
