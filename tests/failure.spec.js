import { test, expect } from '../fixtures/index.js';

test.describe('Failure TC166-TC190', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC166 - Add item shows correct total (no -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getTotalValue()).toBe(1500);
  });

  test('TC167 - Add out-of-stock item is blocked', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Samsung S24');
    expect(await cartComponent.getBadgeCount()).toBe(0);
    expect(await cartComponent.getItemCount()).toBe(0);
  });

  test('TC168 - Search is case-insensitive', async ({ homePage }) => {
    await homePage.search('iphone');
    expect(await homePage.getProductCardCount()).toBeGreaterThanOrEqual(1);
  });

  test('TC169 - Duplicate items merged with quantity', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC170 - XSS via cart item name is sanitized', async ({ page, cartComponent }) => {
    const dialogPromise = page.waitForEvent('dialog', { timeout: 3000 }).catch(() => null);
    await page.evaluate(() => {
      cart.push({ name: '<img src=x onerror=alert(1)>', price: 100 });
      updateCart();
    });
    await page.waitForTimeout(500);
    const dialog = await dialogPromise;
    if (dialog) await dialog.dismiss();
    expect(dialog).toBeNull();
  });

  test('TC171 - Negative price rejected', async ({ page, cartComponent }) => {
    await page.evaluate(() => {
      cart.push({ id: 999, name: 'Hack', price: -5000 });
      updateCart();
    });
    expect(await cartComponent.getTotalValue()).toBeGreaterThanOrEqual(0);
  });

  test('TC172 - Cannot add beyond available stock', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 6; i++) await homePage.clickAddToCartForProduct('iPhone 15');
    expect(await cartComponent.getItemCount()).toBeLessThanOrEqual(5);
  });

  test('TC173 - Stock decrements after adding to cart', async ({ homePage }) => {
    const stockBefore = await homePage.getProductStock(3);
    await homePage.clickAddToCart(3);
    const stockAfter = await homePage.getProductStock(3);
    expect(parseInt(stockAfter.match(/\d+/)?.[0] || '0', 10))
      .toBeLessThan(parseInt(stockBefore.match(/\d+/)?.[0] || '0', 10));
  });

  test('TC174 - Trailing space in search still matches', async ({ homePage }) => {
    await homePage.search('iPhone 15 ');
    expect(await homePage.getProductCardCount()).toBeGreaterThanOrEqual(1);
  });

  test('TC175 - Leading space in search still matches', async ({ homePage }) => {
    await homePage.search(' iPhone');
    expect(await homePage.getProductCardCount()).toBeGreaterThanOrEqual(1);
  });

  test('TC176 - Product images have alt attributes', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      const alt = await homePage.getImgAltText(i);
      expect(alt).toBeTruthy();
    }
  });

  test('TC177 - Search input has associated label', async ({ homePage }) => {
    const labelId = await homePage.searchInput.getAttribute('aria-labelledby');
    const label = await homePage.searchInput.getAttribute('aria-label');
    const hasLabel = await homePage.page.locator('label[for="search"]').count();
    expect(labelId || label || hasLabel).toBeTruthy();
  });

  test('TC178 - Page has correct heading hierarchy starting with h1', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('TC179 - Cart badge has aria-live region', async ({ homePage }) => {
    const ariaLive = await homePage.cartBadge.getAttribute('aria-live');
    expect(ariaLive).toBeTruthy();
  });

  test('TC180 - Page has semantic main and section landmarks', async ({ page }) => {
    const mainCount = await page.locator('main').count();
    const sectionCount = await page.locator('section').count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
    expect(sectionCount).toBeGreaterThanOrEqual(1);
  });

  test('TC181 - Button font-size >= 16px to prevent iOS zoom', async ({ homePage }) => {
    const fontSize = await homePage.productCards.first()
      .locator('button').evaluate(el => window.getComputedStyle(el).fontSize);
    expect(parseInt(fontSize, 10)).toBeGreaterThanOrEqual(16);
  });

  test('TC182 - Adding iPhone 15 shows correct total 70000', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    expect(await cartComponent.getTotalValue()).toBe(70000);
  });

  test('TC183 - Cart items sanitized, no DOM clobbering', async ({ page }) => {
    await page.evaluate(() => {
      cart.push({ name: '<div id=total>Hacked</div>', price: 100 });
      updateCart();
    });
    const totalElements = await page.locator('#total').count();
    expect(totalElements).toBe(1);
  });

  test('TC184 - Rapid Add to Cart clicks are rate-limited', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 20; i++) await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getItemCount()).toBeLessThanOrEqual(10);
  });

  test('TC185 - Adding item priced at 100 shows correct total', async ({ page, cartComponent }) => {
    await page.evaluate(() => {
      cart.push({ id: 100, name: 'Test Item', price: 100 });
      updateCart();
    });
    expect(await cartComponent.getTotalValue()).toBe(100);
  });

  test('TC186 - Adding Sony Headphones shows correct total 6000', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Sony Headphones');
    expect(await cartComponent.getTotalValue()).toBe(6000);
  });

  test('TC187 - Empty cart after clear shows total 0', async ({ page, cartComponent }) => {
    await page.evaluate(() => {
      cart.push({ id: 3, name: 'MacBook Air', price: 98000 });
      updateCart();
    });
    await page.evaluate(() => {
      cart.length = 0;
      updateCart();
    });
    const totalText = await cartComponent.getTotalText();
    expect(totalText).toContain('₹0');
  });

  test('TC188 - Add to Cart button has accessible aria-label', async ({ homePage }) => {
    const ariaLabel = await homePage.productCards.first()
      .locator('button').getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('TC189 - Adding Mechanical Keyboard shows correct total 3500', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Mechanical Keyboard');
    expect(await cartComponent.getTotalValue()).toBe(3500);
  });

  test('TC190 - Out-of-stock Add to Cart button is disabled', async ({ homePage }) => {
    const isDisabled = await homePage.isAddToCartButtonDisabled(1);
    expect(isDisabled).toBe(true);
  });
});
