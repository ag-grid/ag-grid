import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom detail renderer auto-sizes its row as content is toggled', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-expands the master row at index 1. The custom Detail Cell Renderer
        // (not a detail grid) renders inside a full-width row.
        const detail = page.locator('.ag-full-width-row').first();
        await expect(detail).toBeVisible();

        // The custom renderer shows a toggle button.
        const toggle = detail.getByRole('button', { name: 'Show Optional Element' });
        await expect(toggle).toBeVisible();

        // Measure the detail row height before revealing the optional 100px panel.
        const boxBefore = await detail.boundingBox();
        expect(boxBefore).not.toBeNull();

        // Revealing the optional element adds a 100px panel; detailRowAutoHeight regrows the row to fit it.
        await toggle.click();
        await expect(detail.getByRole('button', { name: 'Hide Optional Element' })).toBeVisible();
        await expect(detail).toContainText('Optional element content');

        const boxAfter = await detail.boundingBox();
        expect(boxAfter).not.toBeNull();
        expect(boxAfter!.height).toBeGreaterThan(boxBefore!.height + 80);
    });
});
