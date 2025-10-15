import { defineConfig, devices } from '@playwright/test';

const PRE_34_VERSION = process.env.PRE_34_VERSION;

const PREV_URL = PRE_34_VERSION && `https://www.ag-grid.com/archive/${PRE_34_VERSION}/`;
const PROD_URL = process.env['PUBLIC_SITE_URL'];
const BASE_URL = process.env.BASE_URL;
const baseURL = BASE_URL || PREV_URL || PROD_URL || 'https://localhost:4610';

// eslint-disable-next-line no-console
console.log(`Using base URL: ${baseURL}`);
if (process.env.FRAMEWORK) {
    // eslint-disable-next-line no-console
    console.log(`Using framework: ${process.env.FRAMEWORK}`);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './src/content/docs/',
    /* Run tests in files in parallel */
    fullyParallel: true,
    timeout: process.env.CI ? 60_000 : 20_000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText('text')`.
         */
        timeout: process.env.CI ? 20_000 : 5_000,
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,
    /* Limit parallel tests on CI. */
    workers: process.env.CI ? 4 : undefined,
    // Stop running tests if lots of errors as likely configuration issues
    maxFailures: process.env.CI ? 200 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        [
            'html',
            {
                open: process.env.CI ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-grid-examples-interactive-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../reports',
                outputFile: `ag-grid-examples-interactive-${process.env.FRAMEWORK || 'default'}.json`,
            },
        ],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'off', // process.env.CI ? 'off' : 'retain-on-first-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testIgnore: ['**/async-test/provided/angular/app.component.spec.ts'],
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: ['**/async-test/provided/angular/app.component.spec.ts'],
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testIgnore: ['**/async-test/provided/angular/app.component.spec.ts'],
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
