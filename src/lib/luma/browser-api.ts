import { LUMA_API_KEY_HEADER, loadSessionLumaApiKey } from "./storage";

export async function lumaApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const apiKey = loadSessionLumaApiKey();
  const headers = new Headers(init.headers);

  if (apiKey) {
    headers.set(LUMA_API_KEY_HEADER, apiKey);
  }

  return fetch(path, {
    ...init,
    headers,
  });
}
