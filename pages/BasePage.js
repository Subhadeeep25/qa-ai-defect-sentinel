export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }

  async reload() {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  async getText(locator) {
    return (await locator.textContent()) || '';
  }

  async isVisible(locator) {
    return locator.isVisible();
  }
}