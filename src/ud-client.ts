/**
 * UnDercontrol API Client
 *
 * A minimal client that authenticates with an API key and sets the
 * X-UD-Channel header so every request is auditable.
 */

export interface UdClientConfig {
  baseUrl: string;
  apiKey: string;
  /** Channel name for audit trail (e.g. "my-app"). Defaults to "unknown". */
  channel?: string;
}

export class UdClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: UdClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "X-UD-Channel": config.channel ?? "unknown",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${method} ${path} → ${res.status}: ${text}`);
    }
    return res.json();
  }

  // ── Tasks ──────────────────────────────────────────────

  async listTasks(): Promise<Task[]> {
    return this.request("GET", "/task");
  }

  async getTask(id: string): Promise<Task> {
    return this.request("GET", `/task/${id}`);
  }

  async createTask(task: CreateTaskInput): Promise<Task> {
    return this.request("POST", "/task", task);
  }

  async updateTask(id: string, task: Partial<CreateTaskInput>): Promise<Task> {
    return this.request("PUT", `/task/${id}`, task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.request("DELETE", `/task/${id}`);
  }
}

// ── Types ──────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  tags?: string[];
}
