import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testMatch: '*.spec.ts',
    forbidOnly: !!process.env.CI,
    workers: 1,
    reporter: [
        ['line'],
        [
            'html',
            {
                open: process.env.CI ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-grid-community-umd-browser-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../reports/',
                outputFile: 'ag-grid-community-umd-browser.json',
            },
        ],
    ],
    outputDir: '../../reports/ag-grid-community-umd-browser-reports/',
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Locally, run the installed Chrome with its sandbox on: Playwright's bundled Chromium lags behind
                // Chrome's security fixes and launches without the sandbox by default. CI keeps the bundled browser.
                ...(process.env.CI ? {} : { channel: 'chrome' }),
                viewport: {
                    width: 800,
                    height: 600,
                },
                launchOptions: { chromiumSandbox: !process.env.CI },
            },
        },
    ],
});
