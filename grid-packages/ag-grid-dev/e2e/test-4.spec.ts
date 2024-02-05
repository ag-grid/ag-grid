import { test, expect } from '@playwright/test';
import { goToAndWaitForData } from './utils';

test('test', async ({ page }) => {
  await goToAndWaitForData(page,'https://grid-staging.ag-grid.com/examples/grouping-group-panel/keep-columns-visible/modules/typescript/index.html');
  await page.locator('.ag-header-cell-label').first().dragTo(page.getByText('Drag here to set row groups'));
  

  
});