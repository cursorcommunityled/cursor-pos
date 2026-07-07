import { LUMA_API_KEY_HEADER } from "./storage";

export class LumaAuthError extends Error {
  constructor(message = "LUMA_API_KEY is not configured.") {
    super(message);
    this.name = "LumaAuthError";
  }
}

export function resolveLumaApiKey(request: Request): string {
  const headerKey = request.headers.get(LUMA_API_KEY_HEADER)?.trim();
  if (headerKey) {
    return headerKey;
  }

  const envKey = process.env.LUMA_API_KEY?.trim();
  if (envKey) {
    return envKey;
  }

  throw new LumaAuthError();
}

export function isLumaAuthError(error: unknown): boolean {
  return error instanceof LumaAuthError;
}
