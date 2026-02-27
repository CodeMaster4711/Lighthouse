-- Lighthouse Log Collector - Seed Data

-- Create default user
INSERT OR IGNORE INTO users (id, email, password_hash, created_at)
VALUES ('users:default', 'default@lighthouse.local', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IizJJ4cQLVMhCbKdLJ8BpCW7xYM1gC', datetime('now'));
