import { test } from '@playwright/test';

import { goToExampleUrl, setupIntrinsicAssertions } from './util';

test.describe('security', () => {
    // Check for console errors
    setupIntrinsicAssertions();

    test('line-sparkline-customisation-csp example should load successfully', async ({ page }) => {
        await goToExampleUrl({
            page,
            pageName: 'security-test',
            example: 'line-sparkline-customisation-csp',
            framework: 'vanilla',
        });
    });

    test('combination-chart-csp example should load successfully', async ({ page }) => {
        await goToExampleUrl({
            page,
            pageName: 'security-test',
            example: 'combination-chart-csp',
            framework: 'vanilla',
        });
    });
});
