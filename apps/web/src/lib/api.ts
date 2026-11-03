import { createApiClient } from "@osbyas/api-client";

/**
 * Browser calls go to the same origin; the Next.js route handler forwards them to the API.
 * `fetch` is resolved per call so tests and instrumentation can replace it.
 */
export const api = createApiClient(
  typeof window === "undefined" ? "http://localhost" : window.location.origin,
  { fetch: (input) => globalThis.fetch(input) },
);
