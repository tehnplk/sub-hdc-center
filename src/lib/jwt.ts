import { createHmac, timingSafeEqual } from 'node:crypto';

type JwtPayload = {
  exp?: number;
  nbf?: number;
  [key: string]: unknown;
};

function base64UrlDecode(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function verifyHs256Jwt(token: string, secret: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as {
      alg?: string;
      typ?: string;
    };
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as JwtPayload;

    if (header.alg !== 'HS256') return null;

    const expected = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const actual = base64UrlDecode(encodedSignature);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && now >= payload.exp) return null;
    if (typeof payload.nbf === 'number' && now < payload.nbf) return null;

    return payload;
  } catch {
    return null;
  }
}
