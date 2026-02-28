import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLogStatistics, getLogDistribution, getProjectServices } from '$lib/server/repositories/logs';

export const GET: RequestHandler = async ({ url }) => {
  const projectId = url.searchParams.get('project_id') || undefined;

  const statistics = getLogStatistics(projectId);
  const distribution = getLogDistribution(projectId);
  const services = getProjectServices(projectId);

  return json({
    statistics,
    distribution,
    services
  });
};
