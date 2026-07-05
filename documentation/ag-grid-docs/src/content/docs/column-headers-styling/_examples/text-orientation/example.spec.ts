import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Header heights match the configured grid options', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // headerHeight: 150 applies to the label (column) header cells.
        const goldHeader = await agIdFor.headerCell('gold').boundingBox();
        expect(Math.round(goldHeader!.height)).toBe(150);

        // groupHeaderHeight: 75 applies to the group header cell.
        const groupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        const groupBox = await groupHeader.boundingBox();
        expect(Math.round(groupBox!.height)).toBe(75);
    });

    test.eachFramework('Expanding a group reveals its child rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by athlete; Michael Phelps is the first record in the source data.
        const phelps = 'row-group-athlete-Michael Phelps';
        await expect(agIdFor.autoGroupCell(phelps)).toContainText('Michael Phelps', { useInnerText: true });

        // Leaf rows are hidden while the group is collapsed.
        await expect(agIdFor.cell('0', 'gold')).not.toBeVisible();
        await agIdFor.autoGroupContracted(phelps).click();
        // Michael Phelps' first record (row 0) has 8 gold medals.
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });
});
