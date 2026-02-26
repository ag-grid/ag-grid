import { expect, test } from '@playwright/test';

test('copy-paste selected rows overwrites last row and adds new rows', async ({ page, context }) => {
    test.setTimeout(5_000);

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/ag-14783');

    // Wait for data to load (10 rows from remote endpoint)
    const firstCell = page.locator('.ag-row[row-index="0"] .ag-cell').first();
    await firstCell.waitFor();

    // Capture athlete names from first 3 rows for later verification
    const row0Athlete = await page.locator('.ag-row[row-index="0"] .ag-cell').first().textContent();
    const row1Athlete = await page.locator('.ag-row[row-index="1"] .ag-cell').first().textContent();
    const row2Athlete = await page.locator('.ag-row[row-index="2"] .ag-cell').first().textContent();

    // Select first row by clicking it
    await firstCell.click();

    // Shift+click third row to select rows 0-2
    await page
        .locator('.ag-row[row-index="2"] .ag-cell')
        .first()
        .click({ modifiers: ['Shift'] });

    // Copy selected rows
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+c`);

    // Click on the first cell of the last row to focus it
    await page.locator('.ag-row[row-index="9"] .ag-cell').first().click();

    // Paste
    await page.keyboard.press(`${modifier}+v`);

    // Verify that 2 new rows were added (12 total, indices 0-11)
    await expect(page.locator('.ag-row[row-index="11"]').first()).toBeVisible();

    // Verify the last row (index 9) was overwritten with first copied row's data
    await expect(page.locator('.ag-row[row-index="9"] .ag-cell').first()).toHaveText(row0Athlete!);

    // Verify new rows have the correct data from copied rows
    await expect(page.locator('.ag-row[row-index="10"] .ag-cell').first()).toHaveText(row1Athlete!);
    await expect(page.locator('.ag-row[row-index="11"] .ag-cell').first()).toHaveText(row2Athlete!);
});
