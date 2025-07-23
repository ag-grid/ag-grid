import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { wrapAgTestIdFor } from 'ag-grid-community';
import { agTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
    // https://ag-grid.com/javascript-data-grid/row-ids/#example-get-row-id
    await page.goto(`/examples/row-ids/get-row-id/${framework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Simple e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and validate row data in ${fw}`, async ({ page }) => {
            await loadE2ETestingExample(page, fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            await expect(agIdFor.rowNode('c2')).toBeVisible();

            await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
            await expect(agIdFor.cell('c2', 'price')).toContainText('32000');

            // equivalent call without using the utility wrapper.
            await expect(page.getByTestId(agTestIdFor.cell('c2', 'price'))).toContainText('32000');
        });
    }
});
