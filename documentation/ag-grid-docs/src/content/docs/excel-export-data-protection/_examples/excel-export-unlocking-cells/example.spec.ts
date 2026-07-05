import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders data under the grouped headers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell-label', { hasText: 'Editable (Unlocked)' })).toBeVisible();
        await expect(page.locator('.ag-header-group-cell-label', { hasText: 'Read Only (Locked)' })).toBeVisible();

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
    });

    test.eachFramework('Unlocked athlete cell is editable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        await athleteCell.dblclick();

        const input = athleteCell.locator('input');
        await input.fill('Jane Doe');
        await input.press('Enter');

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Jane Doe');
    });
});
