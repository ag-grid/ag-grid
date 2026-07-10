import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json: Michael Phelps, United States, Swimming, gold 8, silver 0.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Sorting by gold reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const phelps = agIdFor.rowNode('0'); // Michael Phelps, gold 8 (near the top of the medal count)
        await expect(phelps).toHaveAttribute('row-index', '0');

        // Ascending sort floats the lowest gold counts to the top, so the gold-8 row sinks.
        await agIdFor.headerCell('gold').click();
        await expect(phelps).not.toHaveAttribute('row-index', '0');
    });
});
