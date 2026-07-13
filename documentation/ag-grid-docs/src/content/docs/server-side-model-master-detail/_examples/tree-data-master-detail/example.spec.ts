import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tree hierarchy and a master row both expand from the Name column', async ({ page }) => {
        await waitForGridContent(page);

        // Tree nodes are shown in the Name auto-group column.
        const nameRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        await expect(nameRow('Root 1')).toBeVisible();
        await expect(nameRow('Root 3')).toBeVisible();

        // Expand the tree group 'Root 1' to lazy-load its children from the server.
        await nameRow('Root 1').locator('.ag-group-contracted').first().click();
        await expect(nameRow('Child 1.1')).toBeVisible();
        await expect(nameRow('Child 1.2')).toBeVisible();

        // 'Root 3' is a master row (has detail records but no children); expand its detail grid.
        await nameRow('Root 3').locator('.ag-group-contracted').first().click();
        const detail = page.locator('.ag-details-row').filter({ hasText: 'Detail F' }).first();
        await expect(detail).toBeVisible();
        await expect(detail.locator('.ag-root-wrapper')).toBeVisible();
        await expect(detail).toContainText('Value F');

        // detailRowHeight is fixed at 220px.
        const box = await detail.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(200);
        expect(box!.height).toBeLessThan(240);
    });
});
