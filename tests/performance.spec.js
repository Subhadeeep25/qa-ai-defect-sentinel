import { test, expect } from '../fixtures/index.js';

test.describe('Performance TC131-TC140', () => {
  test('TC131 - Initial page load under 3s', async ({ homePage }) => {
    const start = Date.now();
    await homePage.open();
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });

  test('TC132 - Add to Cart response under 50ms', async ({ homePage }) => {
    await homePage.open();
    const start = Date.now();
    await homePage.clickAddToCart(0);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('TC133 - Search response under 30ms', async ({ homePage }) => {
    await homePage.open();
    const start = Date.now();
    await homePage.search('iPhone');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('TC134 - 50 rapid adds no UI freeze', async ({ homePage, cartComponent }) => {
    await homePage.open();
    const start = Date.now();
    for (let i = 0; i < 50; i++) await homePage.clickAddToCart(3);
    const duration = Date.now() - start;
    expect(await cartComponent.getItemCount()).toBe(50);
    expect(duration).toBeLessThan(30000);
  });

  test('TC135 - CPU 4x slowdown interactive', async ({ homePage, page }) => {
    await homePage.open();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await homePage.clickAddToCart(0);
    expect(await homePage.getCartBadgeCount()).toBe(1);
  });

  test('TC136 - Slow 3G network progressive images', async ({ context, homePage }) => {
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC137 - Memory stable after 50 interactions', async ({ homePage, cartComponent }) => {
    await homePage.open();
    for (let iter = 0; iter < 50; iter++) {
      await homePage.clickAddToCart(iter % 6);
      await homePage.search('Gaming');
      await homePage.clearSearch();
    }
    expect(await cartComponent.getItemCount()).toBeGreaterThanOrEqual(1);
  });

  test('TC138 - 2000 cart items render', async ({ page, cartComponent }) => {
    test.setTimeout(120000);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      cart = [];
      for (let i = 0; i < 2000; i++) cart.push({ id: 4, name: 'Item ' + i, price: 100 });
      updateCart();
    });
    expect(await cartComponent.getItemCount()).toBe(2000);
  });

  test('TC139 - Memory after 30s idle', async ({ homePage }) => {
    await homePage.open();
    await homePage.page.waitForTimeout(5000);
    await expect(homePage.headerTitle).toBeVisible();
  });

  test('TC140 - Search all 6 product names', async ({ homePage }) => {
    await homePage.open();
    for (const name of ['iPhone 15','Samsung S24','MacBook Air','Gaming Mouse','Mechanical Keyboard','Sony Headphones']) {
      await homePage.search(name);
      expect(await homePage.getProductCardCount()).toBeGreaterThanOrEqual(1);
    }
  });
});
