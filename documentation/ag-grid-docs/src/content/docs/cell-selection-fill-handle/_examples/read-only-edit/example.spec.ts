import { dragFillHandleOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
    });

    test.eachFramework('should fill cells when dragging fill handle via readOnlyEdit handler', async ({ agIdFor }) => {
        const sourceCell = agIdFor.cell('0', 'gold');
        await expect(sourceCell).toContainText('1');
        await expect(agIdFor.cell('1', 'gold')).toContainText('2');

        await sourceCell.click();

        const fillHandle = agIdFor.fillHandle();
        await expect(fillHandle).toBeVisible();

        const targetCell = agIdFor.cell('1', 'gold');
        await dragFillHandleOverTo(fillHandle, targetCell);

        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('1', 'gold')).toContainText('1');
    });

    test.eachFramework('should update cell value via readOnlyEdit handler', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'athlete');

        // Double-click to enter edit mode
        await cell.dblclick();
        const cellEditor = cell.locator('input');
        await expect(cellEditor).toBeVisible();

        // Select all existing text and type a new value
        await cellEditor.selectText();
        await page.keyboard.type('Updated Athlete');
        await page.keyboard.press('Enter');

        // Verify the cell editor is closed and the value is updated via the immutable store
        await expect(cellEditor).toHaveCount(0);
        await expect(cell).toContainText('Updated Athlete');
    });
});
