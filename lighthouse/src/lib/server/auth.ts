// Lighthouse Log Collector - Auth Utilities

import type { RequestEvent } from '@sveltejs/kit';
import { getApiKeyByKey } from './repositories/api-keys';
import { getProjectById } from './repositories/projects';

export async function validateApiKey(request: Request): Promise<{ valid: boolean; projectId?: string }> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const apiKey = authHeader.substring(7);

  try {
    const keyRecord = await getApiKeyByKey(apiKey);

    if (!keyRecord || !keyRecord.active) {
      return { valid: false };
    }

    return {
      valid: true,
      projectId: keyRecord.project_id
    };
  } catch (error) {
    console.error('[ERROR] api_key_validation_failed error=' + (error instanceof Error ? error.message : 'unknown'));
    return { valid: false };
  }
}

export async function requireApiKey(event: RequestEvent): Promise<string> {
  const result = await validateApiKey(event.request);

  if (!result.valid || !result.projectId) {
    throw new Error('Invalid or missing API key');
  }

  const project = await getProjectById(result.projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  event.locals.project = {
    id: project.id!,
    name: project.name
  };

  return result.projectId;
}
