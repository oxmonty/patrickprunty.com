import { env } from '$env/dynamic/private';

/**
 * Upstash's REST API, spoken directly rather than through @upstash/redis — the
 * whole surface we need is "POST a command array, read `result` back", so the
 * SDK would be a dependency for twenty lines.
 *
 * Commands go through /pipeline so a route can read and write in one round
 * trip. Keys are sent in the body, not the URL, which is what keeps the
 * slash in `views:blog/why-travel` from having to be escaped.
 */
export const hasRedis = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

type Command = (string | number)[];

/**
 * Runs `commands` in order and returns one result per command. Returns null if
 * Redis is unconfigured or the call fails, so a counter outage degrades to a
 * missing number rather than a broken page.
 */
export async function redisPipeline(commands: Command[]): Promise<unknown[] | null> {
	if (!hasRedis) return null;

	try {
		const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(commands)
		});

		if (!response.ok) throw new Error(`Upstash responded ${response.status}`);

		const results = (await response.json()) as { result?: unknown; error?: string }[];
		const failed = results.find((entry) => entry.error);
		if (failed) throw new Error(failed.error);

		return results.map((entry) => entry.result);
	} catch (error) {
		console.error('Redis pipeline failed:', error);
		return null;
	}
}

/**
 * The visitor's address, used only as a hash field to count uniques by.
 *
 * Read from x-forwarded-for rather than SvelteKit's getClientAddress() to match
 * what the previous Next.js site wrote, so the same visitor keeps the same
 * field and the counts carry on from where they left off instead of doubling.
 */
export function toClientIp(request: Request, fallback: string): string {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) return forwarded.split(',')[0].trim();
	return request.headers.get('x-real-ip') ?? fallback;
}
