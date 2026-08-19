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
		<div class="min-w-max">
			<!--
				Sticky inside the scroller rather than absolute outside it. Absolute
				pins the button to the block's box, which momentum scrolling on iOS
				leaves behind: the content rubber-bands past its edge while the button
				sits still. Sticky rides that transform with the code and still holds
				the corner through a normal scroll. The row is zero-height, so it
				overlays the block instead of pushing it down.
			-->
			<div class="flex h-0 items-start justify-end">
				<button
					type="button"
					onclick={copy}
					aria-label={copied ? 'Copied' : `Copy ${language} code`}
					class="sticky top-0 right-0 z-10 bg-[var(--code-block-bg)] p-1.5 text-white/50 transition-colors hover:bg-[var(--code-block-bg-hover)] hover:text-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				>
					{#if copied}
						<Check class="size-3" />
					{:else}
						<Copy class="size-3" />
					{/if}
				</button>
			</div>
			{@render children()}
		</div>
	</div>
</div>
