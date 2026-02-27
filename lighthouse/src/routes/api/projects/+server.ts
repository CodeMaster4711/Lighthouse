// Lighthouse Log Collector - Projects API Endpoint

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createProjectSchema } from '$lib/shared/schemas';
import { createProject, getProjectsByOwner } from '$lib/server/repositories/projects';
import { generateApiKey } from '$lib/server/repositories/api-keys';
import type { ApiResponse } from '$lib/shared/types';

export const POST: RequestHandler = async (event) => {
  try {
    const body = await event.request.json();
    const validatedData = createProjectSchema.parse(body);

    const ownerId = body.owner_id || 'users:default';

    const project = await createProject(validatedData.name, ownerId);

    const apiKey = await generateApiKey(project.id!);

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

    const projects = await getProjectsByOwner(ownerId);

    return json<ApiResponse>({
      success: true,
      data: projects
    });
  } catch (err) {
    console.error('[ERROR] projects_retrieval_failed error=' + (err instanceof Error ? err.message : 'unknown'));

    return json<ApiResponse>({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve projects'
    }, { status: 400 });
  }
};
