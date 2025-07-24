import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
    // https://ag-grid.com/react-data-grid/grouping-row-selection/#example-group-cell-checkboxes
    await page.goto(`/examples/grouping-row-selection/group-cell-checkboxes/${framework}?enableTestIds=true`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Simple e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            await loadE2ETestingExample(page, fw);

            await expect(page.getByTestId(agTestIdFor.rowNode('row-group-country-United States'))).toBeVisible({
                timeout: 20_000,
            });
            await expect(
                page.getByTestId(agTestIdFor.cell('row-group-country-United States', 'ag-Grid-AutoColumn'))
            ).toContainText('United States');

            const checkbox = page.getByTestId(agTestIdFor.checkbox('row-group-country-Norway', 'ag-Grid-AutoColumn'));
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        });
    }
});

test.describe('Interactive e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can expand a group row in ${fw}`, async ({ page }) => {
            await loadE2ETestingExample(page, fw);

            await page
                .getByTestId(agTestIdFor.groupContracted('row-group-country-United States', 'ag-Grid-AutoColumn'))
                .click();

            await page
                .getByTestId(
                    agTestIdFor.groupContracted('row-group-country-United States-sport-Swimming', 'ag-Grid-AutoColumn')
                )
                .click();

            await expect(page.getByTestId(agTestIdFor.cell('6', 'ag-Grid-AutoColumn'))).toContainText('Missy Franklin');
        });
    }
});
