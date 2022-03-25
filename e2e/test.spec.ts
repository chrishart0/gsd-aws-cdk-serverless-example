import { test, expect, Page } from '@playwright/test';
const fs = require('fs')

// Figure url from config file
const data = fs.readFileSync('../configs.env', 'utf8')
const regexp = /(?<=REACT_APP_DOMAIN=).*/g;
const extractedUrl = data.match(regexp);

// If E2E_TEST_URL is provided then use it, otherwise parse config.env file
const url = (process.env.E2E_TEST_URL) ? process.env.E2E_TEST_URL : "https://" + extractedUrl[0]
console.log("Testing url: ", url)

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test.describe('Front page, non-interactive tests', () => {

  test('header appears as expected', async ({ page }) => { 
    await expect(page.locator('text="Welcome to this demo site!"')).toBeVisible();
  });

  test('footer appears as expected', async ({ page }) => { 
    await expect(page.locator('text="Edit on Github!"')).toBeVisible();
  });

});

test.describe('Test Navigation Bar', () => {

  test('Navbar appears as expected', async ({ page }) => {    
    await expect(page.locator('.AppBar')).toBeVisible();
  });

});

test.describe('that visitor counter works', () => {

  test('visitor counter is visible', async ({ page }) => {    
    await expect(page.locator('.visitorCounter')).toBeVisible();
  });

  test('visitor counter got a valid number from the API', async ({ page }) => {   
    await expect(page.locator('.visitorCounter')).toContainText(/Visitor Count: \d/);
  });

});

