import { API_BASE_URL } from "./constants";
import { Session, Topic } from "./types";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createSession(body: {
  topic: string;
  mode: string;
  user_position?: string | null;
  total_rounds: number;
}): Promise<Session> {
  return apiFetch<Session>("/api/sessions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getSession(sessionId: string): Promise<Session> {
  return apiFetch<Session>(`/api/sessions/${sessionId}`);
}

export async function listSessions(status?: string): Promise<Session[]> {
  const q = status ? `?status=${status}` : "";
  return apiFetch<Session[]>(`/api/sessions${q}`);
}

export async function getTopics(params?: {
  category?: string;
  difficulty?: string;
}): Promise<Topic[]> {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Topic[]>(`/api/topics${q ? "?" + q : ""}`);
}
