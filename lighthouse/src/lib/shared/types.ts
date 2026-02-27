// Lighthouse Log Collector - Shared Types

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, unknown>;
  project_id: string;
}

export interface User {
  id?: string;
  email: string;
  password_hash?: string;
  created_at?: string;
}

export interface Project {
  id?: string;
  name: string;
  owner_id: string;
  created_at?: string;
}

export interface ApiKey {
  id?: string;
  key: string;
  project_id: string;
  active: boolean;
  created_at?: string;
}

export interface CreateLogRequest {
  level: LogLevel;
  message: string;
  source: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface GetLogsQuery {
  level?: LogLevel;
  source?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
