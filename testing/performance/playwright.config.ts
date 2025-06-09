import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.join(__dirname, '../../documentation/ag-grid-docs/.env.dev') }); // grab docs PORT

const baseURL = `https://localhost:${process.env['PORT'] ?? '4610'}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config = defineConfig({
    testDir: './e2e',
    workers: 1, // always 1
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,
        headless: !!(process.env['PW_HEADLESS'] ?? process.env['CI']),
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: {
                    width: 1920,
                    height: 1080,
                },
            },
        },
    ],
});

if (!process.env['PW_NO_SERVER']) {
    config /* Run your local dev server before starting the tests */.webServer = {
        command: 'npx nx dev',
        url: baseURL,
        reuseExistingServer: !process.env['CI'],
        ignoreHTTPSErrors: true,
    };
}

export default config;
