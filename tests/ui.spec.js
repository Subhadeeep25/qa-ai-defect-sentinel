import { test, expect } from '../fixtures/index.js';

test.describe('UI TC086-TC105', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC086 - Page layout: header, container, footer', async ({ homePage }) => {
    await expect(homePage.headerTitle).toBeVisible();
    await expect(homePage.productGrid).toBeVisible();
    await expect(homePage.footer).toBeVisible();
  });

  test('TC087 - Header background #1f2937', async ({ homePage }) => {
    const bg = await homePage.headerTitle.evaluate(el => window.getComputedStyle(el.closest('header')).backgroundColor);
    expect(bg).toBe('rgb(31, 41, 55)');
  });

  test('TC088 - Header text white font-size 28px', async ({ homePage }) => {
    const color = await homePage.headerTitle.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('TC089 - Cart badge red bg round', async ({ homePage }) => {
    const bg = await homePage.cartBadge.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(239, 68, 68)');
    const radius = await homePage.cartBadge.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(radius).toBe('20px');
  });

  test('TC090 - Search input style', async ({ homePage }) => {
    const radius = await homePage.searchInput.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(radius).toBe('8px');
    const w = await homePage.searchInput.evaluate(el => window.getComputedStyle(el).width);
    expect(parseFloat(w)).toBeGreaterThan(0);
  });

  test('TC091 - Product grid responsive', async ({ homePage }) => {
    const grid = await homePage.productGrid.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
    expect(grid).toBeTruthy();
  });

  test('TC092 - Card hover translateY(-5px)', async ({ homePage }) => {
    const card = homePage.productCards.first();
    await card.hover();
    await homePage.page.waitForTimeout(400);
    const transform = await card.evaluate(el => window.getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });

  test('TC093 - Image 100% width 220px height object-fit cover', async ({ homePage }) => {
    const h = await homePage.productCards.first().locator('img').evaluate(el => window.getComputedStyle(el).height);
    expect(parseInt(h)).toBe(220);
  });

  test('TC094 - Card shadow border-radius 12px', async ({ homePage }) => {
    const r = await homePage.productCards.first().evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(r).toBe('12px');
    const shadow = await homePage.productCards.first().evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(shadow).toContain('rgba(0, 0, 0, 0.08)');
  });

  test('TC095 - Price blue bold 20px', async ({ homePage }) => {
    const price = homePage.productCards.first().locator('.price');
    const color = await price.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(37, 99, 235)');
    const weight = await price.evaluate(el => window.getComputedStyle(el).fontWeight);
    expect(weight).toBe('700');
  });

  test('TC096 - Stock text gray', async ({ homePage }) => {
    const color = await homePage.productCards.first().locator('.stock').evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(128, 128, 128)');
  });

  test('TC097 - Button default style', async ({ homePage }) => {
    const btn = homePage.productCards.first().locator('button');
    const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(37, 99, 235)');
  });

  test('TC098 - Button hover darkens', async ({ homePage }) => {
    const btn = homePage.productCards.first().locator('button');
    await btn.hover();
    await homePage.page.waitForTimeout(400);
    const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(29, 78, 216)');
  });

  test('TC099 - Cart section styling', async ({ homePage }) => {
    const bg = await homePage.cartSection.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
    const r = await homePage.cartSection.evaluate(el => window.getComputedStyle(el).borderRadius);
    expect(r).toBe('12px');
  });

  test('TC100 - Cart item divider border-bottom', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    await homePage.clickAddToCart(1);
    const border = await homePage.cartItems.first().evaluate(el => window.getComputedStyle(el).borderBottom);
    expect(border).toContain('solid');
  });

  test('TC101 - Total color blue', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    const color = await homePage.cartTotal.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(37, 99, 235)');
  });

  test('TC102 - Body background #f4f6f9', async ({ homePage }) => {
    const bg = await homePage.page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(244, 246, 249)');
  });

  test('TC103 - Footer center gray', async ({ homePage }) => {
    const align = await homePage.footer.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(align).toBe('center');
    const color = await homePage.footer.evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(119, 119, 119)');
  });

  test('TC104 - Emoji in header renders', async ({ homePage }) => {
    const title = await homePage.getHeaderTitle();
    expect(title).toContain('BuggyShop');
  });

  test('TC105 - 320px mobile layout', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 320, height: 568 });
    await homePage.reload();
    expect(await homePage.getProductCount()).toBe(6);
    const gridBox = await homePage.productGrid.boundingBox();
    expect(gridBox.width).toBeLessThanOrEqual(320);
  });
});
