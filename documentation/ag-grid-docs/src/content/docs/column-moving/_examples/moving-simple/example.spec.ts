import { expect, test } from '@playwright/test';
import { testAllFrameworks } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

const pageExampleUrl = 'column-moving/moving-simple';
testAllFrameworks('Example', pageExampleUrl, async ({ page, framework }) => {
    test.skip(framework === 'reactFunctionalTs', 'This test is skipped until the issue React Header Focus is resolved');

    // force the viewport width to be 800px so that columns are virtualised
    await page.setViewportSize({ width: 800, height: 600 });

    const agIdFor = wrapAgTestIdFor((testId) => page.getByTestId(testId));

    // focus the first cell
    await agIdFor.cell('0', 'athlete').click();
    await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

    // Shift tab to the last header
    await page.keyboard.press('Shift+Tab', {
        delay: 100,
    });

    await expect(agIdFor.headerCell('athlete')).toBeHidden();

    await expect(agIdFor.headerCell('total')).toHaveText('Total');
    await expect(agIdFor.headerCell('total')).toHaveClass(/ag-header-active/);
});
