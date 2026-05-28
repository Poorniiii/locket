let currentKey: CryptoKey | null = null;
let currentSalt: Uint8Array | null = null;

export const setSession = (key: CryptoKey, salt: Uint8Array): void => {
  currentKey = key;
  currentSalt = salt;
};

export const getKey = (): CryptoKey | null => currentKey;

export const getSalt = (): Uint8Array | null => currentSalt;

export const clearSession = (): void => {
  currentKey = null;
  currentSalt = null;
};
