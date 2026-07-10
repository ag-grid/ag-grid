import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, United States, 2008, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Ctrl + X does not remove the cell value when cut is suppressed', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');
        await cell.click();
        await expect(cell).toContainText('Michael Phelps');

        await page.keyboard.press('Control+x');

        // suppressCutToClipboard prevents the destructive cut, so the value is retained.
        await expect(cell).toContainText('Michael Phelps');
    });

    test.eachFramework('Cell selection ranges can still be dragged for copy', async ({ agIdFor }) => {
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('2', 'country');

        await dragOverTo(source, target, undefined);

        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
    });
});
