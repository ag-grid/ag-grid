import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tree data renders with the category auto group column', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Auto group column ('Category') plus the 'Origin' column are shown.
        const headers = page.locator('.ag-header-cell-text');
        await expect(headers).toContainText(['Category', 'Origin']);

        // groupDefaultExpanded=1 expands the top-level groups, revealing their children.
        await expect(page.getByText('Root Vegetables', { exact: true })).toBeVisible();
        await expect(page.getByText('Carrot', { exact: true })).toBeVisible();
    });

    test.eachFramework('Group tree nodes with facts are masters and show detail before children', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Leafy Greens and Cruciferous are level-0 groups that also have facts, so they are master
        // rows. Master/detail shows detail grids for every eligible row by default, so with the top
        // level expanded (groupDefaultExpanded=1) both group detail grids are rendered on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(2);

        // The Leafy Greens group detail contains its facts.
        const leafyDetail = detailRows.filter({ hasText: 'Edible leaves' });
        await expect(leafyDetail).toHaveCount(1);
        await expect(leafyDetail.first().locator('.ag-header-cell-text')).toContainText(['Description', 'Importance']);

        // The group's detail grid is shown before (above) its child rows (e.g. Spinach).
        const detailBox = await leafyDetail.first().boundingBox();
        const spinachBox = await page.getByText('Spinach', { exact: true }).first().boundingBox();
        expect(detailBox).not.toBeNull();
        expect(spinachBox).not.toBeNull();
        expect(detailBox!.y).toBeLessThan(spinachBox!.y);
    });

    test.eachFramework('A leaf tree node with facts is also a master row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Two group detail grids are shown on load; Carrot (a collapsed leaf) has none yet.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(2);

        // Carrot is a leaf with facts, so isRowMaster returns true and it has a detail expand control.
        const carrotCell = page
            .locator("[data-testid^='ag-cell'][data-testid$='ag-Grid-AutoColumn']")
            .filter({ hasText: 'Carrot' })
            .first();
        await carrotCell.locator('.ag-group-contracted:visible').click();

        // Expanding Carrot adds its detail grid with the fact 'Orange color'.
        await expect(detailRows).toHaveCount(3);
        await expect(detailRows.filter({ hasText: 'Orange color' })).toHaveCount(1);
    });
});
