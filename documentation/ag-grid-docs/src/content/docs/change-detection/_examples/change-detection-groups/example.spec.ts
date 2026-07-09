import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups aggregate the summed columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Group A (i=1..7): a=364, b=308, c=304, d=356.
        await expect(agIdFor.autoGroupCell('row-group-group-A')).toContainText('A', { useInnerText: true });
        await expect(agIdFor.cell('row-group-group-A', 'a')).toContainText('364');
        await expect(agIdFor.cell('row-group-group-A', 'b')).toContainText('308');
        await expect(agIdFor.cell('row-group-group-A', 'c')).toContainText('304');
        await expect(agIdFor.cell('row-group-group-A', 'd')).toContainText('356');

        // Group B (i=8..16): a=404, b=488, c=444, d=416.
        await expect(agIdFor.cell('row-group-group-B', 'a')).toContainText('404');
        await expect(agIdFor.cell('row-group-group-B', 'd')).toContainText('416');
    });

    test.eachFramework('Collapsing a group hides its leaf rows', async ({ agIdFor, page }) => {
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

        // Group B has the larger aggregated a (404 vs 364), so it floats to the top when descending.
        const groupB = agIdFor.rowNode('row-group-group-B');
        await agIdFor.headerCell('a').click(); // ascending
        await waitForRowAnimations(page);
        await expect(groupB).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('a').click(); // descending
        await waitForRowAnimations(page);
        await expect(groupB).toHaveAttribute('row-index', '0');
    });
});
