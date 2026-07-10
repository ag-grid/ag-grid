import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the first eight olympic winners', async ({ agIdFor }) => {
        // Only the first 8 rows of olympic-winners.json are loaded.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        // Row 7 is the last loaded row; there is no row 8.
        await expect(agIdFor.rowNode('7')).toBeVisible();
        await expect(agIdFor.rowNode('8')).not.toBeVisible();
    });

    test.eachFramework('Clicking a row selects it (click selection enabled)', async ({ agIdFor }) => {
        const row0 = agIdFor.rowNode('0');
        await expect(row0).not.toHaveClass(/ag-row-selected/);

        await agIdFor.cell('0', 'athlete').click();
        await expect(row0).toHaveClass(/ag-row-selected/);
    });
});
