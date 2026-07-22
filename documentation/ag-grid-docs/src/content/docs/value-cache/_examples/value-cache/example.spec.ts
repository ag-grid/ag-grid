import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

// Grouped by year (2015/2016), groupDefaultExpanded: 1. The 'Total' column valueGetter sums
// q1..q4 and logs a 'Total Value Getter' message on every call. Leaf row id '0' (i=0):
// q1=6912, q2=1200, q3=0, q4=0 -> total 8112 -> displayed '8,112'.

test.agExample(import.meta, () => {
    test.eachFramework(
        'value getter computes the leaf and re-runs on expand when the cache is off',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await expect(agIdFor.cell('0', 'total')).toContainText('8,112');

            // With the value cache OFF (default), collapsing then re-expanding a group forces the DOM
            // to be recreated, so the value getter is executed again.
            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);

            await agIdFor.autoGroupExpanded('row-group-year-2015').click();
            await waitForRowAnimations(page);
            await agIdFor.autoGroupContracted('row-group-year-2015').click();

            await expect(() => {
                expect(logs.some((l) => l.includes('Total Value Getter'))).toBe(true);
            }).toPass();
            page.off('console', handler);
        }
    );

    test.eachFramework(
        'turning the cache on keeps values correct and stops re-execution on expand',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Turn the value cache ON (first radio); the grid is recreated with the cache enabled.
            await page.locator('#valueCacheOn').click();

            // Values are still correct when served from the cache.
            await expect(agIdFor.cell('0', 'total')).toContainText('8,112');
            await waitForRowAnimations(page);

            // Start listening only after initialisation has settled, then collapse/expand a group.
            const logs: string[] = [];
            const handler = (msg: { text: () => string }) => logs.push(msg.text());
            page.on('console', handler);

            await agIdFor.autoGroupExpanded('row-group-year-2015').click();
            await waitForRowAnimations(page);
            await agIdFor.autoGroupContracted('row-group-year-2015').click();
            await waitForRowAnimations(page);

            // With the cache ON, expand/collapse does not re-execute the value getter.
            expect(logs.some((l) => l.includes('Total Value Getter'))).toBe(false);
            page.off('console', handler);
        }
    );
});
