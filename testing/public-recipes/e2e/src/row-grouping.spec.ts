import { expect, test } from '@playwright/test';

import { agTestIdFor } from 'ag-grid-community';

import { FRAMEWORKS, loadPage } from './utils';

test.describe('Row Grouping selection e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and select row in ${fw}`, async ({ page }) => {
            // https://ag-grid.com/react-data-grid/grouping-row-selection/#example-group-cell-checkboxes
            await loadPage(page, '/examples/grouping-row-selection/group-cell-checkboxes', fw);

            await expect(page.getByTestId(agTestIdFor.rowNode('row-group-country-United States'))).toBeVisible();
            await expect(page.getByTestId(agTestIdFor.autoGroupCell('row-group-country-United States'))).toContainText(
                'United States'
            );

            const checkbox = page.getByTestId(agTestIdFor.autoGroupColumnCheckbox('row-group-country-Norway'));
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        });
    }
});

test.describe('Row Grouping expansion e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can expand a group row in ${fw}`, async ({ page }) => {
            // https://ag-grid.com/react-data-grid/grouping-row-selection/#example-group-cell-checkboxes
            await loadPage(page, '/examples/grouping-row-selection/group-cell-checkboxes', fw);

            await page.getByTestId(agTestIdFor.autoGroupContracted('row-group-country-United States')).click();

            await page
                .getByTestId(agTestIdFor.autoGroupContracted('row-group-country-United States-sport-Swimming'))
                .click();

            await expect(page.getByTestId(agTestIdFor.autoGroupCell('6'))).toContainText('Missy Franklin');
        });
    }
});
