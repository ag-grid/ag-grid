import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the first filtered data rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is filtered to rows with a country; the first is Natalie Coughlin (United States).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        // Second filtered row is Alicia Coutts (Australia).
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Alicia Coutts');
        await expect(agIdFor.cell('1', 'country')).toContainText('Australia');
    });

    test.eachFramework('Rows can be selected for a selected-only export', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstRow = agIdFor.rowNode('0');
        await expect(firstRow).not.toHaveClass(/ag-row-selected/);

        // Multi-row selection is enabled, so clicking a row's checkbox selects it.
        await firstRow.locator('.ag-selection-checkbox input').click();
        await expect(firstRow).toHaveClass(/ag-row-selected/);

        // Other rows remain unselected.
        await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-selected/);
    });
});
