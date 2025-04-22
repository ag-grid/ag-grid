import { defineConfig, devices } from '@playwright/test';

const fw = process.env.FW_TYPE ?? 'unknown';
const dev_port = process.env.FW_DEV_PORT ?? '';
let baseURL = 'about:blank';
let command = 'exit 1';
if (fw === 'angular') {
    baseURL = `http://localhost:${dev_port}`;
    command = 'npx ng serve --host 0.0.0.0';
} else if (fw === 'react') {
    baseURL = `http://localhost:${dev_port}`;
    command = 'npm run dev';
} else if (fw == 'vue3') {
    baseURL = `http://localhost:${dev_port}`;
    command = 'npm run dev --host';
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Limit parallel tests on CI. */
    workers: process.env.CI ? 2 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['line']],
    // outputDir: '../../reports/ag-charts-website-e2e-reports/',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    expect: {
        toMatchSnapshot: {
            maxDiffPixels: 0,
            threshold: 0.01,
        },
        toHaveScreenshot: {
            maxDiffPixels: 0,
            threshold: 0.01,
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: {
                    width: 800,
                    height: 600,
                },
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
    },
});
