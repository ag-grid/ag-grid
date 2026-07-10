import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Fast and deferred renderers render leaf values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by athlete, first group expanded (groupDefaultExpanded: 1)
        await expect(agIdFor.autoGroupCell('row-group-athlete-Michael Phelps')).toContainText('Michael Phelps', {
            useInnerText: true,
        });

        // Leaf row 0 = Michael Phelps, gold 8. Fast renderer renders immediately.
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        // Deferred slow renderer eventually renders the leaf country value
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 10000 });
    });

    test.eachFramework('Collapsing the group hides its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        // wait for the deferred slow renderer to settle before interacting, so collapse runs on a stable grid
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 10000 });

        await agIdFor.autoGroupExpanded('row-group-athlete-Michael Phelps').click();
        await expect(agIdFor.cell('0', 'gold')).not.toBeVisible();
    });
});
