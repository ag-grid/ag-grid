import type { Page } from '@playwright/test';
import { dragOverTo, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Opens the chart toolbar popup menu and navigates to the "Set Up" (data) tab,
// making the series pill list visible.
async function openChartDataPanel(page: Page): Promise<void> {
    await page.locator('.ag-chart-menu-toolbar-button').first().click();
    await page.locator('.ag-menu-option-text', { hasText: 'Edit Chart' }).click();
    await page.locator('.ag-tab', { hasText: 'Set Up' }).click();
    await page.locator('.ag-pill-select').first().waitFor({ state: 'visible' });
}

async function getSeriesOrder(page: Page): Promise<string[]> {
    return page.locator('.ag-pill-select .ag-column-drop-cell-text').allTextContents();
}

// Drags the series pill drag handle at `fromIndex` over the pill at `toIndex`.
async function reorderSeriesPill(page: Page, fromIndex: number, toIndex: number): Promise<void> {
    const handles = page.locator('.ag-pill-select .ag-drag-handle');
    const targets = page.locator('.ag-pill-select .ag-column-drop-cell');
    await dragOverTo(handles.nth(fromIndex), targets.nth(toIndex));
}

test.agExample(import.meta, () => {
    test.eachFramework('Example loads', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
    });

    // AG-13924: TC1 — sorting a grid column must not reset the user-defined series order.
    test.vanilla('TC1 - sort preserves series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        const initialOrder = await getSeriesOrder(page);
        expect(initialOrder[0]).toBe('Sugar');
        expect(initialOrder[1]).toBe('Fat');

        // Move 'Fat' (index 1) above 'Sugar' (index 0).
        await reorderSeriesPill(page, 1, 0);
        const orderAfterDrag = await getSeriesOrder(page);
        expect(orderAfterDrag[0]).toBe('Fat');
        expect(orderAfterDrag[1]).toBe('Sugar');

        // Apply a column sort — fires modelUpdated on the grid.
        const remoteApi = remoteGrid(page);
        await remoteApi.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        const orderAfterSort = await getSeriesOrder(page);
        expect(orderAfterSort[0]).toBe('Fat');
        expect(orderAfterSort[1]).toBe('Sugar');
        expect(orderAfterSort[2]).toBe('Weight');
    });

    // AG-13924: TC2 — toggling row group expansion must not reset the user-defined series order.
    test.vanilla('TC2 - row group expansion toggle preserves series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Add a row group so we can expand/collapse rows.
        const remoteApi = remoteGrid(page);
        await remoteApi.applyColumnState({
            state: [{ colId: 'country', rowGroup: true, hide: true }],
        });
        await waitForGridContent(page);

        await openChartDataPanel(page);

        // Move 'Fat' (index 1) above 'Sugar' (index 0).
        await reorderSeriesPill(page, 1, 0);
        const orderAfterDrag = await getSeriesOrder(page);
        expect(orderAfterDrag[0]).toBe('Fat');

        // Collapse all row groups — fires modelUpdated.
        await remoteApi.collapseAll();

        const orderAfterCollapse = await getSeriesOrder(page);
        expect(orderAfterCollapse[0]).toBe('Fat');
        expect(orderAfterCollapse[1]).toBe('Sugar');
        expect(orderAfterCollapse[2]).toBe('Weight');
    });

    // AG-13924: TC3 — filtering a grid column must not reset the user-defined series order.
    test.vanilla('TC3 - filtering preserves series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        // Move 'Fat' (index 1) above 'Sugar' (index 0).
        await reorderSeriesPill(page, 1, 0);
        const orderAfterDrag = await getSeriesOrder(page);
        expect(orderAfterDrag[0]).toBe('Fat');

        // Apply a quick filter — fires modelUpdated on the grid.
        const remoteApi = remoteGrid(page);
        await remoteApi.setGridOption('quickFilterText', 'Ireland');

        const orderAfterFilter = await getSeriesOrder(page);
        expect(orderAfterFilter[0]).toBe('Fat');
        expect(orderAfterFilter[1]).toBe('Sugar');
        expect(orderAfterFilter[2]).toBe('Weight');
    });

    // AG-13924: TC4 — hiding a column must preserve the relative order of the remaining series.
    test.vanilla('TC4 - column hide preserves order of remaining series', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        // Reorder to [Fat, Sugar, Weight].
        await reorderSeriesPill(page, 1, 0);
        const orderAfterDrag = await getSeriesOrder(page);
        expect(orderAfterDrag).toEqual(['Fat', 'Sugar', 'Weight']);

        // Hide 'weight' — fires columnVisible on the grid.
        const remoteApi = remoteGrid(page);
        await remoteApi.applyColumnState({ state: [{ colId: 'weight', hide: true }] });

        // Weight is gone; Fat and Sugar must stay in their user-defined order.
        const orderAfterHide = await getSeriesOrder(page);
        expect(orderAfterHide).toEqual(['Fat', 'Sugar']);
    });

    // AG-13924: TC5 — the customer pattern is to rebuild cellRange.columns from the current
    // visible grid columns (in grid order) before calling restoreChart(), so that removed
    // columns are dropped. The saved relative series order must survive that rebuild.
    //
    // getChartModels() now includes seriesColOrder, which carries the user-defined ordering
    // independently of cellRange.columns. restoreChart() uses it during initialisation to
    // sort valueColState, so the surviving series come out in the saved relative order even
    // when cellRange.columns has been rebuilt in grid column order.
    test.vanilla(
        'TC5 - restore chart preserves relative series order when cellRange is rebuilt from grid columns',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await openChartDataPanel(page);

            // Reorder to [Weight, Sugar, Fat].
            // Grid column order is [Sugar, Fat, Weight], so rebuilding from grid order after
            // removing Sugar would give [Fat, Weight]. The saved user order gives [Weight, Fat].
            // The two differ, which lets this test catch an ordering regression.
            await reorderSeriesPill(page, 2, 0);
            const orderAfterDrag = await getSeriesOrder(page);
            expect(orderAfterDrag).toEqual(['Weight', 'Sugar', 'Fat']);

            // Snapshot the current chart model (includes seriesColOrder = [weight, sugar, fat]).
            const remoteApi = remoteGrid(page);
            const models = await remoteApi.getChartModels();
            const savedModel = models![0];

            // Clear the chart, then hide 'sugar' so only Fat and Weight remain visible.
            await page.getByRole('button', { name: 'Clear chart' }).click();
            await remoteApi.applyColumnState({ state: [{ colId: 'sugar', hide: true }] });

            // Simulate the customer pattern: rebuild cellRange.columns from current visible
            // columns in grid order (Fat before Weight), dropping Sugar.
            const modifiedModel = {
                ...savedModel,
                cellRange: {
                    ...savedModel.cellRange,
                    columns: ['country', 'fat', 'weight'],
                },
            };

            // Restore — seriesColOrder in the model must override the rebuilt column order.
            await remoteApi.restoreChart(modifiedModel as any);

            await openChartDataPanel(page);

            // Weight must appear before Fat (saved user order), not after (grid column order).
            const orderAfterRestore = await getSeriesOrder(page);
            expect(orderAfterRestore).toEqual(['Weight', 'Fat']);
        }
    );
});
