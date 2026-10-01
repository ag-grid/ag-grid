import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testMatch: '*.spec.ts',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ['line'],
        [
            'html',
            {
                open: process.env.CI ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-e2e-testing-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../reports/',
                outputFile: 'ag-e2e-testing.json',
            },
        ],
    ],
    outputDir: '../../reports/ag-e2e-testing-reports/',
    use: {
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        viewport: { width: 800, height: 600 },
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
});
