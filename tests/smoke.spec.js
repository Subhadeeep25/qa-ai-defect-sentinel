import { test, expect } from '../fixtures/index.js';

test.describe('Smoke TC156-TC160', () => {
  test('TC156 - @smoke Page loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
    await expect(page).toHaveTitle('BuggyShop');
  });

  test('TC157 - @smoke Products displayed with name, price, stock, image, button', async ({ homePage }) => {
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
    const first = homePage.productCards.first();
    await expect(first.locator('h3')).toBeVisible();
    await expect(first.locator('.price')).toBeVisible();
    await expect(first.locator('.stock')).toBeVisible();
    await expect(first.locator('img')).toBeVisible();
    await expect(first.locator('button')).toBeVisible();
  });

  test('TC158 - @smoke Add to Cart adds item and increments badge', async ({ homePage, cartComponent }) => {
    await homePage.open();
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC159 - @smoke Search filters grid', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('iPhone');
    expect(await homePage.getProductCardCount()).toBe(1);
  });

  test('TC160 - @smoke Cart total updates after add', async ({ homePage, cartComponent }) => {
    await homePage.open();
    await homePage.clickAddToCart(0);
    const total = await cartComponent.getTotalText();
    expect(total).toContain('Total');
    expect(total).toContain('69900');
  });
});
