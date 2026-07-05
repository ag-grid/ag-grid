import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Closed groups show the total column and hide the medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Athlete is always shown; total (columnGroupShow 'closed') shows while groups are closed.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // Medal columns (columnGroupShow 'open') are hidden while the group is closed.
        await expect(agIdFor.headerCell('gold')).toHaveCount(0);
    });

    test.eachFramework('Save, reset and restore column group open/closed state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Open the Medals group: medal columns appear, the closed-only total column disappears.
        const medalsGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' }).first();
        await medalsGroup.locator('.ag-header-expand-icon-collapsed').first().click();
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.headerCell('total')).toHaveCount(0);

        // Save the open state.
        await page.getByRole('button', { name: 'Save State' }).click();

        // Reset returns groups to their column-definition (closed) state.
        await page.getByRole('button', { name: 'Reset State' }).click();
        await expect(agIdFor.headerCell('gold')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // Restore re-opens the Medals group.
        await page.getByRole('button', { name: 'Restore State' }).click();
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.headerCell('total')).toHaveCount(0);
    });
});
