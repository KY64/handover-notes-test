import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { authSchema, loginSchema, type ApiUser } from '@handover/shared';
import { query } from '../db/pool.js';
import { config } from '../config.js';

type UserRow = { id: string; email: string; name: string; password_hash: string; created_at: Date };

const secret = new TextEncoder().encode(config.jwtSecret);

function toUser(row: UserRow): ApiUser {
  return { id: row.id, email: row.email, name: row.name, createdAt: row.created_at.toISOString() };
}

export async function signup(input: unknown) {
  const parsed = authSchema.parse(input);
  const hash = await bcrypt.hash(parsed.password, 12);
  const id = `usr_${randomUUID()}`;
  const result = await query<UserRow>(
    'INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4) RETURNING *',
    [id, parsed.email.toLowerCase(), parsed.name ?? parsed.email.split('@')[0], hash]
  );
  const user = toUser(result.rows[0]);
  return { user, token: await signToken(user.id) };
}

export async function login(input: unknown) {
  const parsed = loginSchema.parse(input);
  const result = await query<UserRow>('SELECT * FROM users WHERE email = $1', [parsed.email.toLowerCase()]);
  const row = result.rows[0];
  if (!row || !(await bcrypt.compare(parsed.password, row.password_hash))) return null;
  const user = toUser(row);
  return { user, token: await signToken(user.id) };
}

export async function getUserById(id: string) {
  const result = await query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function signToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const verified = await jwtVerify(token, secret);
  return String(verified.payload.sub ?? '');
}
