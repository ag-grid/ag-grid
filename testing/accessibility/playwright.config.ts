import { defineConfig, devices } from '@playwright/test';

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
    retries: 0,
    // retries: process.env.CI ? 2 : 0,
    /* Limit parallel tests on CI. */
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        [
            'html',
            {
                open: process.env.CI ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-accessibility-e2e-html/',
            },
        ],
        ['junit', { outputFile: '../../reports/ag-accessibility-e2e.xml' }],
        ['line'], //,
        ['json', { outputFile: '../../reports/ag-accessibility-e2e.json' }],
    ],
    outputDir: '../../reports/ag-grid-accessibility-e2e-reports/',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    expect: {
        timeout: 1500,
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
});
