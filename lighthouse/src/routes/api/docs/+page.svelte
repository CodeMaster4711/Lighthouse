<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
</script>

<div class="p-6 space-y-6 max-w-6xl mx-auto">
  <div class="space-y-2">
    <h1 class="text-4xl font-bold">Lighthouse API Documentation</h1>
    <p class="text-muted-foreground text-lg">
      REST API for centralized log collection and management
    </p>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Overview</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      <p>
        Lighthouse provides a simple REST API for collecting logs from multiple services.
        Projects are automatically created when you send your first log with a project name.
      </p>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Badge variant="outline">Base URL</Badge>
          <code class="px-2 py-1 bg-muted rounded text-sm font-mono">
            https://your-lighthouse-instance.com/api
          </code>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="outline">Content-Type</Badge>
          <code class="px-2 py-1 bg-muted rounded text-sm font-mono">
            application/json
          </code>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Start</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold mb-2">1. Send Your First Log</h3>
        <p class="text-sm text-muted-foreground mb-3">
          Simply send a POST request with your log data. Include a project_name to automatically create a project.
        </p>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`curl -X POST https://your-lighthouse-instance.com/api/logs \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_name": "my-backend-service",
    "level": "INFO",
    "source": "auth-service",
    "message": "User logged in successfully",
    "metadata": {
      "user_id": "12345",
      "ip": "192.168.1.100"
    }
  }'`}</code></pre>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-2">2. Project Auto-Creation</h3>
        <p class="text-sm text-muted-foreground">
          When you send a log with a project_name that doesn't exist, Lighthouse automatically creates the project and generates an API key for it.
        </p>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-3">
        <Badge variant="destructive">POST</Badge>
        <Card.Title>/api/logs</Card.Title>
      </div>
      <Card.Description>Create a new log entry</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Request Body</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b">
              <tr>
                <th class="text-left py-2 px-3">Field</th>
                <th class="text-left py-2 px-3">Type</th>
                <th class="text-left py-2 px-3">Required</th>
                <th class="text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr>
                <td class="py-2 px-3 font-mono text-xs">project_name</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3"><Badge variant="outline">optional</Badge></td>
                <td class="py-2 px-3">Project name for auto-creation</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">project_id</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3"><Badge variant="outline">optional</Badge></td>
                <td class="py-2 px-3">Existing project ID</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">level</td>
                <td class="py-2 px-3">enum</td>
                <td class="py-2 px-3"><Badge>required</Badge></td>
                <td class="py-2 px-3">DEBUG, INFO, WARN, ERROR</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">source</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3"><Badge>required</Badge></td>
                <td class="py-2 px-3">Service or component name (max 255 chars)</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">message</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3"><Badge>required</Badge></td>
                <td class="py-2 px-3">Log message (1-5000 chars)</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">metadata</td>
                <td class="py-2 px-3">object</td>
                <td class="py-2 px-3"><Badge variant="outline">optional</Badge></td>
                <td class="py-2 px-3">Additional structured data</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">timestamp</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3"><Badge variant="outline">optional</Badge></td>
                <td class="py-2 px-3">ISO 8601 datetime (defaults to now)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Example Request</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{JSON.stringify({
  project_name: "my-api",
  level: "ERROR",
  source: "database-service",
  message: "Connection timeout",
  metadata: {
    host: "db.example.com",
    timeout_ms: 5000,
    retry_count: 3
  },
  timestamp: "2024-02-28T10:30:00.000Z"
}, null, 2)}</code></pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Success Response (201)</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{JSON.stringify({
  success: true,
  data: {
    id: "logs:abc123def456",
    level: "ERROR",
    source: "database-service",
    message: "Connection timeout",
    metadata: {
      host: "db.example.com",
      timeout_ms: 5000,
      retry_count: 3
    },
    timestamp: "2024-02-28T10:30:00.000Z",
    project_id: "projects:xyz789"
  }
}, null, 2)}</code></pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Error Response (400)</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{JSON.stringify({
  success: false,
  error: "Validation error message"
}, null, 2)}</code></pre>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-3">
        <Badge variant="secondary">GET</Badge>
        <Card.Title>/api/logs</Card.Title>
      </div>
      <Card.Description>Retrieve logs with optional filtering</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Query Parameters</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b">
              <tr>
                <th class="text-left py-2 px-3">Parameter</th>
                <th class="text-left py-2 px-3">Type</th>
                <th class="text-left py-2 px-3">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr>
                <td class="py-2 px-3 font-mono text-xs">project_id</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3">Filter by project ID</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">level</td>
                <td class="py-2 px-3">enum</td>
                <td class="py-2 px-3">Filter by log level</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">source</td>
                <td class="py-2 px-3">string</td>
                <td class="py-2 px-3">Filter by source service</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">limit</td>
                <td class="py-2 px-3">number</td>
                <td class="py-2 px-3">Max results (1-1000, default: 100)</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-xs">offset</td>
                <td class="py-2 px-3">number</td>
                <td class="py-2 px-3">Pagination offset (default: 0)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Example Request</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`GET /api/logs?level=ERROR&source=auth-service&limit=50`}</code></pre>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Integration Examples</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-6">
      <div>
        <h4 class="font-semibold mb-2">Node.js / JavaScript</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`async function sendLog(level, source, message, metadata = {}) {
  const response = await fetch('https://your-lighthouse-instance.com/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_name: 'my-service',
      level,
      source,
      message,
      metadata
    })
  });
  return response.json();
}

await sendLog('INFO', 'user-service', 'User created', { user_id: '123' });`}</code></pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Python</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`import requests
import json

def send_log(level, source, message, metadata=None):
    response = requests.post(
        'https://your-lighthouse-instance.com/api/logs',
        headers={'Content-Type': 'application/json'},
        json={
            'project_name': 'my-service',
            'level': level,
            'source': source,
            'message': message,
            'metadata': metadata or {}
        }
    )
    return response.json()

send_log('ERROR', 'payment-service', 'Payment failed', {'order_id': '456'})`}</code></pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Go</h4>
        <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type LogEntry struct {
    ProjectName string                 \`json:"project_name"\`
    Level       string                 \`json:"level"\`
    Source      string                 \`json:"source"\`
    Message     string                 \`json:"message"\`
    Metadata    map[string]interface{} \`json:"metadata,omitempty"\`
}

func SendLog(entry LogEntry) error {
    body, _ := json.Marshal(entry)
    resp, err := http.Post(
        "https://your-lighthouse-instance.com/api/logs",
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    return nil
}`}</code></pre>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Best Practices</Card.Title>
    </Card.Header>
    <Card.Content>
      <ul class="space-y-2 list-disc list-inside text-sm">
        <li>Use consistent source names across your services for better filtering</li>
        <li>Include relevant metadata for debugging (user IDs, request IDs, etc.)</li>
        <li>Use appropriate log levels: DEBUG for development, INFO for events, WARN for issues, ERROR for failures</li>
        <li>Send logs asynchronously to avoid blocking your application</li>
        <li>Use project_name on first request, then cache and reuse project_id for better performance</li>
        <li>Include timestamps from your service for accurate log timing</li>
      </ul>
    </Card.Content>
  </Card.Root>
</div>
