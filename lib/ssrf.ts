import dns from "node:dns/promises";

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
]

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0', 'metadata.google.internal'])

// IPv4-mapped IPv6 (e.g. new URL('http://[::ffff:127.0.0.1]/').hostname === '::ffff:7f00:1')
// would otherwise sail past the plain-IPv4 regexes above.
function ipv4MappedToDotted(host: string): string | null {
  const m = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i)
  if (!m) return null
  const hi = parseInt(m[1], 16)
  const lo = parseInt(m[2], 16)
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`
}

export function isPrivateHost(rawHost: string): boolean {
  // url.hostname returns IPv6 literals WITH brackets (e.g. "[::1]") — every
  // regex above is written against the bare address, so strip them first.
  // Without this, none of the IPv6 checks ever matched anything.
  const host = rawHost.toLowerCase().replace(/^\[|\]$/g, '')
  const checkHost = ipv4MappedToDotted(host) ?? host
  return BLOCKED_HOSTS.has(checkHost) || PRIVATE_RANGES.some(re => re.test(checkHost))
}

const MAX_URL_LENGTH = 2048 // conventional URL length ceiling — also caps parse cost on abuse

export function validateUrl(rawUrl: string): URL {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0 || rawUrl.length > MAX_URL_LENGTH) {
    throw new Error('INVALID_URL')
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('INVALID_URL')
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('INVALID_URL')
  if (!url.hostname) throw new Error('INVALID_URL')
  if (isPrivateHost(url.hostname)) throw new Error('SSRF_BLOCKED')

  return url
}

// Hostname-string checks can't catch DNS rebinding: a public-looking domain
// that resolves to a private IP. Resolve it and check every address returned.
// This still has a small TOCTOU window vs. the connection fetch() makes a
// moment later — closing that fully needs a custom connect-time resolver
// (undici Agent `lookup` hook), which is riskier to get right across runtimes
// than the residual risk here is worth. Good enough for the common case.
export async function assertResolvesPublic(hostname: string): Promise<void> {
  // Already an IP literal (validateUrl's regex already checked it) — nothing to resolve.
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':') || hostname.startsWith('[')) return

  let addresses: string[]
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map(a => a.address)
  } catch {
    throw new Error('INVALID_URL')
  }
  for (const addr of addresses) {
    if (isPrivateHost(addr)) throw new Error('SSRF_BLOCKED')
  }
}
