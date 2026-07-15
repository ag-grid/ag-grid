import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('All columns and headers are rendered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners (filtered to rows with a country).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'silver')).toContainText('2');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('3');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');

        // Grouped header rows are present.
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Top Level Column Group' })).toHaveCount(
            1
        );
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Group A' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Group B' })).toHaveCount(1);
    });

    test.eachFramework('Sorting by total reorders the rows', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Turn off row animation so the sort re-order does not leave an animating "zombie"
        // duplicate row in the DOM (off-screen zombies are not always cleaned up on WebKit).
        // With animation off, exactly one row occupies row-index 0, so we assert the identity
        // of whichever row is currently at the top rather than tracking Natalie's row — which
        // scrolls out of the virtualised DOM entirely when it sorts to the bottom.
        await remoteGrid(page).setGridOption('animateRows', false);

        // Natalie Coughlin (row-id 0) holds the unique maximum total (6) and starts at the top.
        const topRow = page.locator('.ag-grid-scrolling-container .ag-row[row-index="0"]');
        await expect(topRow).toHaveAttribute('row-id', '0');

        // Ascending sort pushes the maximum to the bottom.
        await agIdFor.headerCell('total').click();
        // Gate on the sort being applied (aria-sort) before asserting the row order, so the
        // assertion never races the click on frameworks with async change detection (Angular).
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'ascending');
        await expect(topRow).not.toHaveAttribute('row-id', '0');

        // Descending sort brings the maximum back to the top.
        await agIdFor.headerCell('total').click();
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'descending');
        await expect(topRow).toHaveAttribute('row-id', '0');
    });
});
