import { defineConfig, devices } from '@playwright/test';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

// The dev server's certificate is self-signed. Left on only for a local `BASE_URL`, so a deployed site's real
// certificate is still checked.
const ignoreHTTPSErrors =
    Boolean(process.env.BASE_URL) && LOCAL_HOSTNAMES.includes(new URL(process.env.BASE_URL!).hostname);

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
                open: 'never',
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
        ignoreHTTPSErrors,
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
