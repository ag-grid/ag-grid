import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'node:path';

const ROOT = path.join(__dirname, '../../');
dotenv.config({ path: path.join(ROOT, 'documentation/ag-grid-docs/.env.dev') }); // grab docs PORT
const PORT = process.env['PORT'] ?? '4610';
const baseURL = `https://localhost:${PORT}`;

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
        ignoreHTTPSErrors: true,
    },

    reporter: [
        ['list'],
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
    const command = `node ${path.join(ROOT, 'testing/performance/webServer.js')}`;
    config.webServer = {
        command,
        cwd: ROOT,
        url: baseURL,
        reuseExistingServer: !process.env['CI'],
        ignoreHTTPSErrors: true,
        timeout: 30 * 1000, // mostly build time
    };
}

export default config;
