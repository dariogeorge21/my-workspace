'use server';

import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-random-jwt-key');
const PM_AUTH_COOKIE = 'pm_auth_vault';

export async function verifyMasterPasswordForVault(password: string) {
  const masterPasswordHash = process.env.MASTER_PASSWORD_HASH;
  if (!masterPasswordHash) return { success: false, error: 'Server configuration error' };

  const isValid = await bcrypt.compare(password, masterPasswordHash);
  
  if (isValid) {
    // 2-minute token
    const token = await new SignJWT({ vault_authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2m')
      .sign(secret);
      
    const cookieStore = await cookies();
    cookieStore.set(PM_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 120, // 2 mins
      path: '/',
    });
    
    return { success: true };
  }
  
  return { success: false, error: 'Invalid master password' };
}

export async function checkVaultAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PM_AUTH_COOKIE)?.value;
  if (!token) return false;
  
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
