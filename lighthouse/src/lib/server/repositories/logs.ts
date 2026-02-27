// Lighthouse Log Collector - Logs Repository

import { getDB } from '../db';
import type { LogEntry, GetLogsQuery } from '$lib/shared/types';
import { nanoid } from 'nanoid';

export function createLog(log: Omit<LogEntry, 'id'>): LogEntry {
  const db = getDB();

  const id = 'logs:' + nanoid();

  const stmt = db.prepare(
    'INSERT INTO logs (id, level, message, timestamp, source, metadata, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const timestamp = log.timestamp || new Date().toISOString();
  const metadata = log.metadata ? JSON.stringify(log.metadata) : null;

  stmt.run(id, log.level, log.message, timestamp, log.source, metadata, log.project_id);

  return {
    id,
    level: log.level,
    message: log.message,
    timestamp,
    source: log.source,
    metadata: log.metadata,
    project_id: log.project_id
  };
}

export function getLogs(query: GetLogsQuery, projectId: string): LogEntry[] {
  const db = getDB();

  let sql = 'SELECT * FROM logs WHERE project_id = ?';
  const params: any[] = [projectId];

  if (query.level) {
    sql += ' AND level = ?';
    params.push(query.level);
  }

  if (query.source) {
    sql += ' AND source = ?';
    params.push(query.source);
  }

  if (query.start_date) {
    sql += ' AND timestamp >= ?';
    params.push(query.start_date);
  }

  if (query.end_date) {
    sql += ' AND timestamp <= ?';
    params.push(query.end_date);
  }

  sql += ' ORDER BY timestamp DESC';
  sql += ' LIMIT ? OFFSET ?';
  params.push(query.limit || 100);
  params.push(query.offset || 0);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as (LogEntry & { metadata: string | null })[];

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined
  }));
}

export function getLogById(id: string, projectId: string): LogEntry | null {
  const db = getDB();

  const stmt = db.prepare('SELECT * FROM logs WHERE id = ? AND project_id = ?');
  const row = stmt.get(id, projectId) as (LogEntry & { metadata: string | null }) | undefined;

  if (!row) return null;

  return {
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined
  };
}
