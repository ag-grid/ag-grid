import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('The toolbar Quick Filter input filters the rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const rows = page.locator('.ag-row[row-id]');
        expect(await rows.count()).toBeGreaterThan(3);

        // Quick Filter input is owned by the toolbar item, not external markup.
        const input = page.locator('.ag-toolbar-input input').first();
        await input.fill('Michael Phelps');
        // The toolbar item debounces input by 300ms before applying the filter; the
        // retrying toHaveCount polls until the debounced filter has narrowed to 3 rows.
        await expect(rows).toHaveCount(3);
        const athleteCells = page.locator('.ag-row[row-id] [col-id="athlete"]');
        const count = await athleteCells.count();
        for (let i = 0; i < count; i++) {
            await expect(athleteCells.nth(i)).toContainText('Michael Phelps');
        }
    });
});
