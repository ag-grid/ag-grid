import { expect, test } from '@playwright/test';

import { goToExampleUrl, setupIntrinsicAssertions } from './util';

const UNSAFE_EVAL = "'unsafe-eval'";

const CSP_VIOLATION_PATTERN = /violates the following Content Security Policy|Content[- ]Security[- ]Policy/i;

/**
 * The tightened path-scoped policy under test: served as Report-Only during a
 * production validation window, as the enforced header everywhere else.
 */
function tightenedPolicy(headers: Record<string, string>): string {
    const policy = headers['content-security-policy-report-only'] ?? headers['content-security-policy'];
    expect(policy, 'expected a Content-Security-Policy header on the response').toBeTruthy();
    return policy!;
}

test.describe("unsafe-eval path scoping: 'site' vs 'examples' policy", () => {
    test('main pages are served the site policy, without unsafe-eval', async ({ page }) => {
        const response = await page.goto('/');
        expect(tightenedPolicy(response!.headers())).not.toContain(UNSAFE_EVAL);
    });

    test('example documents are served the relaxed policy, with unsafe-eval', async ({ page }) => {
        const response = await page.goto('/examples/getting-started/quick-start-example/vanilla');
        expect(tightenedPolicy(response!.headers())).toContain(UNSAFE_EVAL);
    });
});

test.describe('main pages produce no CSP violations under the site policy', () => {
    const mainPages = ['/', '/example/', '/theme-builder/', '/javascript-data-grid/getting-started/'];

    for (const pagePath of mainPages) {
        test(`${pagePath} loads without CSP violations`, async ({ page }) => {
            const violations: string[] = [];
            page.on('console', (msg) => {
                if (CSP_VIOLATION_PATTERN.test(msg.text())) {
                    violations.push(msg.text());
                }
            });
            await page.goto(pagePath);
            await page.waitForLoadState('networkidle');
            expect(violations).toEqual([]);
        });
    }
});

test.describe('example runner frameworks work under the relaxed policy', () => {
    setupIntrinsicAssertions();

    // Angular (JIT compiler) and vue3 (runtime template compiler) are the
    // frameworks that depend on unsafe-eval, beyond SystemJS module loading.
    const frameworks = ['vanilla', 'typescript', 'reactFunctionalTs', 'angular', 'vue3'];

    for (const framework of frameworks) {
        test(`quick-start-example (${framework}) renders the grid`, async ({ page }) => {
            await goToExampleUrl({
                page,
                pageName: 'getting-started',
                example: 'quick-start-example',
                framework,
            });
            await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 10000 });
        });
    }
});
