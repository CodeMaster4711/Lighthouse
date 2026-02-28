import { getProjectsByOwner } from '$lib/server/repositories/projects';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  const defaultUserId = 'users:default';
  const projects = getProjectsByOwner(defaultUserId);

  return {
    projects: projects.map(project => ({
      id: project.id,
      name: project.name,
      url: `/logs?project=${project.id}`,
    }))
  };
};
