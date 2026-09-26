const STORAGE_KEY = "stocksense.tokens";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

function loadFromStorage(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

let tokens: StoredTokens | null = loadFromStorage();

export function getTokens(): StoredTokens | null {
  return tokens;
}

export function setTokens(next: StoredTokens | null) {
  tokens = next;
  try {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — session just won't persist across reloads.
  }
}
