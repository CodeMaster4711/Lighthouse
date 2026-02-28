// Lighthouse Log Collector - Validation Schemas

import { z } from 'zod';

export const logLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']);

export const createLogSchema = z.object({
  level: logLevelSchema,
  message: z.string().min(1).max(5000),
  source: z.string().min(1).max(255),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  project_name: z.string().min(1).max(255).optional()
});

export const getLogsQuerySchema = z.object({
  level: logLevelSchema.optional(),
  source: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0)
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255)
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
