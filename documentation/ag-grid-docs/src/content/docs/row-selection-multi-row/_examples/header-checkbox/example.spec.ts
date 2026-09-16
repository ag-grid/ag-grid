import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

const ROWS_IN_DATA_SET = 31;
const GYMNASTICS_ROWS_IN_DATA_SET = 4;
const PAGE_SIZE = 20; // default page size

test.agExample(import.meta, () => {
    test.eachFramework('the header checkbox selects all rows on the page', async ({ page }) => {
        await ensureGridReady(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await expect(headerWrapper).not.toHaveClass(/ag-checked/);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // selectAll: 'all' (default) selects every row. The header's fully-checked (not
        // indeterminate) state is computed from the entire selection model, so it confirms the
        // whole data set is selected rather than only the rendered/current-page rows.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        await expect(headerWrapper).not.toHaveClass(/ag-indeterminate/);

        // A snapshotted row count races with rows entering the DOM before their selected class lands.
        await expect(page.locator('.ag-grid-scrolling-container .ag-row')).not.toHaveCount(0);
        await expect(page.locator('.ag-grid-scrolling-container .ag-row:not(.ag-row-selected)')).toHaveCount(0);

        await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText(String(ROWS_IN_DATA_SET));
    });

    test.eachFramework('the row count status panels reflect the quick filter', async ({ page }) => {
        await ensureGridReady(page);

        const totalCount = page.locator('.ag-status-panel-total-row-count');
        const filteredCount = page.locator('.ag-status-panel-filtered-row-count');

        await expect(totalCount).toContainText(String(ROWS_IN_DATA_SET));
        // The filtered panel only shows itself once a filter is actually narrowing the rows.
        await expect(filteredCount).toBeHidden();

        await page.locator('#quickFilter').fill('Gymnastics');
        await waitForRowAnimations(page);

        await expect(filteredCount).toContainText(String(GYMNASTICS_ROWS_IN_DATA_SET));
        await expect(totalCount).toContainText(String(ROWS_IN_DATA_SET));
    });

    test.eachFramework('changing the select all mode clears the current selection', async ({ page }) => {
        await ensureGridReady(page);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();
        await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText(String(ROWS_IN_DATA_SET));

        await page.locator('#select-all-mode').selectOption('currentPage');

        await expect(page.locator('.ag-status-panel-selected-row-count')).not.toContainText(String(ROWS_IN_DATA_SET));
        await expect(page.locator('.ag-grid-scrolling-container .ag-row.ag-row-selected')).toHaveCount(0);
        await expect(page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first()).not.toHaveClass(
            /ag-checked/
        );
    });

    test.eachFramework('the quick filter narrows the displayed rows', async ({ page }) => {
        await ensureGridReady(page);

        await page.locator('#quickFilter').fill('Nemov');
        await waitForRowAnimations(page);

        const rows = page.locator('.ag-grid-scrolling-container .ag-row');
        await expect(rows).toHaveCount(1);
        await expect(rows.first()).toContainText('Aleksey Nemov');
    });

    test.eachFramework("selectAll 'filtered' selects only the filtered rows", async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await page.locator('#select-all-mode').selectOption('filtered');
        await page.locator('#quickFilter').fill('Gymnastics');
        await waitForRowAnimations(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await expect(headerWrapper).not.toHaveClass(/ag-checked/);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // With selectAll: 'filtered', clicking the header selects every row matching the filter.
        // The header's fully-checked (not indeterminate) state is computed from the whole filtered
        // selection model, so it confirms all filtered rows are selected without depending on which
        // rows happen to be rendered under virtualisation.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        await expect(headerWrapper).not.toHaveClass(/ag-indeterminate/);

        await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText(
            String(GYMNASTICS_ROWS_IN_DATA_SET)
        );

        // Clear the filter to reveal the previously-hidden rows and prove that ONLY the filtered
        // rows were selected: row 1 (Aleksey Nemov, Gymnastics) matched and is selected, while
        // row 0 (Natalie Coughlin, Swimming) did not match and remains unselected.
        await page.locator('#quickFilter').fill('');
        await waitForRowAnimations(page);
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        "selectAll 'currentPage' selects only the rows on the current page",
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await page.locator('#select-all-mode').selectOption('currentPage');

            await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

            await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText(String(PAGE_SIZE));

            // Page two is what separates 'currentPage' from 'all' and 'filtered'.
            await agIdFor.paginationSummaryPanelButton('next page').click();
            await waitForRowAnimations(page);
            await expect(page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first()).not.toHaveClass(
                /ag-checked/
            );
            await expect(page.locator('.ag-status-panel-selected-row-count')).toContainText(String(PAGE_SIZE));
        }
    );
});
