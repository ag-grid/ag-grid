import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

export async function goToExampleUrl({
    page,
    pageName,
    example,
    framework,
}: {
    page: Page;
    pageName: string;
    example: string;
    framework: string;
}) {
    const url = `/examples/${pageName}/${example}/${framework}`;
    await page.goto(url);

    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');
}

export function setupIntrinsicAssertions() {
    let consoleWarnOrErrors: string[] = [];
    const config = { ignore404s: false, ignoreConsoleWarnings: false };

    test.beforeEach(({ page }) => {
        consoleWarnOrErrors = [];
        config.ignore404s = false;
        config.ignoreConsoleWarnings = false;

        page.on('console', (msg) => {
            // We only care about warnings/errors.
            if (msg.type() !== 'warning' && msg.type() !== 'error') return;

            // We don't care about the AG license error message.
            if (msg.text().startsWith('*')) return;

            // Ignore Firefox Quirks Mode warning.
            if (msg.text().includes('This page is in Quirks Mode')) return;

            // Ignore 404s when expected
            const notFoundMatcher = /the server responded with a status of 404 \(Not Found\)/;
            if (msg.location().url.includes('/favicon.ico')) return;
            if (notFoundMatcher.test(msg.text())) {
                if (config.ignore404s) return;
                expect(`${msg.location().url} - ${msg.text()}`).not.toMatch(notFoundMatcher);
            }

            consoleWarnOrErrors.push(msg.text());
        });

        page.on('pageerror', (err) => {
            consoleWarnOrErrors.push(err.message);
        });
    });

    test.afterEach(() => {
        if (!config.ignoreConsoleWarnings) {
            expect(consoleWarnOrErrors).toHaveLength(0);
        }
    });

    return config;
}
