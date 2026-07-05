import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the olympic data under grouped column headers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners.json: Natalie Coughlin, United States, Swimming, 1/2/3/6.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'silver')).toContainText('2');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('3');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Sorting by athlete reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Aleksey Nemov (data index 1) is alphabetically first and unique in the dataset.
        const aleksey = agIdFor.rowNode('1');
        await expect(aleksey).toHaveAttribute('row-index', '1');

        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
        await expect(aleksey).toHaveAttribute('row-index', '0');
    });
});
