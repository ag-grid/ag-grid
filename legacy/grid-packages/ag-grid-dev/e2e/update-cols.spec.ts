import { expect, test } from '@playwright/test';
import { agGridTest } from './utils';

const allCols = ['Michael Phelps', '8', '0', '0', '8', '23', 'United States', 'Swimming', '2008', '24/08/2008'];
const noMedalCols = ['Michael Phelps', '23', 'United States', 'Swimming', '2008', '24/08/2008'];

test('test hide/show columns', async ({ page }) => {
    const { waitForCells, getRowContents } = agGridTest(page);

    await page.goto(
        '/examples/column-updating-definitions/add-remove-columns/modules/vanilla/index.html'
    );
    await waitForCells();

    expect(await getRowContents(0)).toEqual(allCols);

    await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
    expect(await getRowContents(0)).toEqual(noMedalCols);

    await page.getByRole('button', { name: 'Include Medal Columns' }).click();
    expect(await getRowContents(0)).toEqual(allCols);
});

// test('test hide/show columns screenShot', async ({ page }) => {
//   const { waitForCells, getRowContents } = agGridTest(page);

//   await page.goto(
//       '/examples/column-updating-definitions/add-remove-columns/modules/vanilla/index.html'
//   );
//   await waitForCells();
//   await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();

//   await expect(page).toHaveScreenshot();
// });
