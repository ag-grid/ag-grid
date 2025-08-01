import { expect } from '@playwright/test';
// Import the test helper from test-utils
import { testAllFrameworks } from '@utils/grid/test-utils';

const testUrl = 'cell-editing-batch/batch-editing-api';

testAllFrameworks('Edit + Dependent Renderer', testUrl, async ({ page, agIdFor }) => {
    const cell = agIdFor.cell('0', 'gold');

    // initiate cell editing by double clicking the cell
    await cell.dblclick();
    const cellEditor = cell.locator('input');
    await expect(cellEditor).toBeVisible();

    await page.keyboard.type('100'); // type in a new value
    await page.keyboard.press('Enter'); // press Enter to save the value

    await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
    await expect(cell).toHaveText('100'); // verify the cell has the new value
    await expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

    const totalCell = agIdFor.cell('0', 'total');
    await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
    await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
});

testAllFrameworks('Batch Editing + Dependent Renderer', testUrl, async ({ page, agIdFor }) => {
    const startBatchButton = page.locator('button', { hasText: 'Start Batch Edit' });

    await startBatchButton.click(); // click the button to start batch editing

    const cell = agIdFor.cell('0', 'gold');

    // initiate cell editing by double clicking the cell
    await cell.dblclick();
    const cellEditor = cell.locator('input');
    await expect(cellEditor).toBeVisible();

    await page.keyboard.type('100'); // type in a new value
    await page.keyboard.press('Enter'); // press Enter to save the value

    await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
    await expect(cell).toHaveText('100'); // verify the cell has the new value
    await expect(cell).toHaveClass(/ag-cell-batch-edit/);

    const totalCell = agIdFor.cell('0', 'total');
    await expect(totalCell).toHaveText('105'); // verify the total cell has the new value
    await expect(totalCell).not.toHaveClass(/ag-cell-batch-edit/);
});
