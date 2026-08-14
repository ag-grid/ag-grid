import { defineConfig, devices } from '@playwright/test';

import { wafBypassSecret } from './src/utils/grid/test/wafBypass';

const PRE_34_VERSION = process.env.PRE_34_VERSION;

const PREV_URL = PRE_34_VERSION && `https://www.ag-grid.com/archive/${PRE_34_VERSION}/`;
const PROD_URL = process.env['PUBLIC_SITE_URL'];
const BASE_URL = process.env.BASE_URL;
// Tests navigate with base-relative paths so they survive a build deployed under a path prefix
// (`https://testing.ag-grid.com/<TICKET>/`). `new URL(relative, base)` drops the base's last segment
// unless it ends in a slash, so a URL passed without one would silently lose the prefix.
const withTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

const baseURL = withTrailingSlash(BASE_URL || PREV_URL || PROD_URL || 'https://localhost:4610');

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

const BROWSER_IGNORED_TESTS = [
    '**/async-test/provided/angular/app.component.spec.ts',
    // page-verification.spec.ts runs in its own dedicated CI job.
    '**/page-verification.spec.ts',
];

function isLocalRun(url: string): boolean {
    try {
        return LOCAL_HOSTNAMES.includes(new URL(url).hostname);
    } catch {
        // A URL that does not parse is not one we can treat as local.
        return false;
    }
}

// A run against the local dev server gets no retry, so a flaky example fails fast rather than being
// masked by a re-run. A run against a deployed site keeps one, since it can fail on the network alone.
const localRetries = isLocalRun(baseURL) ? 0 : 1;

// eslint-disable-next-line no-console
console.log(`Using base URL: ${baseURL}`);
if (process.env.FRAMEWORK) {
    // eslint-disable-next-line no-console
    console.log(`Using framework: ${process.env.FRAMEWORK}`);
}
if (wafBypassSecret) {
    // eslint-disable-next-line no-console
    console.log(`Sending WAF bypass header to ${new URL(baseURL).origin} only`);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
    testDir: './src/content/docs/',
    /* Run tests in files in parallel */
    fullyParallel: true,
    timeout: process.env.CI ? 60_000 : 20_000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText('text')`.
         */
        timeout: process.env.CI ? 20_000 : 10_000,
    },
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : localRetries,
    /* Limit parallel tests on CI. Locally Playwright's default is half the cores, which measured ~49% idle
       on a 16-core machine - the browsers are the load and they do not saturate it, so take more of it. */
    workers: process.env.CI ? 4 : '75%',
    // Stop running tests if lots of errors as likely configuration issues
    maxFailures: process.env.CI ? 200 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        [
            'html',
            {
                open: process.env.CI ? 'never' : 'on-failure',
                outputFolder: '../../reports/ag-grid-examples-interactive-html/',
            },
        ],
        [
            'playwright-ctrf-json-reporter',
            {
                outputDir: '../../reports',
                outputFile: `ag-grid-examples-interactive-${process.env.FRAMEWORK || 'default'}.json`,
            },
        ],
        // Only the page-verification project records CSP violations, so every other project
        // writes an empty report here.
        ['./scripts/csp/cspViolationReporter.ts'],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL,

        // The dev server's certificate is self-signed. Chromium waives that for localhost but Node does not,
        // so route handlers that re-request a URL fail without this. Left on for a deployed run, whose
        // certificate is real and should still be checked.
        ignoreHTTPSErrors: isLocalRun(baseURL),

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        // Keep this off for CI runs that upload reports: a trace records request headers, so it would
        // capture the WAF bypass credential in an artefact that GitHub's log masking does not cover.
        trace: 'off', // process.env.CI ? 'off' : 'retain-on-first-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testIgnore: BROWSER_IGNORED_TESTS,
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: BROWSER_IGNORED_TESTS,
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testIgnore: BROWSER_IGNORED_TESTS,
        },
        {
            // Dedicated project for post-deploy verification — run via post-deploy-verification.yml.
            // Not included in standard ./docs-e2e.sh runs (those use --project=chromium).
            name: 'page-verification',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/page-verification.spec.ts',
        },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
