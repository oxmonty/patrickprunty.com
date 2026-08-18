import { Redis } from '@upstash/redis';

import { env } from '$env/dynamic/private';

/**
 * Upstash REST client, sharing the store the v1 site writes to.
 *
 * Dynamic env rather than static: the site builds and serves fine without
 * credentials — the notes feed just comes back empty — so a missing variable
 * should not fail the build.
 */
export const redis =
	env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
		? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
		: null;
