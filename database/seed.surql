-- Lighthouse Log Collector Seed Data
-- Optional: Create test data for development

USE NS lighthouse;
USE DB logs;

-- Create a test user
CREATE users:test_user SET
  email = 'test@lighthouse.dev',
  password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMye.IizJJ4cQLVMhCbKdLJ8BpCW7xYM1gC',
  created_at = time::now();

-- Create a test project
CREATE projects:test_project SET
  name = 'Test Project',
  owner_id = users:test_user,
  created_at = time::now();

-- Create a test API key
CREATE api_keys:test_key SET
  key = 'lh_test_key_12345678901234567890',
  project_id = projects:test_project,
  active = true,
  created_at = time::now();

-- Create sample logs
CREATE logs SET
  level = 'INFO',
  message = 'Application started successfully',
  timestamp = time::now(),
  source = 'backend',
  metadata = { version: '1.0.0', environment: 'development' },
  project_id = projects:test_project;

CREATE logs SET
  level = 'WARN',
  message = 'High memory usage detected',
  timestamp = time::now(),
  source = 'backend',
  metadata = { memory_usage_mb: 512, threshold_mb: 400 },
  project_id = projects:test_project;

CREATE logs SET
  level = 'ERROR',
  message = 'Database connection timeout',
  timestamp = time::now(),
  source = 'backend',
  metadata = { error: 'ETIMEDOUT', retry_count: 3 },
  project_id = projects:test_project;

CREATE logs SET
  level = 'DEBUG',
  message = 'Request received',
  timestamp = time::now(),
  source = 'frontend',
  metadata = { path: '/api/logs', method: 'GET', user_agent: 'Mozilla/5.0' },
  project_id = projects:test_project;
