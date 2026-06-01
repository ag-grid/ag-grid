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
                outputFolder: '../../reports/ag-stack-umd-browser-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../reports/',
                outputFile: 'ag-stack-umd-browser.json',
            },
        ],
    ],
    outputDir: '../../reports/ag-stack-umd-browser-reports/',
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
