import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../../');
const reportPath = path.resolve(ROOT, process.env['PW_REPORT_PATH'] ?? './reports/ag-accessibility-e2e.json');
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env['CI'],
    /* Retry on CI only */
    retries: 0,
    // retries: process.env.CI ? 2 : 0,
    /* Limit parallel tests on CI. */
    workers: 1,
    // workers: process.env.CI ? 2 : undefined,
    reporter: [
        [
            'html',
            {
                open: process.env['CI'] ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-accessibility-e2e-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: path.parse(reportPath).dir,
                outputFile: path.parse(reportPath).base,
            },
        ],
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
