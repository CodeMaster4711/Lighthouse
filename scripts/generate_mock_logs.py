import sqlite3
import random
import secrets
from datetime import datetime, timedelta
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, '..', 'lighthouse', 'data', 'lighthouse.db')

PROJECTS = [
    'E-Commerce Platform',
    'Mobile App',
    'Analytics Dashboard'
]

SERVICES = ['frontend', 'backend', 'database', 'api', 'worker', 'auth']

LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR']
LEVEL_WEIGHTS = [0.25, 0.50, 0.15, 0.10]

MESSAGES = {
    'DEBUG': [
        'Cache hit for key',
        'Query execution time',
        'Request headers validated',
        'Session cookie parsed',
        'Environment variable loaded'
    ],
    'INFO': [
        'User authenticated successfully',
        'Database query executed',
        'File upload completed',
        'Email sent to user',
        'Cache invalidated',
        'API request processed',
        'Background job started',
        'Configuration reloaded',
        'Webhook received',
        'Payment processed'
    ],
    'WARN': [
        'High memory usage detected',
        'Slow query detected',
        'Rate limit approaching',
        'Deprecated API endpoint used',
        'Configuration missing, using default',
        'Connection pool near capacity'
    ],
    'ERROR': [
        'Database connection failed',
        'Authentication token expired',
        'File not found',
        'Invalid input data',
        'External API timeout',
        'Unexpected null value',
        'Permission denied'
    ]
}

def generate_api_key():
    return f"lh_{secrets.token_urlsafe(32)}"

def generate_metadata(level, service):
    base = {
        'service': service,
        'environment': random.choice(['production', 'staging', 'development']),
        'host': f'{service}-{random.randint(1, 3)}.local'
    }

    if level == 'ERROR':
        base['stack_trace'] = f'Error at line {random.randint(1, 500)}'
        base['error_code'] = f'E{random.randint(1000, 9999)}'
    elif level == 'WARN':
        base['threshold'] = random.randint(70, 95)

    if service in ['api', 'backend']:
        base['duration_ms'] = random.randint(10, 5000)
        base['endpoint'] = random.choice(['/api/users', '/api/products', '/api/orders', '/api/auth'])

    return base

def create_projects(conn):
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM users LIMIT 1')
    user_row = cursor.fetchone()
    if not user_row:
        raise Exception('No users found in database')

    user_id = user_row[0]

    cursor.execute('DELETE FROM logs')
    cursor.execute('DELETE FROM api_keys')
    cursor.execute('DELETE FROM projects WHERE owner_id = ?', (user_id,))

    project_ids = []

    for project_name in PROJECTS:
        cursor.execute(
            'INSERT INTO projects (id, name, owner_id) VALUES (?, ?, ?)',
            (secrets.token_urlsafe(16), project_name, user_id)
        )
        project_id = cursor.lastrowid
        project_ids.append(cursor.execute('SELECT id FROM projects WHERE rowid = ?', (project_id,)).fetchone()[0])

        api_key = generate_api_key()
        cursor.execute(
            'INSERT INTO api_keys (id, key, project_id, active) VALUES (?, ?, ?, ?)',
            (secrets.token_urlsafe(16), api_key, project_ids[-1], 1)
        )

    conn.commit()
    return project_ids

def generate_logs(conn, project_ids):
    cursor = conn.cursor()
    now = datetime.now()
    logs_per_project = 300

    for project_id in project_ids:
        for _ in range(logs_per_project):
            days_ago = random.uniform(0, 7)
            timestamp = now - timedelta(days=days_ago)

            level = random.choices(LOG_LEVELS, weights=LEVEL_WEIGHTS)[0]
            service = random.choice(SERVICES)
            message = random.choice(MESSAGES[level])
            metadata = generate_metadata(level, service)

            cursor.execute(
                'INSERT INTO logs (id, level, message, timestamp, source, metadata, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                (
                    secrets.token_urlsafe(16),
                    level,
                    message,
                    timestamp.isoformat(),
                    service,
                    json.dumps(metadata),
                    project_id
                )
            )

    conn.commit()

def main():
    conn = sqlite3.connect(DB_PATH)

    try:
        print('Creating projects...')
        project_ids = create_projects(conn)
        print(f'Created {len(project_ids)} projects')

        print('Generating mock logs...')
        generate_logs(conn, project_ids)

        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM logs')
        total_logs = cursor.fetchone()[0]
        print(f'Generated {total_logs} logs')

        print('Mock data generation completed successfully')

    finally:
        conn.close()

if __name__ == '__main__':
    main()
