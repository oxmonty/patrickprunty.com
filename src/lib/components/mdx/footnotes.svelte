<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<div
	class="before:m-auto before:my-10 before:block before:w-[200px] before:border-t before:border-border before:content-['']"
>
	{@render children()}
</div>
