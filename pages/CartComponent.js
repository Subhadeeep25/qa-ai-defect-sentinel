import { BasePage } from './BasePage.js';

export class CartComponent extends BasePage {
  constructor(page) {
    super(page);
    this.cartSection = page.locator('#cart');
    this.cartItemsContainer = page.locator('#items');
    this.cartItemDivs = page.locator('#items div');
    this.cartTotal = page.locator('#total');
    this.cartBadge = page.locator('#count');
  }

  async isCartVisible() {
    return this.cartSection.isVisible();
  }

  async getCartTitle() {
    return this.getText(this.cartSection.locator('h2').first());
  }

  async getItemCount() {
    return this.cartItemDivs.count();
  }

  async getItemNames() {
    const count = await this.getItemCount();
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(await this.getText(this.cartItemDivs.nth(i)));
    }
    return names;
  }

  async getTotalText() {
    return this.getText(this.cartTotal);
  }

  async getBadgeCount() {
    const text = await this.getText(this.cartBadge);
    return parseInt(text, 10) || 0;
  }

  async isCartEmpty() {
    const count = await this.getItemCount();
    return count === 0;
  }

  async getTotalValue() {
    const text = await this.getTotalText();
    const match = text.match(/₹(-?\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getSectionHeading() {
    return this.getText(this.cartSection.locator('h2').first());
  }
}