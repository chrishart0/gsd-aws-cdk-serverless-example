import { test, expect, Page } from '@playwright/test';
const url = 'http://localhost:3000/'

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test.describe('Front page, non-interactive tests', () => {

  test('header appears as expected', async ({ page }) => {    
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('text="Welcome to this demo site!"')).toBeVisible();
  });

  test('footer appears as expected', async ({ page }) => {    
    await expect(page.locator('.footer')).toBeVisible();
    await expect(page.locator('text="Edit on Github!"')).toBeVisible();
  });

});

test.describe('Test Navigation Bar', () => {

  test('Navbar appears as expected', async ({ page }) => {    
    await expect(page.locator('.AppBar')).toBeVisible();
    //await expect(page.locator()
  });

});

test.describe('that visitor counter works', () => {

  test('visitor counter is visible', async ({ page }) => {    
    await expect(page.locator('.visitorCounter')).toBeVisible();
    await expect(page.locator('text="Visitor Count:"')).toBeVisible();
  });

  test('visitor counter got a valid number from the API', async ({ page }) => {   
    const visitorCounter = await expect(page.locator('.visitorCounter')).toContainText(/Visitor Count: \d/);
  });

});

