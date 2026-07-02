export function errResponse(code: string, message: string, status: number, extra?: object) {
  return Response.json({ error: code, message, ...extra }, { status })
}

export const ERR = {
  invalidUrl: () => errResponse('INVALID_URL', 'Malformed or disallowed URL.', 400),
  ssrfBlocked: () => errResponse('SSRF_BLOCKED', 'Requests to internal/private addresses are blocked.', 400),
  unauthorized: () => errResponse('UNAUTHORIZED', 'Missing or invalid API key.', 401),
  extractionFailed: (msg = 'Could not extract content from this page.') =>
    errResponse('EXTRACTION_FAILED', msg, 422),
  upstreamFailed: () => errResponse('UPSTREAM_FAILED', 'Failed to fetch the target URL.', 502),
  timeout: () => errResponse('TIMEOUT', 'Request to target URL timed out.', 504),
  notImplemented: () =>
    errResponse('NOT_IMPLEMENTED', 'This endpoint requires a headless browser worker (not yet deployed).', 501),
}

const KNOWN_ERRORS = new Set(['SSRF_BLOCKED', 'INVALID_URL', 'TIMEOUT', 'UPSTREAM_FAILED'])

export function handleFetchError(err: unknown): Response {
  if (!(err instanceof Error)) {
    console.error('[unexpected error]', err)
    return ERR.upstreamFailed()
  }
  if (err.message === 'SSRF_BLOCKED') return ERR.ssrfBlocked()
  if (err.message === 'INVALID_URL') return ERR.invalidUrl()
  if (err.message === 'TIMEOUT') return ERR.timeout()
  // Anything else is an actual bug (or an upstream failure we didn't anticipate),
  // not a known operational condition — log it with a stack trace so it's
  // visible in server logs instead of silently collapsing into a generic 502.
  if (!KNOWN_ERRORS.has(err.message)) console.error('[unexpected error]', err)
  return ERR.upstreamFailed()
}
