import { test, expect } from '@playwright/test';
import { getRowContents, goToAndWaitForData } from './utils';

const allCols = [
  'Michael Phelps',
  '8',
  '0',
  '0',
  '8',
  '23',
  'United States',
  'Swimming',
  '2008',
  '24/08/2008'
];
const noMedalCols = [
  'Michael Phelps',
  '23',
  'United States',
  'Swimming',
  '2008',
  '24/08/2008'
]

test('test hide/show columns', async ({ page }) => {

  await goToAndWaitForData(page, 'https://grid-staging.ag-grid.com/examples/column-updating-definitions/add-remove-columns/modules/angular/index.html');

  expect(await getRowContents(page, 0)).toEqual(allCols);

  await page.getByRole('button', { name: 'Exclude Medal Columns' }).click();
  expect(await getRowContents(page, 0)).toEqual(noMedalCols);

  await page.getByRole('button', { name: 'Include Medal Columns' }).click();
  expect(await getRowContents(page, 0)).toEqual(allCols);
});