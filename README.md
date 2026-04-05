# UnDercontrol Custom Client Demo

A minimal React app demonstrating how to build a custom client for [UnDercontrol](https://undercontrol.top) using API keys.

## What this shows

- **API Key authentication** — use your UnDercontrol API key (`ak_...`) to access the API
- **Channel header** — sets `X-UD-Channel: custom-client-demo` so all actions are traceable in the audit trail
- **Task CRUD** — list, create, toggle status, and delete tasks

## Quick start

```bash
npm install
npm run dev
```

1. Open `http://localhost:5173`
2. Enter your UnDercontrol server URL and API key
3. Manage your tasks

## How to get an API key

1. Log in to your UnDercontrol instance
2. Go to **Profile → API Keys**
3. Create a new key

## Building your own client

The key integration points are in [`src/ud-client.ts`](src/ud-client.ts):

```typescript
const client = new UdClient({
  baseUrl: "https://your-server.com",
  apiKey: "ak_your_api_key_here",
  channel: "your-app-name", // shows up in audit trail
});

const tasks = await client.listTasks();
await client.createTask({ title: "Hello from my client" });
```

### Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Authorization` | `Bearer ak_...` | Authentication |
| `X-UD-Channel` | Your app name | Audit trail identification |
| `Content-Type` | `application/json` | Request body format |

If you omit `X-UD-Channel`, your actions will be recorded as `api:unknown` in the audit trail.

## Register your client

Want your custom client listed in the official catalog? Submit a PR to this repo adding your client to `CLIENTS.md`.

## License

MIT
