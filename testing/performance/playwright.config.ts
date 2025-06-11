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

    reporter: [
        ['html', { open: 'never' }], // generate HTML report, but don't open it automatically
        ['json', { outputFile: '../../playwright-report/test-results.json' }], // JSON reporter for CI integration
    ],

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

/* Run local dev server before starting the tests */
if (!process.env['PW_NO_SERVER']) {
    config.webServer = {
        command: 'npx nx dev --no-watch',
        cwd: path.join(__dirname, '../../'),
        url: baseURL,
        reuseExistingServer: !process.env['CI'],
        ignoreHTTPSErrors: true,
        timeout: 10 * 60 * 1000, // sometimes it takes a long time to start the server
    };
}

export default config;
