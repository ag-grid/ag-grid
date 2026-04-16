import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cells with notes have indicator class', async ({ agIdFor }) => {
        // Row 1 athlete and Row 3 country have pre-seeded notes
        const notedCell1 = agIdFor.cell('1', 'athlete');
        const notedCell2 = agIdFor.cell('3', 'country');
        const emptyCell = agIdFor.cell('2', 'athlete');

        await expect(notedCell1).toHaveClass(/ag-has-cell-notes/);
        await expect(notedCell2).toHaveClass(/ag-has-cell-notes/);
        await expect(emptyCell).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Hovering a noted cell shows the note popup', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.hover();

        // Wait for the note popup to appear
        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        // Verify the note text is displayed
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'Confirm the athlete biography before the next review.'
        );
    });

    test.eachFramework('Grid renders correct data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Usain Bolt');
        await expect(agIdFor.cell('3', 'country')).toContainText('United States');
    });
});
