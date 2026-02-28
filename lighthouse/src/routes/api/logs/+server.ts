// Lighthouse Log Collector - Logs API Endpoint

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createLogSchema, getLogsQuerySchema } from '$lib/shared/schemas';
import { createLog, getLogs, getLogsCount } from '$lib/server/repositories/logs';
import { getOrCreateProject } from '$lib/server/repositories/projects';
import { generateApiKey, getApiKeysByProject } from '$lib/server/repositories/api-keys';
import type { ApiResponse } from '$lib/shared/types';

export const POST: RequestHandler = async (event) => {
  try {
    const body = await event.request.json();
    const validatedData = createLogSchema.parse(body);

    let projectId = validatedData.project_id;
    const projectName = validatedData.project_name;

    if (!projectId && projectName) {
      const ownerId = 'users:default';
      const project = getOrCreateProject(projectName, ownerId);
      projectId = project.id;

      const apiKeys = getApiKeysByProject(projectId);
      if (apiKeys.length === 0) {
        generateApiKey(projectId);
        console.log('[INFO] project_auto_created project_id=' + projectId + ' name=' + projectName);
      }
    }

    if (!projectId) {
      projectId = 'projects:default';
    }

    const log = createLog({
      level: validatedData.level,
      message: validatedData.message,
      source: validatedData.source,
      metadata: validatedData.metadata,
      timestamp: validatedData.timestamp,
      project_id: projectId
    });

    console.log('[INFO] log_created level=' + log.level + ' source=' + log.source + ' project_id=' + projectId);

    return json<ApiResponse>({
      success: true,
      data: log
    }, { status: 201 });
  } catch (err) {
    console.error('[ERROR] log_creation_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create log'
    }, { status: 400 });
  }
};

export const GET: RequestHandler = async (event) => {
  try {
    const queryParams = Object.fromEntries(event.url.searchParams);
    const validatedQuery = getLogsQuerySchema.parse(queryParams);

    const projectId = event.url.searchParams.get('project_id') || undefined;

    const logs = getLogs(validatedQuery, projectId);
    const total = getLogsCount(validatedQuery, projectId);

    return json<ApiResponse>({
      success: true,
      data: logs,
      total
    });
  } catch (err) {
    console.error('[ERROR] logs_retrieval_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve logs'
    }, { status: 400 });
  }
};
