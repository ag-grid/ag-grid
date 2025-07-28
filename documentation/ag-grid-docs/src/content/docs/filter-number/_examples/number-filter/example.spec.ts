import { expect, test } from '@playwright/test';
import { ALL_FRAMEWORKS, loadPage } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'filter-number/number-filter';
test.describe(pageExampleUrl, () => {
    for (const fw of ALL_FRAMEWORKS) {
        test(`can load the example in ${fw}`, async ({ page }) => {
            await loadPage(page, pageExampleUrl, fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            const colFilterIcon = agIdFor.headerFilterButton('price');
            await expect(colFilterIcon).toBeVisible();
            await colFilterIcon.click();

            const filterOption = agIdFor.filterInstancePickerDisplay({ source: 'column-filter' });

            await filterOption.click();

            await page.getByText('Greater than', { exact: true }).click();

            const filterInput = agIdFor.numberFilterInstanceInput({ source: 'column-filter' });

            await filterInput.fill('70000');

            // close the filter by clicking outside
            await agIdFor.cell('1', 'price').click();
        });
    }
});
