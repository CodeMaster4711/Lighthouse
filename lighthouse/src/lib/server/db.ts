// Lighthouse Log Collector - SQLite Connection

import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (db) {
    return db;
  }

  try {
    const dbPath = process.env.DATABASE_PATH || './data/lighthouse.db';

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schemaPath = join(process.cwd(), '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);

    const seedPath = join(process.cwd(), '../database/seed.sql');
    if (existsSync(seedPath)) {
      const seed = readFileSync(seedPath, 'utf-8');
      db.exec(seed);
    }

    console.log('[INFO] database_connected path=' + dbPath);
    return db;
  } catch (error) {
    console.error('[ERROR] database_connection_failed error=' + (error instanceof Error ? error.message : 'unknown'));
    throw new Error('Failed to connect to SQLite database');
  }
}

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[INFO] database_closed');
  }
}
