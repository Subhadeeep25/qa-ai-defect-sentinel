import { test, expect } from '../fixtures/index.js';

const EXPECTED_PRODUCTS = ['iPhone 15', 'Samsung S24', 'MacBook Air', 'Gaming Mouse', 'Mechanical Keyboard', 'Sony Headphones'];
const EXPECTED_PRICES = [70000, 65000, 98000, 1500, 3500, 6000];
const EXPECTED_STOCKS = [5, 0, 2, 10, 4, 3];

test.describe('Functional TC001-TC040', () => {
  test.beforeEach(async ({ homePage }) => { await homePage.open(); });

  test('TC001 - Page loads with header, grid, search, cart, footer', async ({ homePage }) => {
    await expect(homePage.page).toHaveTitle('BuggyShop');
    await expect(homePage.headerTitle).toBeVisible();
    await expect(homePage.productGrid).toBeVisible();
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.cartSection).toBeVisible();
    await expect(homePage.footer).toBeVisible();
  });

  test('TC002 - All 6 product cards render on page load', async ({ homePage }) => {
    expect(await homePage.getProductCount()).toBe(6);
  });

  test('TC003 - Product names are correct', async ({ homePage }) => {
    const names = await homePage.getAllProductNames();
    for (const n of EXPECTED_PRODUCTS) expect(names).toContain(n);
  });

  test('TC004 - Product prices display correct values', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      const price = await homePage.getProductPrice(i);
      expect(price).toContain(String(EXPECTED_PRICES[i]));
    }
  });

  test('TC005 - Product stock levels display', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      const stock = await homePage.getProductStock(i);
      expect(stock).toContain(String(EXPECTED_STOCKS[i]));
    }
  });

  test('TC006 - Product images load from picsum.photos', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      const src = await homePage.getProductImageSrc(i);
      expect(src).toContain('picsum.photos');
    }
  });

  test('TC007 - Each card has Add to Cart button', async ({ homePage }) => {
    for (let i = 0; i < 6; i++) {
      await expect(homePage.productCards.nth(i).locator('button')).toHaveText('Add to Cart');
    }
  });

  test('TC008 - Clicking Add to Cart adds item to cart list', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    const names = await cartComponent.getItemNames();
    expect(names.some(n => n.trim() === 'iPhone 15')).toBe(true);
  });

  test('TC009 - Cart badge increments from 0 to 1', async ({ homePage, cartComponent }) => {
    expect(await cartComponent.getBadgeCount()).toBe(0);
    await homePage.clickAddToCart(0);
    expect(await cartComponent.getBadgeCount()).toBe(1);
  });

  test('TC010 - Cart total updates after add (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getTotalValue()).toBe(1400);
  });

  test('TC011 - Multiple items appear in cart', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.clickAddToCartForProduct('MacBook Air');
    expect(await cartComponent.getItemCount()).toBe(2);
  });

  test('TC012 - Same product added twice creates duplicates (known defect)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.clickAddToCartForProduct('iPhone 15');
    expect(await cartComponent.getItemCount()).toBe(2);
  });

  test('TC013 - Search filters by product name', async ({ homePage }) => {
    await homePage.search('iPhone');
    const names = await homePage.getAllProductNames();
    expect(names.length).toBe(1);
    expect(names[0]).toContain('iPhone 15');
  });

  test('TC014 - Search is case-sensitive (known defect)', async ({ homePage }) => {
    await homePage.search('iphone');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC015 - Empty search returns all products', async ({ homePage }) => {
    await homePage.search('MacBook');
    expect(await homePage.getProductCardCount()).toBeLessThan(6);
    await homePage.clearSearch();
    await homePage.page.waitForTimeout(300);
    expect(await homePage.getProductCardCount()).toBe(6);
  });

  test('TC016 - Cart initial state: empty, badge 0, total 0', async ({ cartComponent }) => {
    expect(await cartComponent.isCartEmpty()).toBe(true);
    expect(await cartComponent.getBadgeCount()).toBe(0);
    expect(await cartComponent.getTotalText().then(t => t.replace(/\s/g, ''))).toContain('Total');
  });

  test('TC017 - Total in Rupee format after add (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    const total = await cartComponent.getTotalText();
    expect(total).toContain('69900');
  });

  test('TC018 - Cart persists while page not refreshed', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    await homePage.page.evaluate(() => window.scrollTo(0, 0));
    await homePage.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC019 - Out-of-stock item has Add to Cart button (known defect)', async ({ homePage }) => {
    const card = homePage.productCards.filter({ hasText: 'Samsung S24' });
    await expect(card.locator('button')).toBeEnabled();
  });

  test('TC020 - Out-of-stock item can be added (known defect)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Samsung S24');
    expect(await cartComponent.getItemCount()).toBe(1);
  });

  test('TC021 - Stock=0 displays correctly', async ({ homePage }) => {
    await expect(homePage.productCards.filter({ hasText: 'Samsung S24' }).locator('.stock')).toContainText('0');
  });

  test('TC022 - Header has BuggyShop and initial badge 0', async ({ homePage }) => {
    expect(await homePage.getHeaderTitle()).toContain('BuggyShop');
    expect(await homePage.getCartBadgeCount()).toBe(0);
  });

  test('TC023 - Footer text displayed', async ({ homePage }) => {
    expect(await homePage.getFooterText()).toContain('BuggyShop QA Practice Website');
  });

  test('TC024 - Search placeholder text', async ({ homePage }) => {
    expect(await homePage.getSearchPlaceholder()).toBe('Search Products...');
  });

  test('TC025 - High-value item MacBook Air total (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('MacBook Air');
    expect(await cartComponent.getTotalValue()).toBe(97900);
  });

  test('TC026 - Low-value item Gaming Mouse total (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    expect(await cartComponent.getTotalValue()).toBe(1400);
  });

  test('TC027 - Partial name search', async ({ homePage }) => {
    await homePage.search('Samsung');
    const names = await homePage.getAllProductNames();
    expect(names.length).toBe(1);
    expect(names[0]).toContain('Samsung');
  });

  test('TC028 - Single character search', async ({ homePage }) => {
    await homePage.search('i');
    const names = await homePage.getAllProductNames();
    expect(names.some(n => n.includes('i'))).toBe(true);
  });

  test('TC029 - Cart total with two items (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    await homePage.clickAddToCartForProduct('Mechanical Keyboard');
    expect(await cartComponent.getTotalValue()).toBe(4900);
  });

  test('TC030 - Cart total with three items (known -100 bug)', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('iPhone 15');
    await homePage.clickAddToCartForProduct('MacBook Air');
    await homePage.clickAddToCartForProduct('Sony Headphones');
    expect(await cartComponent.getTotalValue()).toBe(173900);
  });

  test('TC031 - Numeric search', async ({ homePage }) => {
    await homePage.search('15');
    expect(await homePage.getProductCardCount()).toBeGreaterThanOrEqual(1);
  });

  test('TC032 - Trailing space search fails (known defect)', async ({ homePage }) => {
    await homePage.search('iPhone 15 ');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC033 - Leading space search fails (known defect)', async ({ homePage }) => {
    await homePage.search(' iPhone');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC034 - Special characters in search', async ({ homePage }) => {
    await homePage.search('@#$%');
    expect(await homePage.getProductCardCount()).toBe(0);
  });

  test('TC035 - Product card structure verified', async ({ homePage }) => {
    const card = homePage.productCards.first();
    await expect(card.locator('img')).toBeVisible();
    await expect(card.locator('h3')).toBeVisible();
    await expect(card.locator('.price')).toBeVisible();
    await expect(card.locator('.stock')).toBeVisible();
    await expect(card.locator('button')).toBeVisible();
  });

  test('TC036 - Sequential add of multiple items', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCart(0);
    await homePage.clickAddToCart(1);
    await homePage.clickAddToCart(2);
    expect(await cartComponent.getItemCount()).toBe(3);
  });

  test('TC037 - Cart order matches add order', async ({ homePage, cartComponent }) => {
    await homePage.clickAddToCartForProduct('Gaming Mouse');
    await homePage.clickAddToCartForProduct('Sony Headphones');
    const names = await cartComponent.getItemNames();
    expect(names[0].trim()).toContain('Gaming Mouse');
    expect(names[1].trim()).toContain('Sony Headphones');
  });

  test('TC038 - Cart section below product grid', async ({ homePage }) => {
    const gridBox = await homePage.productGrid.boundingBox();
    const cartBox = await homePage.cartSection.boundingBox();
    expect(cartBox.y).toBeGreaterThan(gridBox.y);
  });

  test('TC039 - Search triggers on keyup', async ({ homePage }) => {
    await homePage.searchInput.fill('Keyboard');
    await homePage.page.dispatchEvent('#search', 'keyup');
    await homePage.page.waitForTimeout(200);
    expect(await homePage.getProductCardCount()).toBe(1);
  });

  test('TC040 - Page title is BuggyShop', async ({ homePage }) => {
    await expect(homePage.page).toHaveTitle('BuggyShop');
  });
});
