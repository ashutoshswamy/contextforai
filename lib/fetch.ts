import { validateUrl, assertResolvesPublic } from './ssrf'

const TIMEOUT_MS = 15_000
const MAX_REDIRECTS = 5

export async function safeFetch(rawUrl: string): Promise<{ html: string; finalUrl: string }> {
  let url = validateUrl(rawUrl)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      await assertResolvesPublic(url.hostname)

      const res = await fetch(url.href, {
        signal: controller.signal,
        headers: { 'User-Agent': 'contextforai-bot/1.0' },
        redirect: 'manual',
      })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) throw new Error('UPSTREAM_FAILED')
        // Re-validate every hop against the same SSRF rules. Auto-following
        // redirects (fetch's default) would let a URL that passes validation
        // 302 straight to an internal IP or cloud metadata endpoint, bypassing
        // validateUrl entirely — this loop is the actual SSRF fix.
        url = validateUrl(new URL(location, url).href)
        continue
      }

      if (!res.ok) throw new Error('UPSTREAM_FAILED')
      const html = await res.text()
      return { html, finalUrl: url.href }
    }
    throw new Error('UPSTREAM_FAILED') // too many redirects
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') throw new Error('TIMEOUT')
      if (['INVALID_URL', 'SSRF_BLOCKED', 'UPSTREAM_FAILED', 'TIMEOUT'].includes(err.message)) throw err
    }
    throw new Error('UPSTREAM_FAILED')
  } finally {
    clearTimeout(timer)
  }
}
