// @ts-check
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isRemoteApi = Boolean(process.env.BASE_URL);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: isRemoteApi
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000/health',
        reuseExistingServer: !process.env.CI,
        env: {
          DYNAMODB_ENDPOINT:
            process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
          AWS_REGION: process.env.AWS_REGION || 'us-east-1',
          AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'local',
          AWS_SECRET_ACCESS_KEY:
            process.env.AWS_SECRET_ACCESS_KEY || 'local',
        },
      },
});

