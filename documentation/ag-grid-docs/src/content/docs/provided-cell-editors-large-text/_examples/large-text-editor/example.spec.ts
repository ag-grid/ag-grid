import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const textArea = (page: any) => page.locator('.ag-large-text textarea').first();

test.agExample(import.meta, () => {
    // agLargeTextCellEditor (popup) - a standard HTML textarea for multi-line text.
    test.eachFramework('double-click shows a textarea editor and commits a new value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        await cell.dblclick();

        await expect(textArea(page)).toBeVisible();

        await textArea(page).fill('An updated multi-line description.');
        // Plain Enter commits the large text editor (shift+Enter inserts a newline).
        await textArea(page).press('Enter');

        await expect(cell).toContainText('An updated multi-line description.');
    });
});
