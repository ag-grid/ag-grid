import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

import { FRAMEWORKS, loadPage } from './utils';

test.describe('Multiple grids e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            test.slow();
            // https://www.ag-grid.com/javascript-data-grid/excel-export-multiple-sheets/#example-excel-export-multiple-sheets-multiple-grids
            await loadPage(
                page,
                '/examples/excel-export-multiple-sheets/excel-export-multiple-sheets-multiple-grids',
                fw
            );

            const leftGrid = page.getByTestId(agTestIdFor.grid('1'));
            const rightGrid = page.getByTestId(agTestIdFor.grid('2'));

            await expect(leftGrid).toBeVisible();
            await expect(rightGrid).toBeVisible();

            await expect(leftGrid.getByTestId(agTestIdFor.rowNode('Aleksey Nemov'))).toBeVisible();
            await expect(rightGrid.getByTestId(agTestIdFor.rowNode('Sun Yang'))).toBeVisible();

            const checkbox = leftGrid.getByTestId(agTestIdFor.selectionColumnCheckbox('Aleksey Nemov'));
            await expect(checkbox).toBeVisible();
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        });
    }
});
