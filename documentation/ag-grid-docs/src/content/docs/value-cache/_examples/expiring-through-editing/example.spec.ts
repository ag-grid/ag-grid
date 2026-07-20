import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // 10 rows, valueCache: true, editable quarter columns, groupDefaultExpanded: 1.
    // colIds: q1..q4, 'Total' -> 'total', 'Total x 10' (anonymous) -> '0'.
    // Leaf row '0' (i=0): q1=6912, q2=1200, q3=0, q4=0 -> total 8112 ('8,112'), x10 81120 ('81,120').

    test.eachFramework('renders the total and total x 10 leaf values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'total')).toContainText('8,112');
        await expect(agIdFor.cell('0', '0')).toContainText('81,120');
    });

    test.eachFramework('editing a value expires the cache so the total recomputes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const q1Cell = agIdFor.cell('0', 'q1');
        await q1Cell.dblclick();
        const editor = q1Cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('1000');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Editing clears the value cache; total = 1000 + 1200 + 0 + 0 = 2200, x10 = 22000.
        await expect(agIdFor.cell('0', 'total')).toContainText('2,200');
        await expect(agIdFor.cell('0', '0')).toContainText('22,000');
    });

    test.eachFramework(
        'refresh alone keeps the cache; invalidating first re-runs the value getter',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);

            // Refresh Cells alone uses the cache: the value getter is not executed again.
            await page.getByRole('button', { name: 'Refresh Cells' }).click();
            await waitForRowAnimations(page);
            expect(logs.some((l) => l.includes('Total Value Getter'))).toBe(false);

            // Invalidate the cache, then refresh: now the value getter must run again.
            await page.getByRole('button', { name: 'Invalidate Value Cache' }).click();
            await page.getByRole('button', { name: 'Refresh Cells' }).click();
            await expect(() => {
                expect(logs.some((l) => l.includes('Total Value Getter'))).toBe(true);
            }).toPass();
            page.off('console', handler);
        }
    );
});
