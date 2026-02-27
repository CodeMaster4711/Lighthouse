// Lighthouse Log Collector - API Client

import type { LogEntry, ApiResponse, CreateLogRequest } from '$lib/shared/types';

export class ApiClient {
  constructor(private apiKey: string) {}

  async createLog(log: CreateLogRequest): Promise<LogEntry> {
    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(log)
    });

    const result: ApiResponse<LogEntry> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create log');
    }

    return result.data;
  }

  async getLogs(params?: {
    level?: string;
    source?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();

    if (params?.level) queryParams.set('level', params.level);
    if (params?.source) queryParams.set('source', params.source);
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const response = await fetch(`/api/logs?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    const result: ApiResponse<LogEntry[]> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to retrieve logs');
    }

    return result.data;
  }
}
