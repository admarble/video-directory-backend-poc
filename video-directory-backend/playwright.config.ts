import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Utility projects - run without web server
    {
      name: 'utils',
      testMatch: /.*-utils\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'duration',
      testMatch: /.*-duration\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Server-dependent projects
    ...(process.env.WITH_SERVER ? [
      {
        name: 'api',
        testMatch: /.*-api\.spec\.ts/,
        use: { 
          ...devices['Desktop Chrome'],
          baseURL: 'http://localhost:3000',
        },
      },
      {
        name: 'ui',
        testMatch: /.*-fetching\.spec\.ts/,
        use: { 
          ...devices['Desktop Chrome'],
          baseURL: 'http://localhost:3000',
        },
      }
    ] : []),
  ],
  // Web server configuration only applies when WITH_SERVER env var is set
  ...(process.env.WITH_SERVER ? {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    }
  } : {}),
}); 