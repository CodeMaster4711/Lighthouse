import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import type { ApiResponse } from '$lib/shared/types';

export const GET: RequestHandler = async () => {
  try {
    const db = getDB();

    const logFrequency = db.prepare(`
      SELECT
        DATE(l.timestamp) as date,
        p.id as project_id,
        p.name as project_name,
        COUNT(*) as count
      FROM logs l
      JOIN projects p ON l.project_id = p.id
      WHERE l.timestamp >= datetime('now', '-90 days')
      GROUP BY DATE(l.timestamp), p.id, p.name
      ORDER BY date ASC
    `).all() as { date: string; project_id: string; project_name: string; count: number }[];

    const projectStats = db.prepare(`
      SELECT
        p.id,
        p.name,
        COUNT(l.id) as log_count,
        MAX(l.timestamp) as last_log
      FROM projects p
      LEFT JOIN logs l ON l.project_id = p.id
      GROUP BY p.id, p.name
      ORDER BY log_count DESC
    `).all() as { id: string; name: string; log_count: number; last_log: string }[];

    const totalLogs = db.prepare('SELECT COUNT(*) as count FROM logs').get() as { count: number };

    const recentTrend = db.prepare(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE timestamp >= datetime('now', '-7 days')
    `).get() as { count: number };

    const previousWeekTrend = db.prepare(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE timestamp >= datetime('now', '-14 days')
        AND timestamp < datetime('now', '-7 days')
    `).get() as { count: number };

    const trendPercentage = previousWeekTrend.count > 0
      ? ((recentTrend.count - previousWeekTrend.count) / previousWeekTrend.count) * 100
      : 0;

    const errorCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE level = 'ERROR'
        AND timestamp >= datetime('now', '-7 days')
    `).get() as { count: number };

    return json<ApiResponse>({
      success: true,
      data: {
        logFrequency,
        projectStats,
        totalLogs: totalLogs.count,
        recentTrend: recentTrend.count,
        trendPercentage: Math.round(trendPercentage * 10) / 10,
        errorCount: errorCount.count
      }
    });
  } catch (err) {
    console.error('[ERROR] dashboard_data_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load dashboard data'
    }, { status: 500 });
  }
};
