import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { upsertSeedEvent } from '../services/events.js';
import { pool } from './pool.js';
import { log } from '../logger.js';

const samplePath = resolve(process.cwd(), '../sample/events.json');
const json = JSON.parse(await readFile(samplePath, 'utf8')) as { events: Array<any> };
for (const event of json.events) {
  await upsertSeedEvent({
    id: event.id,
    timestamp: event.timestamp,
    type: event.type,
    status: event.status,
    room: event.room,
    guest: event.guest,
    description: event.description
  });
}
log('info', 'seed completed', { count: json.events.length });
await pool.end();
