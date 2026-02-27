// Lighthouse Log Collector - Users Repository

import { getDB } from '../db';
import type { User } from '$lib/shared/types';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const SALT_ROUNDS = 10;

export function createUser(email: string, password: string): User {
  const db = getDB();

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const id = 'users:' + nanoid();

  const stmt = db.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, datetime('now'))"
  );

  stmt.run(id, email, passwordHash);

  return {
    id,
    email,
    created_at: new Date().toISOString()
  };
}

export function getUserByEmail(email: string): User | null {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as User | undefined;

  return user || null;
}

export function getUserById(id: string): User | null {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id) as User | undefined;

  return user || null;
}

export function verifyPassword(user: User, password: string): boolean {
  if (!user.password_hash) {
    return false;
  }
  return bcrypt.compareSync(password, user.password_hash);
}
