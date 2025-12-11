import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['PUBLIC_SITE_URL'] || 'https://localhost:4610';

console.log(`Using base URL: ${baseURL}`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './src',
    /* Run tests in files in parallel */
    fullyParallel: true,
    timeout: process.env.CI ? 60_000 : 10_000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText('text')`.
         */
        timeout: process.env.CI ? 10_000 : 5_000,
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 3,
    /* Limit parallel tests on CI. */
    workers: process.env.CI ? 2 : undefined,
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,
    },
    reporter: [
        ['line'],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../../reports',
                outputFile: 'ag-grid-public-e2e-testing-recipes.json',
            },
        ],
    ],
    outputDir: '../../reports/ag-grid-public-e2e-testing-recipes/',

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
                launchOptions: {
                    args: ['--ignore-certificate-errors'],
                },
            },
        },
    ],
});
