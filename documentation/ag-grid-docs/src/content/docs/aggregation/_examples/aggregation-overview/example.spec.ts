import { expect, test } from '@playwright/test';
import { ALL_FRAMEWORKS, loadPage } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'aggregation/aggregation-overview';
test.describe(pageExampleUrl, () => {
    for (const fw of ALL_FRAMEWORKS) {
        test(`can load the example in ${fw}`, async ({ page }) => {
            await loadPage(page, pageExampleUrl, fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            await expect(agIdFor.autoGroupCell('row-group-country-Canada')).toContainText('Canada (351)');
            await expect(agIdFor.cell('row-group-country-Canada', 'bronze')).toContainText('104');
            await expect(agIdFor.cell('row-group-country-Canada', 'silver')).toContainText('5');
            await expect(agIdFor.cell('row-group-country-Canada', 'gold')).toContainText('0.47863247863247865');
        });
    }
});
