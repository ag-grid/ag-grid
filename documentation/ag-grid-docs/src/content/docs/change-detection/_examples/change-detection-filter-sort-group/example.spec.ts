import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups aggregate the summed columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Group A (i=1..4): a=230, b=110, c=230, d=170.
        await expect(agIdFor.autoGroupCell('row-group-group-A')).toContainText('A', { useInnerText: true });
        await expect(agIdFor.cell('row-group-group-A', 'a')).toContainText('230');
        await expect(agIdFor.cell('row-group-group-A', 'b')).toContainText('110');

        // Group B (i=5..10): a=235, b=395, c=235, d=365.
        await expect(agIdFor.cell('row-group-group-B', 'a')).toContainText('235');
        await expect(agIdFor.cell('row-group-group-B', 'b')).toContainText('395');
    });

    test.eachFramework('Expanding shows leaf rows beneath the group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Groups are expanded by default: leaf row 0 (i=1, a=63) is visible.
        await expect(agIdFor.cell('0', 'a')).toContainText('63');
        await agIdFor.autoGroupExpanded('row-group-group-A').click();
        await expect(agIdFor.cell('0', 'a')).not.toBeVisible();
    });

    test.eachFramework('Group rows sort by the aggregated column value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Group B has the larger aggregated a (235 vs 230), so it floats to the top when descending.
        const groupB = agIdFor.rowNode('row-group-group-B');
        await agIdFor.headerCell('a').click(); // ascending
        await waitForRowAnimations(page);
        await expect(groupB).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('a').click(); // descending
        await waitForRowAnimations(page);
        await expect(groupB).toHaveAttribute('row-index', '0');
    });
});
