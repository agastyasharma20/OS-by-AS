/**
 * Path rules for the backend-for-frontend proxy (/api/v1/* → API). This is an SSRF boundary:
 * only allowlisted, read-only API paths may be forwarded, and the target host is never derived
 * from the request.
 */
export const ALLOWED_PREFIXES: readonly string[] = ["health"];

const SEGMENT = /^[A-Za-z0-9_-]+$/;

/** Returns the upstream URL for an allowed path, or null if the path must be rejected. */
export function resolveUpstream(path: readonly string[], apiBaseUrl: string): string | null {
  if (path.length === 0 || path.length > 8) return null;
  if (!ALLOWED_PREFIXES.includes(path[0])) return null;
  // Segments arrive URL-decoded, so "%2F" and "%2E%2E" are caught here as "/" and "..".
  if (!path.every((segment) => SEGMENT.test(segment))) return null;
  const base = new URL(apiBaseUrl);
  const target = new URL(`/api/v1/${path.join("/")}`, base);
  return target.origin === base.origin ? target.toString() : null;
}
