import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Sort definitions apply and clear via column defs', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Sort On' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'descending');

        await page.getByRole('button', { name: 'Sort Off' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.headerCell('age')).toHaveAttribute('aria-sort', 'none');
    });

    test.eachFramework('Hiding and showing columns via column defs', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.headerCell('athlete')).toHaveCount(1);

        await page.getByRole('button', { name: 'Hide Cols' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);
        await expect(agIdFor.headerCell('age')).toHaveCount(0);
        // Non-targeted columns remain visible.
        await expect(agIdFor.headerCell('country')).toHaveCount(1);

        await page.getByRole('button', { name: 'Show Cols' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(1);
        await expect(agIdFor.headerCell('age')).toHaveCount(1);
    });

    test.eachFramework('Row grouping applies via column defs', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Row Group On' }).click();

        // sport becomes a row group, so the auto group column header appears and group rows render.
        await expect(page.locator('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')).toHaveCount(1);
        await expect(page.locator('.ag-row-group').first()).toBeVisible();

        await page.getByRole('button', { name: 'Row Group Off' }).click();
        await expect(page.locator('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')).toHaveCount(0);
    });
});
