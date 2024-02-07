import { expect, test } from '@playwright/test';
import { agGridTest } from './utils';

test('group by column', async ({ page }) => {
    const { waitForCells, getHeaderLocator, getRowContents } = agGridTest(page);

    await page.goto(
        '/examples/grouping-group-panel/keep-columns-visible/modules/typescript/index.html'
    );
    await waitForCells();

    await getHeaderLocator({colHeaderName: 'Country'}).dragTo(page.getByText('Drag here to set row groups'));

    await page.waitForTimeout(1000);

    await expect(page.getByText('United States (1109)')).toBeVisible();

    expect(await getRowContents(0)).toEqual(['United States\n(1109)', '', '', '', '552', '440', '320', '1312']);
});
