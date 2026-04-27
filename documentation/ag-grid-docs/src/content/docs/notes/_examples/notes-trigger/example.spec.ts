import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a noted cell shows the note popup', async ({ agIdFor, page }) => {
        const notedCell = agIdFor.cell('1', 'athlete');
        await notedCell.click();

        const popup = page.locator('.ag-notes-popup');
        await expect(popup).toBeVisible();
        await expect(popup.locator('.ag-text-area-input')).toHaveValue(
            'Click a noted cell to open this note instead of hovering it.'
        );
    });

    test.eachFramework(
        'Hovering a noted cell does not show the note popup in click mode',
        async ({ agIdFor, page }) => {
            const notedCell = agIdFor.cell('1', 'athlete');
            await notedCell.hover();

            const popup = page.locator('.ag-notes-popup');
            await expect(popup).toHaveCount(0);
        }
    );

    test.eachFramework('Cells with notes still have indicator class in click mode', async ({ agIdFor }) => {
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('3', 'country')).toHaveClass(/ag-has-cell-notes/);
        await expect(agIdFor.cell('2', 'athlete')).not.toHaveClass(/ag-has-cell-notes/);
    });
});
