import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

// redrawRows() rips rows out of the DOM and rebuilds them, re-running getRowStyle so the row
// background colour changes. "Redraw All Rows" recolours every row; "Redraw Top Rows" only
// rebuilds the first six rows, leaving the lower rows on their previous colour.
test.agExample(import.meta, () => {
    const rowBg = (page: any, rowId: string) =>
        page
            .locator(`.ag-row[row-id="${rowId}"]`)
            .first()
            .evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor);

    test.eachFramework('Redraw All Rows recolours every row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const topBefore = await rowBg(page, '0');

        await page.getByRole('button', { name: 'Redraw All Rows', exact: true }).click();
        await waitForRowAnimations(page);

        const topAfter = await rowBg(page, '0');
        const bottomAfter = await rowBg(page, '6');

        // The colour advanced for the top row...
        expect(topAfter).not.toBe(topBefore);
        // ...and all rows share the same colour after a full redraw.
        expect(bottomAfter).toBe(topAfter);
    });

    test.eachFramework('Redraw Top Rows recolours only the top rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const bottomBefore = await rowBg(page, '6');

        await page.getByRole('button', { name: 'Redraw Top Rows', exact: true }).click();
        await waitForRowAnimations(page);

        const topAfter = await rowBg(page, '0');
        const topLastAfter = await rowBg(page, '5');
        const bottomAfter = await rowBg(page, '6');

        // The top six rows moved to the new colour together...
        expect(topLastAfter).toBe(topAfter);
        // ...while rows below index 6 kept their original colour.
        expect(bottomAfter).toBe(bottomBefore);
        expect(topAfter).not.toBe(bottomAfter);
    });
});
