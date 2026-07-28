import { test, expect } from '../fixtures/index.js';

test.describe('Cross-browser TC121-TC130', () => {
  test('TC121 - Chromium renders all features', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.headerTitle).toBeVisible();
    expect(await homePage.getProductCount()).toBe(6);
    await homePage.clickAddToCart(0);
    expect(await homePage.getCartBadgeCount()).toBe(1);
    await homePage.search('iPhone');
    expect(await homePage.getProductCardCount()).toBe(1);
  });

  test('TC122 - Firefox renders correctly', async ({ page, homePage }) => {
    await homePage.open();
    await expect(homePage.headerTitle).toBeVisible();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC123 - Edge renders correctly (Chromium)', async ({ homePage }) => {
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC124 - Safari CSS Grid support', async ({ homePage }) => {
    await homePage.open();
    const grid = await homePage.productGrid.evaluate(el => window.getComputedStyle(el).display);
    expect(grid).toBe('grid');
  });

  test('TC125 - Mobile Chrome 375px', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 375, height: 812 });
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
    await homePage.clickAddToCart(0);
    expect(await homePage.getCartBadgeCount()).toBe(1);
  });

  test('TC126 - Mobile Safari 390px', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 390, height: 844 });
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC127 - Incognito mode works', async ({ browser, homePage }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const hp = new (await import('../pages/HomePage.js')).HomePage(page);
    await hp.open();
    await expect(hp.headerTitle).toBeVisible();
    expect(await hp.getProductCount()).toBe(6);
    await ctx.close();
  });

  test('TC128 - Add to cart + search in any browser', async ({ homePage, cartComponent }) => {
    await homePage.open();
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.search('Samsung');
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC129 - WebView context', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.headerTitle).toBeVisible();
    const title = await homePage.getTitle();
    expect(title).toBe('BuggyShop');
  });

  test('TC130 - IE11 CSS Grid issue', async ({ homePage }) => {
    await homePage.open();
    const display = await homePage.productGrid.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('grid');
  });
});
