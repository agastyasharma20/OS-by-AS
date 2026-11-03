import { getRequestConfig } from "next-intl/server";

// English only in v1. Hindi is added later by adding messages/hi.json and a locale resolver.
export default getRequestConfig(async () => ({
  locale: "en",
  messages: (await import("../../messages/en.json")).default,
}));
