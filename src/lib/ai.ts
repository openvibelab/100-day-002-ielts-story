const KEY_STORAGE = "isa_user_api_key";
const PROVIDER_STORAGE = "isa_user_provider";

export type AIProvider = "gemini" | "deepseek" | "openai";

export function getUserApiKey(): string {
  return localStorage.getItem(KEY_STORAGE) || "";
}

export function getUserProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_STORAGE) as AIProvider) || "gemini";
}

export function saveUserApiKey(key: string, provider: AIProvider): void {
  localStorage.setItem(KEY_STORAGE, key);
  localStorage.setItem(PROVIDER_STORAGE, provider);
}

export function clearUserApiKey(): void {
  localStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(PROVIDER_STORAGE);
}

export function hasUserApiKey(): boolean {
  return !!getUserApiKey();
}
