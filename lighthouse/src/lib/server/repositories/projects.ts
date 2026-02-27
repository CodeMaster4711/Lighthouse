// Lighthouse Log Collector - Projects Repository

import { getDB } from '../db';
import type { Project } from '$lib/shared/types';
import { nanoid } from 'nanoid';

export async function createProject(name: string, ownerId: string): Promise<Project> {
  const db = await getDB();

  const id = 'projects:' + nanoid();
  const result = await db.create(id, {
    name,
    owner_id: ownerId,
    created_at: new Date().toISOString()
  });

  return result as Project;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDB();

  const result = await db.select<Project>(id);
  return result || null;
}

export async function getProjectsByOwner(ownerId: string): Promise<Project[]> {
  const db = await getDB();

  const result = await db.query<[Project[]]>(
    'SELECT * FROM projects WHERE owner_id = $owner_id ORDER BY created_at DESC',
    { owner_id: ownerId }
  );

  return result[0] || [];
}
