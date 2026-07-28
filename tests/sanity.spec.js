import { test, expect } from '../fixtures/index.js';

test.describe('Sanity TC161-TC165', () => {
  test('TC161 - @sanity Exactly 6 product cards', async ({ homePage }) => {
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC162 - @sanity Stock=0 has Add to Cart button (known defect)', async ({ homePage }) => {
    await homePage.open();
    const btn = homePage.productCards.filter({ hasText: 'Samsung S24' }).locator('button');
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText('Add to Cart');
  });

  test('TC163 - @sanity Cart starts empty', async ({ homePage, cartComponent }) => {
    await homePage.open();
    expect(await cartComponent.isCartEmpty()).toBe(true);
    expect(await cartComponent.getBadgeCount()).toBe(0);
  });

  test('TC164 - @sanity Search by out-of-stock product name', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('Samsung');
    const names = await homePage.getAllProductNames();
    expect(names.length).toBe(1);
    expect(names[0]).toContain('Samsung');
  });

  test('TC165 - @sanity Header displays emoji + BuggyShop', async ({ homePage }) => {
    await homePage.open();
    const title = await homePage.getHeaderTitle();
    expect(title).toContain('BuggyShop');
  });
});
