import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

const ROW_NUMBERS_COL = 'ag-Grid-RowNumbersColumn';

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('Row numbers stay positional after sorting', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);

        // Row numbers track display position, not the data, so they remain 1, 2, 3, ... after a sort.
        // A long-distance sort can briefly leave a zombie duplicate of a moved row sharing its
        // row-index in the DOM (see waitForRowAnimations above) - scope to the scrolling
        // container (as expectRowIdAtIndex does) and let each auto-retrying assertion ride out
        // the transient, rather than hand-scraping every row with a one-shot `.all()`.
        for (let index = 0; index < 3; ++index) {
            const cell = page.locator(
                `.ag-grid-scrolling-container .ag-row[row-index="${index}"] [col-id="${ROW_NUMBERS_COL}"]`
            );
            await expect(cell).toHaveText(String(index + 1));
        }
    });
});
