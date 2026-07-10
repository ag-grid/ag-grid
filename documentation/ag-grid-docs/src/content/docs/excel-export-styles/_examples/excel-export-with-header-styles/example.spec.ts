import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grouped medal columns render their values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First data row: Michael Phelps, Swimming, gold 8 / silver 0 / bronze 0.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('0');
    });

    test.eachFramework('Sorting a medal column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row node '0' (gold 8) starts at the top.
        const firstRow = agIdFor.rowNode('0');
        await expect(firstRow).toHaveAttribute('row-index', '0');

        // Sorting gold ascending moves the highest gold tally away from the top.
        await agIdFor.headerCell('gold').click();
        await expect(firstRow).not.toHaveAttribute('row-index', '0');
    });
});
