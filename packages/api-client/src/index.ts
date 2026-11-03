import createClient from "openapi-fetch";

import type { components, paths } from "./schema";

export type { components, paths };
export type HealthResponse = components["schemas"]["HealthResponse"];
export type CheckResult = components["schemas"]["CheckResult"];

/** Typed client generated from the API's OpenAPI schema. Never hand-write request types. */
export function createApiClient(
  baseUrl: string,
  init?: { fetch?: (input: Request) => Promise<Response> },
) {
  return createClient<paths>({ baseUrl, fetch: init?.fetch });
}

export type ApiClient = ReturnType<typeof createApiClient>;
