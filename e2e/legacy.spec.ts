import { test, expect } from './fixtures';

// Regression for the incident: legacy callers have no taxId and must still succeed.
test('LegacyIntegration without taxId returns 201 and stores a record', async ({ api, track }) => {
  const res = await api.post('/api/onboarding', {
    data: {
      companyName: 'Legacy Co',
      ownerEmail: 'legacy@example.com',
      product: 'Standard',
      source: 'LegacyIntegration',
    },
  });
  expect(res.status()).toBe(201);
  const { id } = await res.json();
  track(id);

  const stored = await api.get(`/api/records/${id}`);
  expect(stored.status()).toBe(200);
  expect(await stored.json()).toMatchObject({
    companyName: 'Legacy Co',
    source: 'LegacyIntegration',
    taxId: null,
  });
});

test('WebForm without taxId is still rejected with 400', async ({ api }) => {
  const res = await api.post('/api/onboarding', {
    data: {
      companyName: 'Web Co',
      ownerEmail: 'web@example.com',
      product: 'Standard',
      source: 'WebForm',
    },
  });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain('taxId');
});
