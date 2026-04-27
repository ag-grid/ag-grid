import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cells with notes have indicators', async ({ agIdFor }) => {
        // Row 1 athlete: editable note
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        // Row 3 country: read-only note
        await expect(agIdFor.cell('3', 'country')).toHaveClass(/ag-has-cell-notes/);
        // Row 5 sport: read-only note
        await expect(agIdFor.cell('5', 'sport')).toHaveClass(/ag-has-cell-notes/);
        // Row 2 athlete: no note
        await expect(agIdFor.cell('2', 'athlete')).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Read-only note popup has read-only styling', async ({ agIdFor, page }) => {
        // Hover over a read-only note (row 3 country)
        await agIdFor.cell('3', 'country').hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup).toHaveClass(/ag-notes-popup-read-only/);

        // The textarea should be read-only
        const textarea = popup.locator('.ag-text-area-input');
        await expect(textarea).toHaveAttribute('readonly', '');
    });

    test.eachFramework('Editable note popup does not have read-only styling', async ({ agIdFor, page }) => {
        // Hover over an editable note (row 1 athlete)
        await agIdFor.cell('1', 'athlete').hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup).not.toHaveClass(/ag-notes-popup-read-only/);
    });

    test.eachFramework('Grid renders correct data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('3', 'country')).toContainText('United States');
        await expect(agIdFor.cell('5', 'sport')).toContainText('Athletics');
    });
});
