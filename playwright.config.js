import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.BASE_URL || 'http://localhost:5500';
const retries = parseInt(process.env.RETRIES || '2', 10);
const workers = parseInt(process.env.WORKERS || '4', 10);
const timeout = parseInt(process.env.TIMEOUT || '30000', 10);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries,
  workers: 1,
  timeout,
  expect: { timeout: 10000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1280', 10),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '720', 10),
    },
    actionTimeout: 10000,
    navigationTimeout: timeout,
  },
  webServer: {
    command: 'npx http-server ./application -p 5500 -c-1 --cors',
    port: 5500,
    cwd: '.',
    reuseExistingServer: false,
    timeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [
    ['list'],
    ['html', { outputFolder: './reports/html-report', open: 'never' }],
    ['json', { outputFile: './reports/test-results.json' }],
    ['junit', { outputFile: './reports/junit-report.xml' }],
  ],
});