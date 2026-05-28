import { utf8Encode } from "./encoding";

const PBKDF2_ITERATIONS = 200_000;
const KEY_LENGTH_BITS = 256;
export const SALT_LENGTH = 16;

export const generateSalt = (): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

export const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    utf8Encode(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH_BITS },
    false,
    ["encrypt", "decrypt"]
  );
};
