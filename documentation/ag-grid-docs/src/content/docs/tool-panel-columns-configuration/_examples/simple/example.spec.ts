import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns Tool Panel lists columns and toggles visibility', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // The Columns Tool Panel is shown by default (sideBar: 'columns').
        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        // Grid data is loaded.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The tool panel shows the column groups from the column definitions.
        for (const label of ['Athlete', 'Competition', 'Medals', 'Sport']) {
            await expect(toolPanel.locator('.ag-column-select-column-label', { hasText: label }).first()).toBeVisible();
        }

        // With pivot mode off, unselecting a column toggles its visibility off in the grid.
        const goldHeader = agIdFor.headerCell('gold');
        await expect(goldHeader).toBeVisible();

        const goldCheckbox = toolPanel
            .locator('.ag-column-select-column')
            .filter({ hasText: 'Gold' })
            .locator('.ag-checkbox-input');
        await goldCheckbox.click();

        await expect(goldHeader).toBeHidden();
    });

    test.eachFramework(
        'With pivot mode on, selecting a row-group-enabled column adds it to Row Groups',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // Turn on pivot mode via the Pivot Mode toggle at the top of the tool panel.
            await agIdFor.pivotModeSelect().click();

            // The group / values / pivot sections appear, all initially empty.
            const rowGroups = agIdFor.columnDropArea('toolbar', 'Row Groups');
            const values = agIdFor.columnDropArea('toolbar', 'Values');
            const columnLabels = agIdFor.columnDropArea('toolbar', 'Column Labels');
            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(0);

            // 'Country' has enableRowGroup (and no enableValue), so with pivot mode on selecting it
            // groups by the column rather than toggling its visibility in the grid.
            await agIdFor.columnSelectListItemCheckbox('Country Column').click();
            await waitForRowAnimations(page);

            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(1);
            await expect(rowGroups).toContainText('Country');
            // The selection was consumed by grouping, not by aggregation or pivoting.
            await expect(values.locator('.ag-column-drop-cell')).toHaveCount(0);
            await expect(columnLabels.locator('.ag-column-drop-cell')).toHaveCount(0);

            // The grid is now grouped by country.
            await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
                useInnerText: true,
            });
        }
    );

    test.eachFramework(
        'With pivot mode on, selecting a value-enabled column aggregates it in Values',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            await agIdFor.pivotModeSelect().click();

            // Group by country first so the aggregated value has a group row to render on.
            await agIdFor.columnSelectListItemCheckbox('Country Column').click();
            await waitForRowAnimations(page);

            // 'Gold' has enableValue, so selecting it adds it to the Values section with the
            // default aggregation function for a numeric column ('sum').
            await agIdFor.columnSelectListItemCheckbox('Gold Column').click();
            await waitForRowAnimations(page);

            const values = agIdFor.columnDropArea('toolbar', 'Values');
            await expect(values.locator('.ag-column-drop-cell')).toHaveCount(1);
            await expect(values).toContainText('sum(Gold)');

            // olympic-winners.json: United States gold medals sum to 552.
            await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('552');
        }
    );
});
