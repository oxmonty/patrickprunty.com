// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/** Injected by vite.config.ts: the short SHA the site was built from. */
	const __GIT_HASH__: string;
}

export {};

declare module '*.ttf' {
	const src: string;
	export default src;
}
