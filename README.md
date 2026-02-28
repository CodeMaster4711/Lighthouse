<div align="center">
  <img src="lighthouse/static/logo/logo.jpg" alt="Lighthouse Logo" width="200" style="border-radius: 16px;"/>

# Lighthouse

**Centralized Log Collection & Monitoring Platform**

A modern, self-hosted alternative for aggregating logs from distributed services with real-time analytics and visualization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Features

- **Auto-provisioning Projects**: Send logs with a project name and Lighthouse automatically creates the project
- **RESTful API**: Simple HTTP API for log ingestion from any service or language
- **Real-time Monitoring**: Live log streaming with filtering by level, service, and time range
- **Visual Analytics**: Charts for log distribution, frequency trends, and service health
- **Structured Metadata**: Store and query rich contextual data with each log entry
- **Multi-level Logging**: Support for DEBUG, INFO, WARN, and ERROR levels
- **Expandable Log View**: Click to expand logs and view full messages and metadata
- **Project Isolation**: Organize logs by projects with individual API keys
- **Self-hosted**: Full control over your data with SQLite storage

## Quick Start

### Docker (Recommended)

Get started in seconds with Docker:

```bash
docker pull ghcr.io/codemaster4711/lighthouse/lighthouse:latest

docker run -d \
  -p 5173:5173 \
  -v lighthouse-data:/app/data \
  -e SESSION_SECRET=your-secret-key \
  --name lighthouse \
  ghcr.io/codemaster4711/lighthouse/lighthouse:latest
```

Or use Docker Compose:

```bash
git clone https://github.com/yourusername/lighthouse.git
cd lighthouse
docker-compose up -d
```

Access the application at `http://localhost:5173`

### Manual Installation

#### Prerequisites

- Node.js 18+
- npm or pnpm

#### Installation Steps

```bash
git clone https://github.com/yourusername/lighthouse.git
cd lighthouse
npm install
```

#### Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`

#### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Sending Logs

Send logs to Lighthouse using a simple HTTP POST request:

```bash
curl -X POST http://your-lighthouse-instance/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "my-api",
    "level": "INFO",
    "source": "auth-service",
    "message": "User login successful",
    "metadata": {
      "user_id": "12345",
      "ip": "192.168.1.100"
    }
  }'
```

### Integration Examples

#### Node.js

```javascript
async function sendLog(level, source, message, metadata = {}) {
  await fetch("http://your-lighthouse-instance/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: "my-service",
      level,
      source,
      message,
      metadata,
    }),
  });
}

await sendLog("ERROR", "payment-service", "Payment failed", {
  order_id: "456",
});
```

#### Python

```python
import requests

def send_log(level, source, message, metadata=None):
    requests.post(
        'http://your-lighthouse-instance/api/logs',
        json={
            'project_name': 'my-service',
            'level': level,
            'source': source,
            'message': message,
            'metadata': metadata or {}
        }
    )

send_log('WARN', 'database-service', 'Connection slow', {'latency_ms': 2500})
```

#### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type LogEntry struct {
    ProjectName string                 `json:"project_name"`
    Level       string                 `json:"level"`
    Source      string                 `json:"source"`
    Message     string                 `json:"message"`
    Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

func SendLog(entry LogEntry) error {
    body, _ := json.Marshal(entry)
    _, err := http.Post(
        "http://your-lighthouse-instance/api/logs",
        "application/json",
        bytes.NewBuffer(body),
    )
    return err
}
```

## API Documentation

Full API documentation is available at `/api/docs` when running the application, or check out the [API Guide](lighthouse/src/routes/api/docs/+page.svelte).

### Key Endpoints

- `POST /api/logs` - Create a log entry
- `GET /api/logs` - Retrieve logs with filtering
- `GET /api/logs/stats` - Get log statistics and analytics
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project

## Tech Stack

- **Frontend**: SvelteKit 5, TypeScript, TailwindCSS, Shadcn-Svelte
- **Backend**: SvelteKit API Routes
- **Database**: SQLite with better-sqlite3
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide Icons

## Project Structure

```
lighthouse/
├── src/
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── server/         # Server-side logic
│   │   │   ├── repositories/  # Data access layer
│   │   │   └── db.ts       # Database connection
│   │   └── shared/         # Shared types and schemas
│   └── routes/
│       ├── api/            # API endpoints
│       ├── logs/           # Logs UI
│       └── api/docs/       # API documentation
├── static/                 # Static assets
└── database/              # SQLite database
```

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

### Database Migrations

Database schema is automatically initialized on first run. Check `src/lib/server/db.ts` for schema definitions.

## Best Practices

- Use consistent `source` names across your services for better filtering
- Include relevant metadata (user IDs, request IDs, trace IDs) for debugging
- Use appropriate log levels:
  - **DEBUG**: Development and debugging information
  - **INFO**: General informational events
  - **WARN**: Warning messages for potentially harmful situations
  - **ERROR**: Error events that might still allow the application to continue
- Send logs asynchronously to avoid blocking your application
- Cache `project_id` after first creation instead of using `project_name` repeatedly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: Check `/api/docs` in your running instance
- Issues: [GitHub Issues](https://github.com/yourusername/lighthouse/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/lighthouse/discussions)
