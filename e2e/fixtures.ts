import { test as base, expect, type APIRequestContext } from '@playwright/test';

export type Payload = {
  companyName: string;
  ownerEmail: string;
  product: string;
  taxId?: string;
  source: 'WebForm' | 'LegacyIntegration';
};

type Records = {
  api: APIRequestContext;
  /** Track an id so it is deleted after the test, pass or fail. */
  track: (id: string) => void;
  /** Create a record through the API (data setup). Tracked for teardown. */
  seed: (p: Payload) => Promise<{ id: string }>;
};

export const test = base.extend<Records>({
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL });
    await use(ctx);
    await ctx.dispose();
  },
  track: async ({ api }, use) => {
    const ids: string[] = [];
    await use((id) => ids.push(id));
    // Teardown runs even when the test body failed.
    for (const id of ids) await api.delete(`/api/records/${id}`);
  },
  seed: async ({ api, track }, use) => {
    await use(async (p) => {
      const res = await api.post('/api/onboarding', { data: p });
      expect(res.status()).toBe(201);
      const rec = await res.json();
      track(rec.id);
      return rec;
    });
  },
});

export { expect };
