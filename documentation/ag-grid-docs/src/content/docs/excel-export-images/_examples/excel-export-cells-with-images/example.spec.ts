import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Rows with a null country are filtered out (createBase64FlagsFromResponse).
        // Filtered row 0: Natalie Coughlin, total 6.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
        // Filtered row 1: Alicia Coutts, total 5.
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Alicia Coutts');
    });

    test.eachFramework('Sorting by athlete reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Alicia Coutts (filtered row 1) is alphabetically first and unique.
        const alicia = agIdFor.rowNode('1');
        await expect(alicia).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('athlete').click(); // ascending
        await expect(alicia).toHaveAttribute('row-index', '0');
    });
});
