import type { Candidate, ColumnsConfig } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    ...init
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function getCandidates(): Promise<Candidate[]> {
  return request<Candidate[]>("/api/candidates");
}

export function getColumns(): Promise<ColumnsConfig> {
  return request<ColumnsConfig>("/api/columns");
}

export function getRejectionReasons(): Promise<string[]> {
  return request<string[]>("/api/rejection-reasons");
}

export function addRejectionReason(reason: string): Promise<string[]> {
  return request<string[]>("/api/rejection-reasons", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function approveCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`/api/candidates/${id}/approve`, {
    method: "PUT"
  });
}

export function rejectCandidate(id: string, reason: string): Promise<Candidate> {
  return request<Candidate>(`/api/candidates/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason })
  });
}
