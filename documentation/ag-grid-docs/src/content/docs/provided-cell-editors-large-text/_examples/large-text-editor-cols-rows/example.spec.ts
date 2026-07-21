import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const textArea = (page: any) => page.locator('.ag-large-text textarea').first();

test.agExample(import.meta, () => {
    // agLargeTextCellEditor (popup) with rows: 15 and cols: 50 customising the textarea size.
    test.eachFramework('the textarea uses the configured rows and cols', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'description').dblclick();

        await expect(textArea(page)).toBeVisible();
        await expect(textArea(page)).toHaveAttribute('rows', '15');
        await expect(textArea(page)).toHaveAttribute('cols', '50');
    });

    test.eachFramework('commits a new value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        await cell.dblclick();
        await expect(textArea(page)).toBeVisible();

        await textArea(page).fill('Resized editor description.');
        await textArea(page).press('Enter');

        await expect(cell).toContainText('Resized editor description.');
    });
});
