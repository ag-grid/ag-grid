import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const groupCell = (page: any, name: string) =>
        page.locator('.ag-header-group-cell').filter({ hasText: name }).first();

    test.eachFramework('Group A keeps its expanded state across updates (groupId set)', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country is columnGroupShow='open', hidden while Group A is collapsed.
        await expect(agIdFor.headerCell('country')).toHaveCount(0);

        await groupCell(page, 'Group A').locator('.ag-header-expand-icon-collapsed').first().click();
        await expect(agIdFor.headerCell('country')).toHaveCount(1);

        // Switching to set B (groupId preserved) renames the group header but keeps it expanded.
        await page.getByRole('button', { name: 'Second Column Set' }).click();
        await expect(groupCell(page, 'GROUP A')).toHaveCount(1);
        await expect(agIdFor.headerCell('country')).toHaveCount(1);
    });

    test.eachFramework('Group C child columns are updated by the new set', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // extraA does not exist in the first set.
        await expect(agIdFor.headerCell('extraA')).toHaveCount(0);

        // The second set adds extraA to Group C.
        await page.getByRole('button', { name: 'Second Column Set' }).click();
        await expect(agIdFor.headerCell('extraA')).toHaveCount(1);

        await page.getByRole('button', { name: 'First Column Set' }).click();
        await expect(agIdFor.headerCell('extraA')).toHaveCount(0);
    });
});
