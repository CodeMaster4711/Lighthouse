// Lighthouse Log Collector - Users Repository

import { getDB } from '../db';
import type { User } from '$lib/shared/types';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const SALT_ROUNDS = 10;

export async function createUser(email: string, password: string): Promise<User> {
  const db = await getDB();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = 'users:' + nanoid();

  const result = await db.create(id, {
    email,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  });

  const user = result as User;
  delete user.password_hash;
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();

  const result = await db.query<[User[]]>(
    'SELECT * FROM users WHERE email = $email LIMIT 1',
    { email }
  );

  return result[0]?.[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDB();

  const result = await db.select<User>(id);
  return result || null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.password_hash) {
    return false;
  }
  return bcrypt.compare(password, user.password_hash);
}
