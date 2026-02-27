// Lighthouse Log Collector - Logs Repository

import { getDB } from '../db';
import type { LogEntry, GetLogsQuery } from '$lib/shared/types';
import { nanoid } from 'nanoid';

export async function createLog(log: Omit<LogEntry, 'id'>): Promise<LogEntry> {
  const db = await getDB();

  const id = 'logs:' + nanoid();
  const result = await db.create(id, {
    level: log.level,
    message: log.message,
    timestamp: log.timestamp || new Date().toISOString(),
    source: log.source,
    metadata: log.metadata || {},
    project_id: log.project_id
  });

  return result as LogEntry;
}

export async function getLogs(query: GetLogsQuery, projectId: string): Promise<LogEntry[]> {
  const db = await getDB();

  let queryString = 'SELECT * FROM logs WHERE project_id = $project_id';
  const params: Record<string, unknown> = { project_id: projectId };

  if (query.level) {
    queryString += ' AND level = $level';
    params.level = query.level;
  }

  if (query.source) {
    queryString += ' AND source = $source';
    params.source = query.source;
  }

  if (query.start_date) {
    queryString += ' AND timestamp >= $start_date';
    params.start_date = query.start_date;
  }

  if (query.end_date) {
    queryString += ' AND timestamp <= $end_date';
    params.end_date = query.end_date;
  }

  queryString += ' ORDER BY timestamp DESC';
  queryString += ' LIMIT $limit START $offset';
  params.limit = query.limit || 100;
  params.offset = query.offset || 0;

  const result = await db.query<[LogEntry[]]>(queryString, params);
  return result[0] || [];
}

export async function getLogById(id: string, projectId: string): Promise<LogEntry | null> {
  const db = await getDB();

  const result = await db.query<[LogEntry[]]>(
    'SELECT * FROM $id WHERE project_id = $project_id',
    { id, project_id: projectId }
  );

  return result[0]?.[0] || null;
}
