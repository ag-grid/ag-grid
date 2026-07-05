import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns are addressable by their derived and explicit IDs', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Col 1 derives its colId from the field ('height').
        await expect(agIdFor.headerCell('height')).toContainText('Col 1');
        // Col 2 and Col 3 use explicit colIds.
        await expect(agIdFor.headerCell('firstWidth')).toContainText('Col 2');
        await expect(agIdFor.headerCell('secondWidth')).toContainText('Col 3');

        // Five columns are rendered in total (Col 4 and Col 5 get generated IDs).
        await expect(page.locator('.ag-header-cell')).toHaveCount(5);
    });

    test.eachFramework('Sorting works via a column referenced by its derived ID', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.headerCell('height')).toHaveAttribute('aria-sort', 'none');

        await agIdFor.headerCell('height').click();
        await expect(agIdFor.headerCell('height')).toHaveAttribute('aria-sort', 'ascending');

        await page.waitForTimeout(300); // avoid a double-click
        await agIdFor.headerCell('height').click();
        await expect(agIdFor.headerCell('height')).toHaveAttribute('aria-sort', 'descending');
    });
});
