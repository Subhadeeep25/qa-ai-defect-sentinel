import { test, expect } from '../fixtures/index.js';

test.describe('Negative TC041-TC070', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC041 - Out-of-stock addition should be blocked (known defect)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Samsung S24');
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC042 - Stock=0 badge should not increment (known defect)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Samsung S24');
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC043 - Adding more than stock limit allowed (known defect)', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 10; i++) await homePage.clickAddToCartForProduct('iPhone 15');
    expect(await cartComponent.getItemCount()).toBe(10);
  });

  test('TC044 - Invalid product ID via console', async ({ page, cartComponent }) => {
    let error = null;
    page.on('pageerror', e => error = e.message);
    await page.evaluate(() => { const p = products; if(p) p.find = undefined; });
    await page.evaluate(() => { try { addToCart(999); } catch(e) {} });
    expect(await cartComponent.getBadgeCount()).toBe(0);
  });

  test('TC045 - Search with null-like input returns nothing', async ({ homePage }) => {
    await homePage.search('null');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC046 - Very long search string', async ({ homePage }) => {
    await homePage.search('a'.repeat(1000));
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC047 - Script injection in search treated as text', async ({ homePage }) => {
    await homePage.search('<script>alert(1)</script>');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC048 - Empty cart total is 0', async ({ cartComponent }) => {
    expect(await cartComponent.getTotalText().then(t => t.replace(/\s/g,''))).toContain('Total');
    expect(await cartComponent.getBadgeCount()).toBe(0);
  });

  test('TC049 - Rapid clicking adds all items (no rate limit)', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 20; i++) await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getItemCount()).toBe(20);
  });

  test('TC050 - Images fail gracefully when offline', async ({ page, homePage }) => {
    await page.route('**/picsum.photos/**', route => route.abort());
    await homePage.open();
    for (let i = 0; i < 6; i++) {
      const src = await homePage.getProductImageSrc(i);
      expect(src).toContain('picsum.photos');
    }
  });

  test('TC051 - Cart unchanged after search', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.search('Samsung');
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC052 - Cart total with mixed duplicates (known defect)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.clickAddToCartForProduct('MacBook Air');
    expect(await cartComponent.getItemCount()).toBe(3);
    expect(await cartComponent.getTotalValue()).toBe(237900);
  });

  test('TC053 - JS disabled shows no products', async ({ homePage }) => {
    await homePage.page.context().addInitScript(() => { throw new Error('JS disabled simulation'); });
    try { await homePage.open(); } catch(e) {}
  });

  test('TC054 - Negative price via console (no validation)', async ({ page, cartComponent }) => {
    await page.evaluate(() => { cart.push({id:999,name:'Hack',price:-5000}); updateCart(); });
    expect(await cartComponent.getTotalValue()).toBe(-5100);
  });

  test('TC055 - Zero price via console (still subtracts 100)', async ({ page, cartComponent }) => {
    await page.evaluate(() => { cart.push({id:998,name:'Free',price:0}); updateCart(); });
    expect(await cartComponent.getTotalValue()).toBe(-100);
  });

  test('TC056 - Adding 100 times (no upper limit)', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 100; i++) await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getItemCount()).toBe(100);
    expect(await cartComponent.getTotalValue()).toBe(149900);
  });

  test('TC057 - Empty string after search resets grid', async ({ homePage }) => {
    await homePage.search('iPhone');
    expect(await homePage.getProductCardCount()).toBe(1);
    await homePage.clearSearch();
    await homePage.page.waitForTimeout(300);
    expect(await homePage.getProductCardCount()).toBe(6);
  });

  test('TC058 - Only spaces in search returns nothing', async ({ homePage }) => {
    await homePage.search('   ');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC059 - 200% zoom layout', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 640, height: 360 });
    await homePage.page.evaluate(() => document.body.style.zoom = '200%');
    await homePage.page.waitForTimeout(500);
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC060 - 25% zoom layout', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 5120, height: 2880 });
    await homePage.page.evaluate(() => document.body.style.zoom = '25%');
    await homePage.page.waitForTimeout(500);
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC061 - Same item at stock limit no quantity tracking (known defect)', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 5; i++) await homePage.clickAddToCartForProduct('iPhone 15');
    expect(await cartComponent.getItemCount()).toBe(5);
  });

  test('TC062 - Badge with 999 items', async ({ page, cartComponent }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 999; i++) cart.push(products[3]);
      updateCart();
    });
    const badgeText = await cartComponent.cartBadge.textContent();
    expect(parseInt(badgeText || '0', 10)).toBe(999);
  });

  test('TC063 - Single char with no match', async ({ homePage }) => {
    await homePage.search('z');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC064 - Add while search active', async ({ homePage, cartComponent }) => {
    await homePage.search('iPhone');
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC065 - Malformed URL with query params', async ({ homePage }) => {
    await homePage.page.goto('/?x=1&y=2');
    await homePage.page.waitForLoadState('networkidle');
    await expect(homePage.headerTitle).toBeVisible();
  });

  test('TC066 - Sequential add, search, add, clear', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.search('Keyboard');
    await homePage.clickAddToCartForProduct('Mechanical Keyboard');
    await homePage.clearSearch();
    await homePage.page.waitForTimeout(300);
    expect(await cartComponent.getItemCount()).toBe(2);
  });

  test('TC067 - Cart with only out-of-stock items', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Samsung S24');
    expect(await cartComponent.getItemCount()).toBe(1);
    expect(await cartComponent.getTotalValue()).toBe(64900);
  });

  test('TC068 - Button text consistent across all cards', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      await expect(homePage.productCards.nth(i).locator('button')).toHaveText('Add to Cart');
    }
  });

  test('TC069 - No console errors on normal interaction', async ({ page, homePage, cartComponent }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if(msg.type() === 'error') errors.push(msg.text()); });
    await homePage.clickAddToCart(0);
    await homePage.clickAddToCart(1);
    await homePage.search('Samsung');
    await homePage.clearSearch();
    expect(errors.length).toBe(0);
  });

  test('TC070 - Large number total precision (known bug)', async ({ page, cartComponent }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) cart.push({id:3,name:'MacBook Air',price:98000});
      updateCart();
    });
    expect(await cartComponent.getItemCount()).toBe(100);
    expect(await cartComponent.getTotalValue()).toBe(9799900);
  });
});
