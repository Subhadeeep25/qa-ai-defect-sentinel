import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class EvidenceCollector {
  constructor(page, testInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.consoleLogs = [];
    this.networkRequests = [];
    this.startTime = 0;
  }

  async initialize() {
    this.startTime = Date.now();
    this.consoleLogs = [];
    this.networkRequests = [];

    if (this.page) {
      this.page.on('console', (msg) => {
        this.consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      });

      this.page.on('requestfailed', (request) => {
        this.networkRequests.push({
          url: request.url(),
          method: request.method(),
          status: 0,
          failure: request.failure()?.errorText || 'Failed',
        });
      });

      this.page.on('response', (response) => {
        this.networkRequests.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
        });
      });
    }
  }

  async captureEvidence(error = null) {
    const timestamp = new Date().toISOString();
    const executionId = `EXEC-${Date.now()}`;
    const sanitizedTitle = (this.testInfo.title || 'test').replace(/[^a-zA-Z0-9]/g, '_');
    
    // Extract requirement ID / TC number
    const tcMatch = (this.testInfo.title || '').match(/TC(\d+)|REQ-(\d+)/i);
    const requirementId = tcMatch ? (tcMatch[0].toUpperCase()) : 'N/A';

    // Paths
    const screenshotsDir = path.resolve(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotsDir, `${sanitizedTitle}_${Date.now()}.png`);

    let screenshotSaved = null;
    let domSnapshot = '';
    let pageSource = '';
    let currentUrl = 'unknown';

    if (this.page && !this.page.isClosed()) {
      try {
        currentUrl = this.page.url();
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        screenshotSaved = screenshotPath;
      } catch (err) {
        screenshotSaved = null;
      }

      try {
        domSnapshot = await this.page.content();
        pageSource = domSnapshot;
      } catch (err) {
        domSnapshot = '';
        pageSource = '';
      }
    }

    // Attachments (Video & Trace)
    const attachments = this.testInfo.attachments || [];
    const videoAttachment = attachments.find(a => a.name === 'video');
    const traceAttachment = attachments.find(a => a.name === 'trace');

    const videoPath = videoAttachment ? videoAttachment.path : (this.testInfo.videoPath ? this.testInfo.videoPath : 'N/A');
    const tracePath = traceAttachment ? traceAttachment.path : 'N/A';

    const stripAnsi = (str) => typeof str === 'string' ? str.replace(/\u001b\[[0-9;]*m/g, '').replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') : str;

    // Parse assertion details from error
    const errObj = error || this.testInfo.error || {};
    const stackTrace = stripAnsi(errObj.stack || new Error().stack || '');
    const errMessage = stripAnsi(errObj.message || 'Assertion / Runtime error');

    // Parse Expected & Actual from Playwright error message if possible
    let expectedResult = 'Specified test criteria to pass';
    let actualResult = errMessage;
    const expectedMatch = errMessage.match(/Expected:\s*([^\n]+)/i);
    const receivedMatch = errMessage.match(/Received:\s*([^\n]+)/i);

    if (expectedMatch) expectedResult = expectedMatch[1].trim();
    if (receivedMatch) actualResult = `Received: ${receivedMatch[1].trim()}`;

    // Failed Locator extraction
    let failedLocator = 'N/A';
    const locatorMatch = errMessage.match(/locator\('([^']+)'\)/i) || errMessage.match(/selector "([^"]+)"/i);
    if (locatorMatch) {
      failedLocator = locatorMatch[1];
    }

    const browserName = this.testInfo.project?.name || 'chromium';
    const viewportSize = this.testInfo.project?.use?.viewport
      ? `${this.testInfo.project.use.viewport.width}x${this.testInfo.project.use.viewport.height}`
      : '1280x720';

    return {
      executionId,
      timestamp,
      testName: this.testInfo.title || 'Unnamed Test',
      requirementId,
      browser: browserName,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      url: currentUrl,
      viewport: viewportSize,
      executionDuration: `${Date.now() - this.startTime}ms`,
      expectedResult,
      actualResult,
      screenshot: screenshotSaved || 'N/A',
      video: videoPath || 'N/A',
      trace: tracePath || 'N/A',
      domSnapshot: domSnapshot ? domSnapshot.substring(0, 10000) : 'N/A',
      htmlSnapshot: domSnapshot ? domSnapshot.substring(0, 10000) : 'N/A',
      consoleLogs: this.consoleLogs,
      networkRequests: this.networkRequests,
      failedLocator,
      stackTrace,
      pageSource: pageSource ? pageSource.substring(0, 5000) : 'N/A',
      environment: process.env.NODE_ENV || 'development',
      applicationVersion: process.env.APP_VERSION || '1.0.0',
      buildNumber: process.env.BUILD_NUMBER || 'BUILD-2026.1',
    };
  }
}
