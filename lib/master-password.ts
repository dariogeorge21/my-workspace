import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

function normalizeHash(raw: string | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If hash was escaped in env (\$2a\$...), convert to bcrypt format.
  const unescaped = trimmed.replace(/\\\$/g, '$');
  return unescaped || null;
}

async function readHashFromEnvFile(fileName: string): Promise<string | null> {
  try {
    const envPath = join(process.cwd(), fileName);
    const content = await readFile(envPath, 'utf8');
    const line = content
      .split(/\r?\n/)
      .find((entry) => entry.trimStart().startsWith('MASTER_PASSWORD_HASH='));

    if (!line) return null;

    const value = line.slice(line.indexOf('=') + 1).trim();
    const unquoted = value.replace(/^['"]|['"]$/g, '');
    return normalizeHash(unquoted);
  } catch {
    return null;
  }
}

export async function getMasterPasswordHash(): Promise<string | null> {
  const fromProcess = normalizeHash(process.env.MASTER_PASSWORD_HASH);
  if (fromProcess) return fromProcess;

  // Fallback for local dev cases where dotenv expansion strips bcrypt values.
  const fromLocal = await readHashFromEnvFile('.env.local');
  if (fromLocal) return fromLocal;

  const fromEnv = await readHashFromEnvFile('.env');
  if (fromEnv) return fromEnv;

  return null;
}
