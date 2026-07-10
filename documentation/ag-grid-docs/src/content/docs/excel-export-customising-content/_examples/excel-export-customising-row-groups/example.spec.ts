import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Row groups aggregate the gold total', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States: 8 athletes, gold sum 16 (from small-olympic-winners.json).
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States (8)', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('16');

        // Grand total row aggregates all golds: 54.
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'gold').first()).toContainText('54');
    });

    test.eachFramework('Expanding a group reveals its leaves', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Leaf rows are hidden until the group is expanded.
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
    });

    test.eachFramework('Group rows sort by the aggregated gold value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States has the unique maximum gold sum (16).
        const usGroup = agIdFor.rowNode('row-group-country-United States');
        await agIdFor.headerCell('gold').click();
        await waitForRowAnimations(page);
        await expect(usGroup).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('gold').click();
        await waitForRowAnimations(page);
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });
});
