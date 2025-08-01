import { expect } from '@playwright/test';
// Import the test helper from test-utils
import { testAllFrameworks } from '@utils/grid/test-utils';

const testUrl = 'cell-editing-start-stop/cell-editing';

// TODO: Move this to the top-level editing
testAllFrameworks('Editing: dblclick', testUrl, async ({ page, agIdFor }) => {
    const cell = agIdFor.cell('0', 'firstName');

    // initiate cell editing by double clicking the cell
    await cell.dblclick();
    const cellEditor = cell.locator('input');
    await expect(cellEditor).toBeVisible();

    await page.keyboard.type('Fred'); // type in a new value
    await page.keyboard.press('Enter'); // press Enter to save the value

    await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
    await expect(cell).toHaveText('Fred'); // verify the cell has the new value
});

testAllFrameworks('Editing: typestart + commit', testUrl, async ({ page, agIdFor }) => {
    const cell = agIdFor.cell('0', 'firstName');

    await cell.click(); // click the cell to focus it
    await page.keyboard.type('Fred'); // type in a new value

    const cellEditor = cell.locator('input');
    await expect(cellEditor).toBeVisible();

    await page.keyboard.press('Enter'); // press Enter to save the value

    await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
    await expect(cell).toHaveText('Fred'); // verify the cell has the new value
});

testAllFrameworks('Editing: typestart + cancel', testUrl, async ({ page, agIdFor }) => {
    const cell = agIdFor.cell('0', 'firstName');

    await cell.click(); // click the cell to focus it
    await page.keyboard.type('Fred'); // type in a new value

    const cellEditor = cell.locator('input');
    await expect(cellEditor).toBeVisible();

    await page.keyboard.press('Escape'); // press Enter to save the value

    await expect(cellEditor).toHaveCount(0); // verify the cell editor is closed
    await expect(cell).toHaveText('Bob'); // verify the cell has the new value
});
