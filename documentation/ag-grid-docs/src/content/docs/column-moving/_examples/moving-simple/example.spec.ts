import { expect, test } from '@playwright/test';
import { ALL_FRAMEWORKS, loadPage } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'column-moving/moving-simple';
test.describe(pageExampleUrl, () => {
    for (const fw of ALL_FRAMEWORKS) {
        test(`can load the example in ${fw}`, async ({ page }) => {
            await loadPage(page, pageExampleUrl, fw);

            const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

            // focus the first cell
            await agIdFor.cell('0', 'athlete').click();
            await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
        });
    }
});
