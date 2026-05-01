import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('pressing S on a focused cell selects the row', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('pressing S again deselects the row', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('S selects the row of whichever cell is focused', async ({ agIdFor, page }) => {
        await agIdFor.cell('1', 'country').click();
        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        // Single row mode: selecting row 2 deselects row 1
        await agIdFor.cell('2', 'sport').click();
        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('S key works on any column', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'gold').click();
        await page.keyboard.press('s');
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
    });
});
