/**
 * Every page is static HTML built at deploy time. Anything live on a page —
 * view counts, the footer's last visitor — is fetched from /api after load,
 * and those endpoints opt out of this with their own `prerender = false`.
 */
export const prerender = true;
