# YouTube Feature Tests

This directory contains automated tests for the YouTube video URL fetching functionality using Playwright.

## Test Files

- **youtube-api.spec.ts**: Tests the YouTube API endpoint directly.
- **youtube-fetching.spec.ts**: Tests the YouTube video fetching UI functionality in the admin panel.
- **youtube-utils.spec.ts**: Tests the YouTube URL parsing utility function.
- **youtube-duration.spec.ts**: Tests the ISO 8601 duration parsing function.

## Running the Tests

### Prerequisites

1. Make sure Playwright is installed:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Add your YouTube API key to the `.env` file

### Commands

Run all tests:
```bash
npm test
```

Run utility tests only (no server required):
```bash
npm run test:utils
```

Run server-dependent tests (requires Payload to be running):
```bash
npm run test:server
```

Run tests with UI:
```bash
npm run test:ui
```

Run a specific test file:
```bash
npx playwright test tests/youtube-utils.spec.ts
```

View the latest test report:
```bash
npm run test:report
```

### Test Reports

After running the tests, Playwright generates HTML reports that can be viewed by opening:
```bash
npx playwright show-report
```

## Notes

- The UI tests mock the YouTube API responses to avoid making real API calls during testing.
- The API endpoint tests will either use your actual YouTube API key (if configured) or validate the error response if the key is not set up.
- The utility tests run independently of any API or server, testing the functions directly. 