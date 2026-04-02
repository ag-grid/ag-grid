import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pre-seeded notes have indicators', async ({ agIdFor }) => {
        // Row 1 athlete and Row 3 country have pre-seeded notes with metadata
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('3', 'country')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('2', 'athlete')).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Hovering noted cell shows metadata in popup', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        // Should show author and timestamp metadata
        const meta = popup.locator('.ag-notes-popup-meta');
        await expect(meta).toContainText('AG Grid');
        await expect(meta).toContainText('29 Mar 2026');
    });

    test.eachFramework('Authenticated user input is present', async ({ page }) => {
        const userInput = page.locator('#current-user');
        await expect(userInput).toHaveValue('AG Grid');
    });

    test.eachFramework('Grid renders correct data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'country')).toContainText('United States');
    });
});
