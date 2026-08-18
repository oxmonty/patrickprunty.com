<script lang="ts">
	import Latex from './latex.svelte';

	let { math }: { math: string } = $props();
</script>

<Latex {math} block size="large" />
