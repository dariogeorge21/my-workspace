'use server';

import bcrypt from 'bcrypt';
import { createSession, destroySession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function verifyPassword(password: string): Promise<{ success: boolean, error?: string }> {
  try {
    const masterPasswordHash = process.env.MASTER_PASSWORD_HASH;

    if (!masterPasswordHash) {
      console.error('MASTER_PASSWORD_HASH is not set in environment variables');
      return { success: false, error: 'Server configuration error' };
    }

    const isValid = await bcrypt.compare(password, masterPasswordHash);

    if (isValid) {
      await createSession();
      return { success: true };
    }

    return { success: false, error: 'Invalid password' };
  } catch (error) {
    console.error('Password verification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/');
}
