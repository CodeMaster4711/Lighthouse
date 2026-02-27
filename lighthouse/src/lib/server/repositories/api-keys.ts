// Lighthouse Log Collector - API Keys Repository

import { getDB } from '../db';
import type { ApiKey } from '$lib/shared/types';
import { nanoid } from 'nanoid';

const API_KEY_PREFIX = 'lh_';
const API_KEY_LENGTH = 32;

export async function generateApiKey(projectId: string): Promise<ApiKey> {
  const db = await getDB();

  const key = API_KEY_PREFIX + nanoid(API_KEY_LENGTH);
  const id = 'api_keys:' + nanoid();

  const result = await db.create(id, {
    key,
    project_id: projectId,
    active: true,
    created_at: new Date().toISOString()
  });

  return result as ApiKey;
}

export async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
  const db = await getDB();

  const result = await db.query<[ApiKey[]]>(
    'SELECT * FROM api_keys WHERE key = $key AND active = true LIMIT 1',
    { key }
  );

  return result[0]?.[0] || null;
}

export async function getApiKeysByProject(projectId: string): Promise<ApiKey[]> {
  const db = await getDB();

  const result = await db.query<[ApiKey[]]>(
    'SELECT * FROM api_keys WHERE project_id = $project_id ORDER BY created_at DESC',
    { project_id: projectId }
  );

  return result[0] || [];
}

export async function deactivateApiKey(keyId: string): Promise<void> {
  const db = await getDB();

  await db.merge(keyId, { active: false });
}
