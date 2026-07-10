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

    // AG-13924 / AG-17690: TC4 — hiding a column must preserve the relative order of the other
    // series. By default (includeHiddenColumnsInCharts: true), a hidden column stays charted, so
    // it must stay in its user-defined position rather than being dropped or moved to the end.
    test.vanilla(
        'TC4 - column hide keeps series charted in its user-defined position',
        async ({ page, remoteGrid }) => {
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

            // Weight stays charted (default includeHiddenColumnsInCharts: true) and keeps its
            // user-defined position; Fat and Sugar are unaffected.
            const orderAfterHide = await getSeriesOrder(page);
            expect(orderAfterHide).toEqual(['Fat', 'Sugar', 'Weight']);
        }
    );

    // AG-17690: TC4b — with includeHiddenColumnsInCharts explicitly disabled, hiding a column must
    // remove it from the chart, and the remaining series must keep their relative order (the
    // behaviour TC4 covered before hidden columns were included in charts by default).
    test.vanilla(
        'TC4b - column hide removes series when includeHiddenColumnsInCharts is false',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const remoteApi = remoteGrid(page);
            await remoteApi.setGridOption('includeHiddenColumnsInCharts', false);

            await openChartDataPanel(page);

            // Reorder to [Fat, Sugar, Weight].
            await reorderSeriesPill(page, 1, 0);
            const orderAfterDrag = await getSeriesOrder(page);
            expect(orderAfterDrag).toEqual(['Fat', 'Sugar', 'Weight']);

            // Hide 'weight' — fires columnVisible on the grid.
            await remoteApi.applyColumnState({ state: [{ colId: 'weight', hide: true }] });

            // Weight is gone; Fat and Sugar must stay in their user-defined order.
            const orderAfterHide = await getSeriesOrder(page);
            expect(orderAfterHide).toEqual(['Fat', 'Sugar']);
        }
    );

    // AG-13924 / AG-17690: TC5 — restoring a saved chart model after hiding a column must preserve
    // the relative series order of all saved columns. By default (includeHiddenColumnsInCharts:
    // true) a hidden column is still charted after restore, so it must remain in the restored
    // series list rather than being dropped.
    test.vanilla(
        'TC5 - restore chart keeps a hidden column charted in its saved order',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await openChartDataPanel(page);

            // Reorder to [Weight, Sugar, Fat] — Weight moved before Sugar and Fat.
            // Grid column order is [Sugar, Fat, Weight], so the grid order would give
            // [Fat, Sugar, Weight], but the saved user order should give [Weight, Sugar, Fat].
            // The two differ, which lets this test catch an ordering regression.
            await reorderSeriesPill(page, 2, 0);
            const orderAfterDrag = await getSeriesOrder(page);
            expect(orderAfterDrag).toEqual(['Weight', 'Sugar', 'Fat']);

            // Save the chart via the example's Save button, then clear it.
            await page.getByRole('button', { name: 'Save chart' }).click();
            await page.getByRole('button', { name: 'Clear chart' }).click();

            // Hide 'sugar'. With the default includeHiddenColumnsInCharts: true, it stays charted.
            const remoteApi = remoteGrid(page);
            await remoteApi.applyColumnState({ state: [{ colId: 'sugar', hide: true }] });

            // Restore from the saved model (which had weight before sugar before fat).
            await page.getByRole('button', { name: 'Restore chart' }).click();

            await openChartDataPanel(page);

            // Sugar is hidden but still charted (default) — it must remain in the panel, and all
            // three columns must retain their saved relative order [Weight, Sugar, Fat], not the
            // grid column order [Sugar, Fat, Weight] that would result if restore ignored the
            // saved series ordering.
            const orderAfterRestore = await getSeriesOrder(page);
            expect(orderAfterRestore).toEqual(['Weight', 'Sugar', 'Fat']);
        }
    );

    // AG-17690: TC5b — with includeHiddenColumnsInCharts explicitly disabled, restoring a saved
    // chart model must drop columns that are hidden at restore time, while the surviving columns
    // keep their saved relative order (the behaviour TC5 covered before hidden columns were
    // included in charts by default).
    test.vanilla(
        'TC5b - restore chart drops a hidden column when includeHiddenColumnsInCharts is false',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const remoteApi = remoteGrid(page);
            await remoteApi.setGridOption('includeHiddenColumnsInCharts', false);

            await openChartDataPanel(page);

            // Reorder to [Weight, Sugar, Fat] — Weight moved before Sugar and Fat.
            // Grid column order is [Sugar, Fat, Weight], so after removing Sugar the grid
            // order would give [Fat, Weight], but the saved user order should give [Weight, Fat].
            // The two differ, which lets this test catch an ordering regression.
            await reorderSeriesPill(page, 2, 0);
            const orderAfterDrag = await getSeriesOrder(page);
            expect(orderAfterDrag).toEqual(['Weight', 'Sugar', 'Fat']);

            // Save the chart via the example's Save button, then clear it.
            await page.getByRole('button', { name: 'Save chart' }).click();
            await page.getByRole('button', { name: 'Clear chart' }).click();

            // Hide 'sugar' so only Weight and Fat remain visible.
            await remoteApi.applyColumnState({ state: [{ colId: 'sugar', hide: true }] });

            // Restore from the saved model (which had weight before fat).
            await page.getByRole('button', { name: 'Restore chart' }).click();

            await openChartDataPanel(page);

            // Sugar is hidden — it must not appear as selected. Weight and Fat must retain
            // their user-defined relative order [Weight, Fat], not the grid column order
            // [Fat, Weight] that would result if restore ignored the saved series ordering.
            const orderAfterRestore = await getSeriesOrder(page);
            expect(orderAfterRestore).toEqual(['Weight', 'Fat']);
        }
    );

    // TC6 — moving a grid column must update the series order to follow the new column order
    // (unlike sort/filter/group/hide, which preserve the user-defined order).
    test.vanilla('TC6 - grid column move updates series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        const initialOrder = await getSeriesOrder(page);
        expect(initialOrder).toEqual(['Sugar', 'Fat', 'Weight']);

        // Move 'weight' before 'sugar' in the grid (grid order: country, sugar, fat, weight).
        const remoteApi = remoteGrid(page);
        await remoteApi.moveColumns(['weight'], 1);

        const orderAfterMove = await getSeriesOrder(page);
        expect(orderAfterMove).toEqual(['Weight', 'Sugar', 'Fat']);
    });
});
