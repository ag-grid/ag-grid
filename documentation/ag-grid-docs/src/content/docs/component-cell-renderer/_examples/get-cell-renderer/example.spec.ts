import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('MedalCellRenderer renders one hash per medal', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Michael Phelps, gold 8 / silver 0 / bronze 0 (olympic-winners.json)
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toHaveText('########');

        // total is a valueGetter of gold + silver + bronze = 8
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Sorting the athlete column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps starts at the top but is not first alphabetically
        const phelps = agIdFor.rowNode('0');
        await expect(phelps).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('athlete').click();
        await expect(phelps).not.toHaveAttribute('row-index', '0');
    });
});
