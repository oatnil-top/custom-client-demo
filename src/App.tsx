import { useState, useEffect, useCallback } from "react";
import { UdClient, Task } from "./ud-client";
import "./App.css";

function App() {
  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem("ud_server_url") || "http://localhost:4000"
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("ud_api_key") || ""
  );
  const [connected, setConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const getClient = useCallback(() => {
    return new UdClient({
      baseUrl: serverUrl,
      apiKey,
      channel: "custom-client-demo",
    });
  }, [serverUrl, apiKey]);

  const connect = async () => {
    setError("");
    localStorage.setItem("ud_server_url", serverUrl);
    localStorage.setItem("ud_api_key", apiKey);
    try {
      const client = getClient();
      const list = await client.listTasks();
      setTasks(list);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    }
  };

  const refresh = useCallback(async () => {
    try {
      const list = await getClient().listTasks();
      setTasks(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tasks");
    }
  }, [getClient]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await getClient().createTask({ title: newTitle.trim() });
      setNewTitle("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task");
    }
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === "done" ? "todo" : "done";
    try {
      await getClient().updateTask(task.id, { status: next });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await getClient().deleteTask(id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete task");
    }
  };

  useEffect(() => {
    if (connected) {
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
    }
  }, [connected, refresh]);

  if (!connected) {
    return (
      <div className="app">
        <h1>UnDercontrol Custom Client Demo</h1>
        <p className="subtitle">
          Connect to your UnDercontrol server using an API key.
        </p>

        <div className="connect-form">
          <label>
            Server URL
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:4000"
            />
          </label>
          <label>
            API Key
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ak_..."
            />
          </label>
          <button onClick={connect}>Connect</button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="info">
          <h3>How to get an API key</h3>
          <ol>
            <li>Log in to your UnDercontrol instance</li>
            <li>Go to Profile &rarr; API Keys</li>
            <li>Create a new key and paste it above</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Tasks</h1>
        <button
          className="disconnect"
          onClick={() => {
            setConnected(false);
            setTasks([]);
          }}
        >
          Disconnect
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="add-task">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="New task..."
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.status === "done" ? "done" : ""}>
            <button className="toggle" onClick={() => toggleStatus(task)}>
              {task.status === "done" ? "✓" : "○"}
            </button>
            <span className="title">{task.title}</span>
            <span className="status">{task.status}</span>
            <button className="delete" onClick={() => deleteTask(task.id)}>
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="empty">No tasks yet</li>}
      </ul>
    </div>
  );
}

export default App;
