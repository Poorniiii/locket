export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToBytes = (b64: string): Uint8Array => {
  const binary = window.atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const utf8Encode = (text: string): Uint8Array =>
  new TextEncoder().encode(text);

export const utf8Decode = (bytes: ArrayBuffer | Uint8Array): string =>
  new TextDecoder().decode(bytes);
