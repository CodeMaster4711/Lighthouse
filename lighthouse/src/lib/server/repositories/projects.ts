// Lighthouse Log Collector - Projects Repository

import { getDB } from '../db';
import type { Project } from '$lib/shared/types';
import { nanoid } from 'nanoid';

export function createProject(name: string, ownerId: string): Project {
  const db = getDB();

  const id = 'projects:' + nanoid();

  const stmt = db.prepare(
    "INSERT INTO projects (id, name, owner_id, created_at) VALUES (?, ?, ?, datetime('now'))"
  );

  stmt.run(id, name, ownerId);

  return {
    id,
    name,
    owner_id: ownerId,
    created_at: new Date().toISOString()
  };
}

export function getProjectById(id: string): Project | null {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const project = stmt.get(id) as Project | undefined;

  return project || null;
}

export function getProjectsByOwner(ownerId: string): Project[] {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM projects WHERE owner_id = ? ORDER BY created_at DESC');
  const projects = stmt.all(ownerId) as Project[];

  return projects;
}
