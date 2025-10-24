const encoder = new TextEncoder();

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKeyFromNumber(key: string) {
  const keyMaterial = encoder.encode(key);
  const hashed = await crypto.subtle.digest('SHA-256', keyMaterial);
  return crypto.subtle.importKey('raw', hashed, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export function generateRandomKey(): string {
  const value = Math.floor(10000000 + Math.random() * 90000000);
  return value.toString();
}

export async function encryptMessage(plainText: string, key: string) {
  const aesKey = await deriveAesKeyFromNumber(key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoder.encode(plainText));
  return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(cipherBuffer)}`;
}

export async function decryptMessage(payload: string, key: string) {
  const [ivPart, cipherPart] = payload.split(':');
  if (!ivPart || !cipherPart) {
    throw new Error('Invalid ciphertext format');
  }

  const aesKey = await deriveAesKeyFromNumber(key);
  const iv = base64ToUint8Array(ivPart);
  const ciphertext = base64ToUint8Array(cipherPart);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}
