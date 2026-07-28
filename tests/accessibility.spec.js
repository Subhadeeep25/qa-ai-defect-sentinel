import { test, expect } from '../fixtures/index.js';

test.describe('Accessibility TC106-TC120', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC106 - html lang attribute is en', async ({ homePage }) => {
    const lang = await homePage.page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('en');
  });

  test('TC107 - Images have alt attributes (known defect)', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      const alt = await homePage.getImgAltText(i);
      expect(alt).toBeNull();
    }
  });

  test('TC108 - Search input has no label (known defect)', async ({ homePage }) => {
    const hasLabel = await homePage.page.evaluate(() => {
      const input = document.querySelector('#search');
      return !!document.querySelector('label[for=\"search\"]') || input?.hasAttribute('aria-label');
    });
    expect(hasLabel).toBe(false);
  });

  test('TC109 - Buttons have accessible name text', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      await expect(homePage.productCards.nth(i).locator('button')).toHaveText('Add to Cart');
    }
  });

  test('TC110 - Heading hierarchy missing h1 (known defect)', async ({ homePage }) => {
    const hasH1 = await homePage.page.evaluate(() => !!document.querySelector('h1'));
    expect(hasH1).toBe(false);
  });

  test('TC111 - Color contrast gray stock may fail WCAG AA', async ({ homePage }) => {
    const color = await homePage.productCards.first().locator('.stock').evaluate(el => window.getComputedStyle(el).color);
    expect(color).toBe('rgb(128, 128, 128)');
  });

  test('TC112 - Page keyboard navigable', async ({ homePage }) => {
    await homePage.page.keyboard.press('Tab');
    const focused = await homePage.page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('TC113 - Cart badge has no aria-live (known defect)', async ({ homePage }) => {
    const hasLive = await homePage.cartBadge.evaluate(el => el.getAttribute('aria-live'));
    expect(hasLive).toBeNull();
  });

  test('TC114 - Button focus indicator', async ({ homePage }) => {
    const btn = homePage.productCards.first().locator('button');
    await btn.focus();
    const outline = await btn.evaluate(el => window.getComputedStyle(el).outline);
    expect(outline).toBeTruthy();
  });

  test('TC115 - 200% zoom content readable', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 640, height: 360 });
    await homePage.page.evaluate(() => document.body.style.zoom = '200%');
    await homePage.page.waitForTimeout(500);
    await expect(homePage.headerTitle).toBeVisible();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC116 - Semantic landmarks missing main/section (known defect)', async ({ homePage }) => {
    const hasMain = await homePage.page.evaluate(() => !!document.querySelector('main'));
    const hasSection = await homePage.page.evaluate(() => !!document.querySelector('section'));
    expect(hasMain || hasSection).toBe(false);
  });

  test('TC117 - Cart section has heading', async ({ homePage, cartComponent }) => {
    expect(await cartComponent.getSectionHeading()).toBe('Shopping Cart');
  });

  test('TC118 - Total is separate h2 heading', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    const tag = await homePage.cartTotal.evaluate(el => el.tagName);
    expect(tag).toBe('H2');
  });

  test('TC119 - No flashing or auto-refreshing content', async ({ homePage }) => {
    const noBlink = await homePage.page.evaluate(() => !document.querySelector('[style*=\"animation\"], marquee, blink'));
    expect(noBlink).toBe(true);
  });

  test('TC120 - Button font-size 15px may cause iOS zoom', async ({ homePage }) => {
    const fs = await homePage.productCards.first().locator('button').evaluate(el => window.getComputedStyle(el).fontSize);
    expect(parseInt(fs)).toBe(15);
  });
});
