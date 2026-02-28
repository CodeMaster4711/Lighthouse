// Lighthouse Log Collector - Projects API Endpoint

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createProjectSchema } from '$lib/shared/schemas';
import { createProject, getProjectsByOwner } from '$lib/server/repositories/projects';
import { generateApiKey, getApiKeysByProject } from '$lib/server/repositories/api-keys';
import { getProjectServices } from '$lib/server/repositories/logs';
import type { ApiResponse } from '$lib/shared/types';

export const POST: RequestHandler = async (event) => {
  try {
    const body = await event.request.json();
    const validatedData = createProjectSchema.parse(body);

    const ownerId = body.owner_id || 'users:default';

    const project = createProject(validatedData.name, ownerId);

    const apiKey = generateApiKey(project.id!);

    console.log('[INFO] project_created project_id=' + project.id + ' name=' + project.name);

    return json<ApiResponse>({
      success: true,
      data: {
        project,
        api_key: apiKey.key
      }
    }, { status: 201 });
  } catch (err) {
    console.error('[ERROR] project_creation_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create project'
    }, { status: 400 });
  }
};

export const GET: RequestHandler = async (event) => {
  try {
    const ownerId = event.url.searchParams.get('owner_id') || 'users:default';

    const projects = getProjectsByOwner(ownerId);

    const projectsWithDetails = projects.map(project => {
      const apiKeys = getApiKeysByProject(project.id);
      return {
        ...project,
        services: getProjectServices(project.id),
        api_key: apiKeys.length > 0 ? apiKeys[0].key : null
      };
    });

    return json<ApiResponse>({
      success: true,
      data: projectsWithDetails
    });
  } catch (err) {
    console.error('[ERROR] projects_retrieval_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve projects'
    }, { status: 400 });
  }
};
