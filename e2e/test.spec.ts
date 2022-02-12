import { test, expect, Page } from '@playwright/test';
const url = 'http://localhost:3000/'

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test.describe('Front page, non-interactive tests', () => {

  test('header appears as expected', async ({ page }) => {    
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('text="Primary Heading"')).toBeVisible();
  });


  test('footer appears as expected', async ({ page }) => {    
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('text="Edit on Github!"')).toBeVisible();
  });
});

