import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { CartComponent } from '../pages/CartComponent.js';
import { SearchComponent } from '../pages/SearchComponent.js';
import { EvidenceCollector } from '../utils/evidenceCollector.js';
import { FailureHandler } from '../utils/failureHandler.js';

export const test = base.extend({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  cartComponent: async ({ page }, use) => {
    const cartComponent = new CartComponent(page);
    await use(cartComponent);
  },

  searchComponent: async ({ page }, use) => {
    const searchComponent = new SearchComponent(page);
    await use(searchComponent);
  },

  /* 
   * Auto-failure handling fixture.
   * - Initializes evidence collection BEFORE the test (console logs, network).
   * - AFTER the test, checks testInfo.status.
   * - If failed: captures evidence, analyzes failure, generates defect/investigation report.
   * - This runs for EVERY test automatically — no test code changes needed.
   */
  _autoFailureHandler: [async ({ page }, use, testInfo) => {
    const collector = new EvidenceCollector(page, testInfo);
    await collector.initialize();

    // Run the test
    await use(collector);

    // Teardown: runs AFTER the test completes
    // Only run failure handling if the test failed AND all retries are completed (final attempt)
    const maxRetries = typeof testInfo.project?.retries === 'number' ? testInfo.project.retries : (parseInt(process.env.RETRIES || '2', 10));
    const isFinalAttempt = testInfo.retry >= maxRetries;
    console.log(`[Fixture Teardown] status=${testInfo.status}, retry=${testInfo.retry}, maxRetries=${maxRetries}, isFinalAttempt=${isFinalAttempt}`);
    
    if (testInfo.status !== 'passed' && testInfo.status !== 'skipped' && isFinalAttempt) {
      try {
        const error = testInfo.error || new Error(testInfo.status);
        const handler = new FailureHandler(page, testInfo, collector);
        await handler.handleFailure(error);
      } catch (handlerError) {
        console.error(`[FailureHandler] Error during failure handling: ${handlerError.message}`);
      }
    }
  }, { auto: true }],

  evidenceCollector: async ({ page }, use, testInfo) => {
    const collector = new EvidenceCollector(page, testInfo);
    await collector.initialize();
    await use(collector);
  },
});

export { expect } from '@playwright/test';