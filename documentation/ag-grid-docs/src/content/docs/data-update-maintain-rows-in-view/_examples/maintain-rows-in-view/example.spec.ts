import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Keeps the rows in view when rows are added or removed at the top', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const viewport = page.locator('.ag-grid-viewport');
        const row = page.locator('.ag-row[row-id="30"]').first();
        const offsetInView = async () => (await row.boundingBox())!.y - (await viewport.boundingBox())!.y;

        await viewport.evaluate((el) => (el.scrollTop = 1000));
        await expect(row).toBeVisible();
        const offset = await offsetInView();

        await page.getByRole('button', { name: 'Add 5 Rows at the Top' }).click();
        await expect.poll(offsetInView).toBe(offset);

        await page.getByRole('button', { name: 'Remove 5 Rows at the Top' }).click();
        await expect.poll(offsetInView).toBe(offset);

        await page.getByLabel('Maintain Rows in View').uncheck();
        await page.getByRole('button', { name: 'Add 5 Rows at the Top' }).click();
        await expect.poll(offsetInView).toBeGreaterThan(offset);
    });

    test.eachFramework('Shows rows added at the top while scrolled to the top', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Add 5 Rows at the Top' }).click();

        await expect(page.locator('.ag-row[row-index="0"]').first()).toHaveAttribute('row-id', '100');
    });
});
