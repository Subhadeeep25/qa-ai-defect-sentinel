import { BasePage } from './BasePage.js';

export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.headerTitle = page.locator('header h2');
    this.cartBadge = page.locator('#count');
    this.productGrid = page.locator('#products');
    this.productCards = page.locator('.card');
    this.searchInput = page.locator('#search');
    this.cartSection = page.locator('#cart');
    this.cartItems = page.locator('#items div');
    this.cartTotal = page.locator('#total');
    this.footer = page.locator('footer');
  }

  async open() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async getHeaderTitle() {
    return this.getText(this.headerTitle);
  }

  async getCartBadgeCount() {
    const text = await this.getText(this.cartBadge);
    return parseInt(text, 10) || 0;
  }

  async getProductCount() {
    return this.productCards.count();
  }

  async getProductName(index) {
    return this.getText(this.productCards.nth(index).locator('h3'));
  }

  async getProductPrice(index) {
    return this.getText(this.productCards.nth(index).locator('.price'));
  }

  async getProductStock(index) {
    return this.getText(this.productCards.nth(index).locator('.stock'));
  }

  async clickAddToCart(index) {
    await this.productCards.nth(index).locator('button').click();
  }

  async clickAddToCartForProduct(productName) {
    const card = this.productCards.filter({ hasText: productName });
    await card.locator('button').click();
  }

  async isAddToCartButtonDisabled(index) {
    return this.productCards.nth(index).locator('button').isDisabled();
  }

  async getProductImageSrc(index) {
    return this.productCards.nth(index).locator('img').getAttribute('src');
  }

  async getCartItemCount() {
    return this.cartItems.count();
  }

  async getCartItemNames() {
    const count = await this.getCartItemCount();
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.getText(this.cartItems.nth(i)));
    }
    return names;
  }

  async getCartTotalText() {
    return this.getText(this.cartTotal);
  }

  async getFooterText() {
    return this.getText(this.footer);
  }

  async search(query) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getSearchPlaceholder() {
    return this.searchInput.getAttribute('placeholder');
  }

  async getProductCardCount() {
    return this.productCards.count();
  }

  async getAllProductNames() {
    const count = await this.getProductCardCount();
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.getProductName(i));
    }
    return names;
  }

  async isProductVisible(productName) {
    return this.productCards.filter({ hasText: productName }).first().isVisible();
  }

  isHeaderVisible() {
    return this.isVisible(this.headerTitle);
  }

  isCartSectionVisible() {
    return this.isVisible(this.cartSection);
  }

  isFooterVisible() {
    return this.isVisible(this.footer);
  }

  isSearchInputVisible() {
    return this.isVisible(this.searchInput);
  }

  async getImgAltText(index) {
    return this.productCards.nth(index).locator('img').getAttribute('alt');
  }
}