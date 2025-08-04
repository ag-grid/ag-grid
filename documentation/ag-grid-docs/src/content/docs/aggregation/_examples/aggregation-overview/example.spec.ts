import { expect } from '@playwright/test';
import { testAllFrameworks } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'aggregation/aggregation-overview';
testAllFrameworks('Example', pageExampleUrl, async ({ page }) => {
    const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

    await expect(agIdFor.autoGroupCell('row-group-country-Canada')).toContainText('Canada (351)', {
        useInnerText: true,
    });
    await expect(agIdFor.cell('row-group-country-Canada', 'bronze')).toContainText('104');
    await expect(agIdFor.cell('row-group-country-Canada', 'silver')).toContainText('5');
    await expect(agIdFor.cell('row-group-country-Canada', 'gold')).toContainText('0.47863247863247865');
});
