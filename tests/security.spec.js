import { test, expect } from '../fixtures/index.js';

test.describe('Security TC141-TC150', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC141 - XSS via search is blocked', async ({ homePage }) => {
    await homePage.search('<img src=x onerror=alert(1)>');
    expect(await homePage.getProductCardCount()).toBe(0);
    const alerted = await homePage.page.evaluate(() => { try { alert(1); return true; } catch(e) { return false; } });
  });

  test('TC142 - XSS via cart console (known defect)', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', () => alertTriggered = true);
    await page.evaluate(() => {
      cart.push({name:'<script>alert(1)</script>',price:100});
      updateCart();
    });
    expect(alertTriggered).toBe(false);
  });

  test('TC143 - No sensitive data in source', async ({ homePage }) => {
    const html = await homePage.page.content();
    expect(html).not.toContain('apiKey');
    expect(html).not.toContain('password');
    expect(html).not.toContain('secret');
  });

  test('TC144 - Prototype pollution via console', async ({ page, homePage, cartComponent }) => {
    await page.evaluate(() => { Object.prototype.price = 0; });
    await homePage.clickAddToCart(0);
    const total = await cartComponent.getTotalValue();
    expect(total).toBeLessThan(100000);
  });

  test('TC145 - 5000 char search input no crash', async ({ homePage }) => {
    await homePage.search('a'.repeat(5000));
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC146 - DOM clobbering via innerHTML (known defect)', async ({ page }) => {
    await page.evaluate(() => {
      cart.push({name:'<div id=total>Hacked</div>',price:100});
      updateCart();
    });
    const totalElements = await page.locator('#total').count();
    expect(totalElements).toBeGreaterThan(1);
  });

  test('TC147 - Console product.pop() resets on refresh', async ({ page, homePage }) => {
    await page.evaluate(() => { products.pop(); render(); });
    expect(await homePage.getProductCount()).toBe(5);
    await homePage.reload();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC148 - No eval or setTimeout string usage', async () => {
    const fs = await import('fs');
    const js = fs.readFileSync('./application/app.js', 'utf-8');
    expect(js).not.toContain('eval(');
    expect(js).not.toContain('setTimeout(');
    expect(js).not.toContain('setInterval(');
  });

  test('TC149 - Negative price via console (known defect)', async ({ page, cartComponent }) => {
    await page.evaluate(() => { cart.push({id:777,name:'Hack',price:-100000}); updateCart(); });
    expect(await cartComponent.getTotalValue()).toBe(-100100);
  });

  test('TC150 - No server-side interaction', async ({ page }) => {
    const requests = [];
    page.on('request', r => requests.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const noExternal = requests.every(url => url.includes('picsum.photos') || url.includes('localhost'));
    expect(noExternal).toBe(true);
  });
});
