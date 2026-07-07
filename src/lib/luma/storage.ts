export const LUMA_API_KEY_SESSION_KEY = "cursor-pos-luma-api-key";
export const LUMA_API_KEY_HEADER = "x-luma-api-key";

export function loadSessionLumaApiKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(LUMA_API_KEY_SESSION_KEY)?.trim();
  return value || null;
}

export function saveSessionLumaApiKey(apiKey: string): void {
  window.sessionStorage.setItem(LUMA_API_KEY_SESSION_KEY, apiKey.trim());
}

export function clearSessionLumaApiKey(): void {
  window.sessionStorage.removeItem(LUMA_API_KEY_SESSION_KEY);
}

export function hasSessionLumaApiKey(): boolean {
  return Boolean(loadSessionLumaApiKey());
}
