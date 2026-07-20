import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // valueCache: true, valueCacheNeverExpires: true. 10 rows, groupDefaultExpanded: 1.
    // colIds: q1..q4, 'Total' -> 'total', 'Total x 10' (anonymous) -> '0'.
    // Leaf row '0' (i=0): total 8112 ('8,112'), x10 81120 ('81,120').

    test.eachFramework('renders the initial total from the value cache', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'total')).toContainText('8,112');
        await expect(agIdFor.cell('0', '0')).toContainText('81,120');
    });

    test.eachFramework('edits leave the total stale until the cache is expired and refreshed', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const q1Cell = agIdFor.cell('0', 'q1');
        await q1Cell.dblclick();
        const editor = q1Cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('1000');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // q1 now shows the new value, but the cache never expires so Total stays stale at 8,112.
        await expect(q1Cell).toContainText('1,000');
        await expect(agIdFor.cell('0', 'total')).toContainText('8,112');

        // Expire the cache, then aggregate + refresh: Total recomputes to 1000 + 1200 = 2200.
        await page.getByRole('button', { name: 'Expire Value Cache' }).click();
        await page.getByRole('button', { name: 'Aggregate Data & Refresh Cells' }).click();

        await expect(agIdFor.cell('0', 'total')).toContainText('2,200');
        await expect(agIdFor.cell('0', '0')).toContainText('22,000');
    });
});
