import { test, expect } from './fixtures';

const unique = () => `Acme ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

test('web form creates a record with source WebForm', async ({ page, api, track }) => {
  const companyName = unique();
  await page.goto('/');
  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Owner email').fill('owner@example.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Product').selectOption('Premium');
  await page.getByLabel('Tax ID').fill('TX-123456');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('#recordId')).not.toBeEmpty();
  const id = (await page.locator('#recordId').textContent())!;
  track(id);

  const res = await api.get(`/api/records/${id}`);
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({
    companyName,
    ownerEmail: 'owner@example.com',
    product: 'Premium',
    taxId: 'TX-123456',
    source: 'WebForm',
  });
});

test('web form shows an error when taxId is missing', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Company name').fill(unique());
  await page.getByLabel('Owner email').fill('owner@example.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('alert')).toContainText('taxId is required');
});

test('seeded record can be read back (setup and teardown via API)', async ({ api, seed }) => {
  const rec = await seed({
    companyName: unique(),
    ownerEmail: 'a@example.com',
    product: 'Standard',
    taxId: 'TX-1',
    source: 'WebForm',
  });
  expect((await api.get(`/api/records/${rec.id}`)).status()).toBe(200);
});
