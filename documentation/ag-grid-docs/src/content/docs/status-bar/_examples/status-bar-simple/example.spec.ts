import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('shows the total row count once the data has loaded', async ({ page }) => {
        await ensureGridReady(page);

        // The Olympic winners dataset has 8,618 rows; both the "Rows" and "Total Rows"
        // panels report the full count (formatted with a thousands separator).
        await expect(page.locator('.ag-status-panel-total-row-count')).toContainText('8,618');
        await expect(page.locator('.ag-status-panel-total-and-filtered-row-count')).toContainText('8,618');
    });

    test.eachFramework('selecting rows updates the selected row count panel', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // The selected-row-count panel only appears once a row is selected.
        await agIdFor.selectionColumnCheckbox('0').click();
        await agIdFor.selectionColumnCheckbox('1').click();

        await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText('2');
    });

    test.eachFramework('selecting a cell range shows the aggregation panel', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Select a three-cell range in the numeric "gold" column: values 8, 6, 4.
        await agIdFor.cell('0', 'gold').click();
        await agIdFor.cell('2', 'gold').click({ modifiers: ['Shift'] });

        const aggregations = page.locator('.ag-status-panel-aggregations');
        await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Count' })).toContainText('3');
        await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Sum' })).toContainText('18');
        await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Average' })).toContainText('6');
        await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Min' })).toContainText('4');
        await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Max' })).toContainText('8');
    });

    // The age column sets filter: 'agNumberColumnFilter' explicitly, so every framework variant
    // resolves the same filter component. (Relying on defaultColDef's `filter: true` for a string
    // column diverges on the vanilla variant, which renders a different filter type.)
    const applyAgeFilter = async (agIdFor: any, page: any) => {
        await agIdFor.headerFilterButton('age').click();
        const filterInput = agIdFor.numberFilterInstanceInput({ source: 'column-filter' }).first();
        await expect(filterInput).toBeVisible();
        await filterInput.fill('23');
        await filterInput.press('Enter');
        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);
    };

    test.eachFramework('filtering updates the filtered row count but not the total', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // olympic-winners.json holds 691 rows with age 23, out of 8,618.
        await applyAgeFilter(agIdFor, page);

        // agFilteredRowCountComponent reports only the rows passing the filter...
        await expect(page.locator('.ag-status-panel-filtered-row-count')).toContainText('691');

        // ...while agTotalRowCountComponent stays at the full row count.
        await expect(page.locator('.ag-status-panel-total-row-count')).toContainText('8,618');
    });

    test.eachFramework('total and filtered panel shows both counts when filtered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Unfiltered the two counts are equal, so the panel collapses to a single number.
        await expect(page.locator('.ag-status-panel-total-and-filtered-row-count')).toContainText('8,618');

        await applyAgeFilter(agIdFor, page);

        // Once they differ, agTotalAndFilteredRowCountComponent shows "filtered of total".
        await expect(page.locator('.ag-status-panel-total-and-filtered-row-count')).toContainText('691 of 8,618');
    });
});
