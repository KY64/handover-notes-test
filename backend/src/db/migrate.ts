import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';
import { log } from '../logger.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, '../../migrations');
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

for (const file of files) {
  const migrationPath = resolve(migrationsDir, file);
  const sql = await readFile(migrationPath, 'utf8');
  await pool.query(sql);
  log('info', 'database migration completed', { migrationPath, file });
}
await pool.end();
