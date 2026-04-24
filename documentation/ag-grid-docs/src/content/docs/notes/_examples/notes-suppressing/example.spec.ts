import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cells with notes have indicators regardless of suppression', async ({ agIdFor }) => {
        // Row 1 athlete: normal column, has note
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        // Row 2 year: suppressed column, has note — indicator should still show
        await expect(agIdFor.cell('2', 'year')).toHaveClass(/ag-has-cell-notes/);
        // Row 5 sport: suppressed column, has note — indicator should still show
        await expect(agIdFor.cell('5', 'sport')).toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Cells without notes on suppressed columns have no indicator', async ({ agIdFor }) => {
        // Row 1 year: suppressed column, no note
        await expect(agIdFor.cell('1', 'year')).not.toHaveClass(/ag-has-cell-notes/);
        // Row 1 sport: suppressed column, no note
        await expect(agIdFor.cell('1', 'sport')).not.toHaveClass(/ag-has-cell-notes/);
    });

    test.eachFramework('Hovering a suppressed cell with a note still shows popup', async ({ agIdFor, page }) => {
        // Row 2 year has a note on a suppressed column — hover should open view-only popup
        await agIdFor.cell('2', 'year').hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        const textarea = popup.locator('.ag-text-area-input');
        await expect(textarea).toHaveValue('Year suppresses note actions, but existing notes still open on hover.');
    });

    test.eachFramework('Hovering a non-suppressed cell with a note shows popup', async ({ agIdFor, page }) => {
        await agIdFor.cell('1', 'athlete').hover();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();

        const textarea = popup.locator('.ag-text-area-input');
        await expect(textarea).toHaveValue('This cell still allows the full built-in note workflow.');
    });

    test.eachFramework('Grid renders correct data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'year')).toContainText('2008');
        await expect(agIdFor.cell('5', 'sport')).toContainText('Athletics');
    });
});
