import { BasePage } from './BasePage.js';

export class SearchComponent extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.locator('#search');
  }

  async searchFor(query) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.page.keyboard.up('Enter');
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getSearchValue() {
    return this.searchInput.inputValue();
  }

  async typeAndTriggerKeyup(query) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    await this.page.dispatchEvent('#search', 'keyup');
  }

  async getPlaceholder() {
    return this.searchInput.getAttribute('placeholder');
  }

  async isSearchInputVisible() {
    return this.searchInput.isVisible();
  }
}