import { test, expect } from '../fixtures/index.js';

test.describe('Regression TC151-TC155', () => {
  test('TC151 - Product grid renders 6 items', async ({ homePage }) => {
    await homePage.open();
    expect(await homePage.getProductCount()).toBe(6);
    const names = await homePage.getAllProductNames();
    expect(names).toContain('iPhone 15');
    expect(names).toContain('Samsung S24');
    expect(names).toContain('MacBook Air');
    expect(names).toContain('Gaming Mouse');
    expect(names).toContain('Mechanical Keyboard');
    expect(names).toContain('Sony Headphones');
  });

  test('TC152 - Add to Cart adds item and updates badge', async ({ homePage, cartComponent }) => {
    await homePage.open();
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getItemCount()).toBe(1);
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC153 - Search filters on keyup', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('Samsung');
    expect(await homePage.getProductCardCount()).toBe(1);
  });

  test('TC154 - Cart total calculation', async ({ homePage, cartComponent }) => {
    await homePage.open();
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    await homePage.clickAddToCartForProduct('Mechanical Keyboard');
    const total = await cartComponent.getTotalValue();
    expect(total).toBe(4900);
  });

  test('TC155 - Page layout structure', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.headerTitle).toBeVisible();
    await expect(homePage.productGrid).toBeVisible();
    await expect(homePage.cartSection).toBeVisible();
    await expect(homePage.footer).toBeVisible();
    const gridBox = await homePage.productGrid.boundingBox();
    const cartBox = await homePage.cartSection.boundingBox();
    expect(cartBox.y).toBeGreaterThan(gridBox.y);
  });
});
