import { Redis } from "@upstash/redis"

export const redis = Redis.fromEnv()

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return (await redis.get<T>(key)) ?? null
  } catch {
    return null // cache is best-effort — treat outage as a miss, not a failure
  }
}

export async function cacheSet(key: string, value: unknown, ttlMs = 3_600_000) {
  try {
    await redis.set(key, value, { px: ttlMs })
  } catch {
    // best-effort — ignore write failures
  }
}
