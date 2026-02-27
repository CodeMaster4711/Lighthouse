// Lighthouse Log Collector - SurrealDB Connection

import { Surreal } from 'surrealdb';
import {
  SURREALDB_URL,
  SURREALDB_NS,
  SURREALDB_DB,
  SURREALDB_USER,
  SURREALDB_PASS
} from '$env/static/private';

let db: Surreal | null = null;

export async function getDB(): Promise<Surreal> {
  if (db) {
    return db;
  }

  try {
    db = new Surreal();

    await db.connect(SURREALDB_URL);
    await db.signin({
      username: SURREALDB_USER,
      password: SURREALDB_PASS
    });
    await db.use({
      namespace: SURREALDB_NS,
      database: SURREALDB_DB
    });

    console.log('[INFO] database_connected url=' + SURREALDB_URL);
    return db;
  } catch (error) {
    console.error('[ERROR] database_connection_failed error=' + (error instanceof Error ? error.message : 'unknown'));
    throw new Error('Failed to connect to SurrealDB');
  }
}

export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('[INFO] database_closed');
  }
}
