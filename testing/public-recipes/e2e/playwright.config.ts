import { defineConfig, devices } from '@playwright/test';

// const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL!;
const baseURL = 'https://localhost:4610';

console.log(`Using base URL: ${baseURL}`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './src',
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    workers: 1,
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,
    },
    reporter: [['line']],
    outputDir: '../../reports/ag-grid-public-e2e-testing-recipes/',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    expect: {
        timeout: 3000,
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
                launchOptions: {
                    args: ['--ignore-certificate-errors'],
                },
            },
        },
    ],
});
