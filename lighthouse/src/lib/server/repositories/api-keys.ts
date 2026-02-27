// Lighthouse Log Collector - API Keys Repository

import { getDB } from '../db';
import type { ApiKey } from '$lib/shared/types';
import { nanoid } from 'nanoid';

const API_KEY_PREFIX = 'lh_';
const API_KEY_LENGTH = 32;

export function generateApiKey(projectId: string): ApiKey {
  const db = getDB();

  const key = API_KEY_PREFIX + nanoid(API_KEY_LENGTH);
  const id = 'api_keys:' + nanoid();

  const stmt = db.prepare(
    "INSERT INTO api_keys (id, key, project_id, active, created_at) VALUES (?, ?, ?, 1, datetime('now'))"
  );

  stmt.run(id, key, projectId);

  return {
    id,
    key,
    project_id: projectId,
    active: true,
    created_at: new Date().toISOString()
  };
}

export function getApiKeyByKey(key: string): ApiKey | null {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM api_keys WHERE key = ? AND active = 1 LIMIT 1');
  const apiKey = stmt.get(key) as (ApiKey & { active: number }) | undefined;

  if (!apiKey) return null;

  return {
    ...apiKey,
    active: apiKey.active === 1
  };
}

export function getApiKeysByProject(projectId: string): ApiKey[] {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM api_keys WHERE project_id = ? ORDER BY created_at DESC');
  const keys = stmt.all(projectId) as (ApiKey & { active: number })[];

  return keys.map((key) => ({
    ...key,
    active: key.active === 1
  }));
}

export function deactivateApiKey(keyId: string): void {
  const db = getDB();

  const stmt = db.prepare('UPDATE api_keys SET active = 0 WHERE id = ?');
  stmt.run(keyId);
}
