import { utf8Decode, utf8Encode } from "./encoding";

export const IV_LENGTH = 12;

export const generateIv = (): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(IV_LENGTH));

export const encryptJson = async (
  plaintext: unknown,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> => {
  const bytes = utf8Encode(JSON.stringify(plaintext));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    bytes as BufferSource
  );
  return new Uint8Array(ciphertext);
};

export const decryptJson = async <T = unknown>(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<T> => {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  return JSON.parse(utf8Decode(plaintext)) as T;
};
