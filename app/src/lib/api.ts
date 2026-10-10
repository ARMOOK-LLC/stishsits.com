import type { ClientFlag, Sample } from './stillness';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8787';

export interface ContestSummary {
  id: string;
  status: string;
  entrantCount: number;
  terms: {
    title: string;
    division: string;
    entryAmount: number;
    promoterBps: number;
    venueBps: number;
    refereeBps: number;
  };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = await r.json();
  if (!r.ok) throw new Error(body?.error ?? `HTTP ${r.status}`);
  return body as T;
}

export const api = {
  contests: () => call<ContestSummary[]>('/v1/contests'),
  join: (id: string, address: string) =>
    call(`/v1/contests/${id}/join`, { method: 'POST', body: JSON.stringify({ address }) }),
  pulse: (id: string) =>
    call<{ elapsedMs: number; pulse: { index: number; nonce: string; expiresInMs: number } | null }>(
      `/v1/contests/${id}/pulse`,
    ),
  answerPulse: (id: string, address: string, index: number, nonce: string) =>
    call<{ ok: boolean }>(`/v1/contests/${id}/pulse`, {
      method: 'POST',
      body: JSON.stringify({ address, index, nonce }),
    }),
  submitMotion: (id: string, address: string, samples: Sample[], flags: ClientFlag[]) =>
    call<{ verdict: { stillMs: number; moved: boolean; flags: string[] }; logSha256: string }>(
      `/v1/contests/${id}/motion`,
      { method: 'POST', body: JSON.stringify({ address, samples, flags }) },
    ),
};
