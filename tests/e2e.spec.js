const { test, expect } = require('@playwright/test');

test('loads a pack and shows study UI', async ({ page }) => {
  await page.goto('/');

  await page.selectOption('#pack-select', 'metro');
  await page.click('#load-pack-btn');

  await expect(page.locator('#study-area')).toBeVisible();
  await expect(page.locator('#pack-name')).toHaveText('Shanghai Metro');
  await expect(page.locator('#card-counter')).toContainText('Card 1 of 8');
});

test('hard-card filter exits when last hard card is rerated', async ({ page }) => {
  await page.goto('/');

  await page.selectOption('#pack-select', 'metro');
  await page.click('#load-pack-btn');
  await page.click('#advanced-mastery-toggle');

  await page.click('#current-card');
  await page.click('button[data-rating="hard"]');
  await page.click('#filter-button');

  await expect(page.locator('#card-counter')).toContainText('Card 1 of 1');

  page.on('dialog', (dialog) => dialog.accept());
  await page.click('#current-card');
  await page.click('button[data-rating="easy"]');

  await expect(page.locator('#card-counter')).toContainText('Card 1 of 8');
});

test('starred review exits when last starred card is unstarred', async ({ page }) => {
  await page.goto('/');

  await page.selectOption('#pack-select', 'metro');
  await page.click('#load-pack-btn');
  await page.click('#advanced-mastery-toggle');

  await page.click('#star-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');
  await page.click('#next-card-btn');

  await page.click('#review-starred-btn');
  await expect(page.locator('#card-counter')).toContainText('Card 1 of 1');

  page.on('dialog', (dialog) => dialog.accept());
  await page.click('#star-btn');

  await expect(page.locator('#card-counter')).toContainText('Card 1 of 8');
});
