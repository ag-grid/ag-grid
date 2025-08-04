import { expect } from '@playwright/test';
import { testAllFrameworks } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'row-ids/get-row-id';
testAllFrameworks('Example', pageExampleUrl, async ({ page }) => {
    const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

    await expect(agIdFor.rowNode('c2')).toBeVisible();

    await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
    await expect(agIdFor.cell('c2', 'price')).toContainText('32000');
});
