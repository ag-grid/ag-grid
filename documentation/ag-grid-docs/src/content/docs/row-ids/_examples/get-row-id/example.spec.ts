import { expect, test } from '@playwright/test';
import { ALL_FRAMEWORKS, loadPage } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'row-ids/get-row-id';
test.describe(pageExampleUrl, () => {
    for (const fw of ALL_FRAMEWORKS) {
        test(`can load the example and validate row data in ${fw}`, async ({ page }) => {
            await loadPage(page, pageExampleUrl, fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            await expect(agIdFor.rowNode('c2')).toBeVisible();

            await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
            await expect(agIdFor.cell('c2', 'price')).toContainText('32000');
        });
    }
});
