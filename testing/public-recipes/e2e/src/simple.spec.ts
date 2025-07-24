import { expect, test } from '@playwright/test';

import { wrapAgTestIdFor } from 'ag-grid-community';
import { agTestIdFor } from 'ag-grid-community';

import { FRAMEWORKS, loadPage } from './utils';

test.describe('Simple e2e testing examples', () => {
    for (const fw of FRAMEWORKS) {
        test(`can load the example and validate row data in ${fw}`, async ({ page }) => {
            // https://ag-grid.com/javascript-data-grid/row-ids/#example-get-row-id
            await loadPage(page, '/examples/row-ids/get-row-id', fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            await expect(agIdFor.rowNode('c2')).toBeVisible();

            await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
            await expect(agIdFor.cell('c2', 'price')).toContainText('32000');

            // equivalent call without using the utility wrapper.
            await expect(page.getByTestId(agTestIdFor.cell('c2', 'price'))).toContainText('32000');
        });
    }
});
