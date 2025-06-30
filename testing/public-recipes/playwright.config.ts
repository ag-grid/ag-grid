import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL!;
const baseURL = process.env.PUBLIC_BASE_URL ? path.join(PUBLIC_SITE_URL, process.env.PUBLIC_BASE_URL) : PUBLIC_SITE_URL;

console.log(`Using base URL: ${baseURL}`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    workers: 1,
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,
    },
    reporter: [['line']],
    outputDir: '../../reports/ag-grid-public-testing-recipes/',
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
            },
        },
    ],
});
