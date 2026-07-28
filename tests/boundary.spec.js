import { test, expect } from '../fixtures/index.js';

test.describe('Boundary TC071-TC085', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC071 - Minimum price item (Gaming Mouse) total', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getTotalValue()).toBe(1400);
  });

  test('TC072 - Maximum price item (MacBook Air) total', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('MacBook Air');
    expect(await cartComponent.getTotalValue()).toBe(97900);
  });

  test('TC073 - Cart with exactly 1 item', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC074 - Cart with 0 items', async ({ cartComponent }) => {
    expect(await cartComponent.isCartEmpty()).toBe(true);
    expect(await cartComponent.getBadgeCount()).toBe(0);
  });

  test('TC075 - Exact product name search', async ({ homePage }) => {
    await homePage.search('iPhone 15');
    expect(await homePage.getProductCardCount()).toBe(1);
  });

  test('TC076 - Single char match G', async ({ homePage }) => {
    await homePage.search('G');
    const names = await homePage.getAllProductNames();
    expect(names.some(n => n.includes('Gaming'))).toBe(true);
  });

  test('TC077 - Stock never decreases after add (known defect)', async ({ homePage }) => {
    const stockBefore = await homePage.getProductStock(2);
    await homePage.clickAddToCart(2);
    const stockAfter = await homePage.getProductStock(2);
    expect(stockAfter).toBe(stockBefore);
  });

  test('TC078 - Stock=0 boundary', async ({ homePage }) => {
    const stock = await homePage.getProductStock(1);
    expect(stock).toContain('0');
  });

  test('TC079 - Stock=10 boundary', async ({ homePage }) => {
    const stock = await homePage.getProductStock(3);
    expect(stock).toContain('10');
  });

  test('TC080 - Cart badge 0 items', async ({ cartComponent }) => {
    expect(await cartComponent.getBadgeCount()).toBe(0);
  });

  test('TC081 - Cart badge 1 item', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC082 - Cart badge with many items', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 100; i++) await homePage.clickAddToCartForProduct('Gaming Mouse').catch(() => {});
    const text = await cartComponent.cartBadge.textContent();
    expect(parseInt(text || '0', 10)).toBe(100);
  });

  test('TC083 - Minimum id (id=1) iPhone 15', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC084 - Maximum id (id=6) Sony Headphones', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(5);
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC085 - Total all 6 products (known -100 bug)', async ({ homePage, cartComponent }) => {
    for (let i = 0; i < 6; i++) await homePage.clickAddToCart(i);
    expect(await cartComponent.getTotalValue()).toBe(243900);
  });
});
