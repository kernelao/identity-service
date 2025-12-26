import { readFileSync } from 'node:fs';

export function readPemFromEnvOrFile(envPathKey: string, envPemKey: string): string {
  const path = (process.env[envPathKey] ?? '').trim();
  if (path) return readFileSync(path, 'utf8');

  const pem = (process.env[envPemKey] ?? '').trim();
  return pem;
}
