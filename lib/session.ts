import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-random-jwt-key'
);

const SESSION_NAME = 'workspace_session';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

export interface SessionPayload {
  authenticated: boolean;
  timestamp: number;
}

export async function createSession(): Promise<void> {
  const payload: SessionPayload = {
    authenticated: true,
    timestamp: Date.now(),
  };

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    const verified = await jwtVerify(session, secret);
    return verified.payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function verifySession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session?.authenticated) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}
