import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

async function loadE2ETestingExample(page: Page, framework: string): Promise<Page> {
    // https://www.ag-grid.com/javascript-data-grid/excel-export-multiple-sheets/#example-excel-export-multiple-sheets-multiple-grids
    await page.goto(
        `/examples/excel-export-multiple-sheets/excel-export-multiple-sheets-multiple-grids/${framework}?enableTestIds=true`
    );
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    return page;
}

const FRAMEWORKS = ['typescript', 'reactFunctional', 'angular', 'vue3'] as const;

test.describe('Multiple grids e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            test.slow();
            await loadE2ETestingExample(page, fw);

            const leftGrid = page.getByTestId(agTestIdFor.grid('1'));
            const rightGrid = page.getByTestId(agTestIdFor.grid('2'));

            await expect(leftGrid).toBeVisible();
            await expect(rightGrid).toBeVisible();

            await expect(leftGrid.getByTestId(agTestIdFor.rowNode('Aleksey Nemov'))).toBeVisible();
            await expect(rightGrid.getByTestId(agTestIdFor.rowNode('Sun Yang'))).toBeVisible();

            const checkbox = leftGrid.getByTestId(agTestIdFor.checkbox('Aleksey Nemov', 'ag-Grid-SelectionColumn'));
            await expect(checkbox).toBeVisible();
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        });
    }
});
