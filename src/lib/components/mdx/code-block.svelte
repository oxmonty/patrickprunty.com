<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';

	import { cn } from '$lib/utils';

	let {
		code,
		language = 'text',
		class: className = '',
		children
	}: {
		/** Raw source, kept alongside the markup so copy yields text, not HTML. */
		code: string;
		language?: string;
		class?: string;
		children: import('svelte').Snippet;
	} = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout>;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard is unavailable over plain http and in some embedded views;
			// the code is selectable either way, so there is nothing to recover.
		}
	}
</script>

<div class={cn('relative my-6 w-full min-w-0', className)}>
	<!--
		A scrollable region must be focusable and named, or keyboard users cannot
		reach the overflow (WCAG 2.1.1). The a11y rule flags any tabindex on a
		noninteractive element and does not except that pattern.
	-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		tabindex="0"
		role="region"
		aria-label="{language} code block"
		class="not-prose w-full max-w-full overflow-x-auto [&_pre]:m-0 [&_pre]:min-w-max [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[0.8rem] [&_pre]:leading-[1.4]"
	>
		{@render children()}
	</div>
	<button
		type="button"
		onclick={copy}
		aria-label={copied ? 'Copied' : `Copy ${language} code`}
		class="absolute top-2 right-2 bg-[var(--code-block-bg)] p-1.5 text-white/50 transition-colors before:absolute before:-inset-2 before:block hover:bg-[var(--code-block-bg-hover)] hover:text-white/90"
	>
		{#if copied}
			<Check class="size-3.5" />
		{:else}
			<Copy class="size-3.5" />
		{/if}
	</button>
</div>
