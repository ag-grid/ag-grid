import type { Locator, Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const seriesPillPanel = (page: Page): Locator => page.locator('.ag-pill-select').first();

// The ordered series pill labels. `toHaveText` with an array retries and enforces order, so it
// replaces the read-then-assert pattern that could only ever see one snapshot of the list.
const seriesPills = (page: Page): Locator => seriesPillPanel(page).locator('.ag-column-drop-cell-text');

async function boundingBoxOf(locator: Locator, what: string) {
    const box = await locator.boundingBox();
    if (!box) {
        throw new Error(`${what} is not laid out, so its geometry cannot be captured`);
    }
    return box;
}

// Opens the chart toolbar popup menu and navigates to the "Set Up" (data) tab,
// making the series pill list visible.
async function openChartDataPanel(page: Page): Promise<void> {
    // The example creates its chart in onFirstDataRendered, after an async getData(), so a ready
    // grid does not imply the chart exists yet. Clicking the toolbar button before it does leaves
    // "Edit Chart" unreachable until the test times out.
    await page.locator('.ag-chart').waitFor({ state: 'visible' });
    await page.locator('.ag-chart-menu-toolbar-button').first().click();
    await page.locator('.ag-menu-option-text', { hasText: 'Edit Chart' }).click();
    await page.locator('.ag-tab', { hasText: 'Set Up' }).click();
    await seriesPillPanel(page).waitFor({ state: 'visible' });
}

// Drags the series pill labelled `label` to the front of the series list.
//
// Every geometry is captured BEFORE mouse.down(), and only raw mouse events are issued between
// down and up. The panel rebuilds its pill list on each insert-index change, so a locator action
// taken mid-drag (a hover(), a boundingBox()) is resolved against a list that has moved underneath
// it — which is what made the previous shared-helper drag a silent no-op.
//
// The drop is aimed a few pixels ABOVE the topmost pill rather than at a pill. Landing inside a
// pill picks an insert index that depends on the current one, and landing on the drag ghost leaves
// the index completely untouched; above every pill is the one branch that is both deterministic
// and idempotent. The Y is clamped inside the panel: leaving the drop container mid-rearrange
// removes the series from the chart.
async function reorderSeriesPillToFront(page: Page, label: string): Promise<void> {
    const panel = seriesPillPanel(page);
    const pills = panel.locator('.ag-column-drop-cell');
    // Substring match, not an anchored one: the pill's text content includes the whitespace of its
    // template, so an exact-match regex never resolves. No series label here is a substring of
    // another, so a substring match is unambiguous.
    const handle = pills.filter({ hasText: label }).locator('.ag-drag-handle');

    const panelBox = await boundingBoxOf(panel, 'the series pill panel');
    const firstPillBox = await boundingBoxOf(pills.first(), 'the first series pill');
    const handleBox = await boundingBoxOf(handle, `the drag handle of series pill "${label}"`);

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const dropX = firstPillBox.x + firstPillBox.width / 2;
    const dropY = Math.max(panelBox.y + 1, firstPillBox.y - 6);

    const { mouse } = page;
    await mouse.move(startX, startY);
    await mouse.down();
    // Clear the 4px drag-start threshold. The pill panel is vertical, so only clientY is read —
    // a horizontal move registers nothing.
    await mouse.move(startX, startY - 12);
    await mouse.move(dropX, dropY);
    // Repeat the final move so the insert index is recomputed once against the rebuilt list,
    // rather than only against the layout that existed when the drag entered the drop zone.
    await mouse.move(dropX, dropY);
    await mouse.up();
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

        await expect(seriesPills(page)).toHaveText(['Sugar', 'Fat', 'Weight']);

        // Move 'Fat' above 'Sugar'.
        await reorderSeriesPillToFront(page, 'Fat');
        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);

        // Apply a column sort — fires modelUpdated on the grid.
        const remoteApi = remoteGrid(page);
        await remoteApi.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);
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

        // Move 'Fat' above 'Sugar'.
        await reorderSeriesPillToFront(page, 'Fat');
        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);

        // Collapse all row groups — fires modelUpdated.
        await remoteApi.collapseAll();

        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);
    });

    // AG-13924: TC3 — filtering a grid column must not reset the user-defined series order.
    test.vanilla('TC3 - filtering preserves series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        // Move 'Fat' above 'Sugar'.
        await reorderSeriesPillToFront(page, 'Fat');
        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);

        // Apply a quick filter — fires modelUpdated on the grid.
        const remoteApi = remoteGrid(page);
        await remoteApi.setGridOption('quickFilterText', 'Ireland');

        await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);
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
            await reorderSeriesPillToFront(page, 'Fat');
            await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);

            // Hide 'weight' — fires columnVisible on the grid.
            const remoteApi = remoteGrid(page);
            await remoteApi.applyColumnState({ state: [{ colId: 'weight', hide: true }] });

            // Weight stays charted (default includeHiddenColumnsInCharts: true) and keeps its
            // user-defined position; Fat and Sugar are unaffected.
            await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);
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
            await reorderSeriesPillToFront(page, 'Fat');
            await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar', 'Weight']);

            // Hide 'weight' — fires columnVisible on the grid.
            await remoteApi.applyColumnState({ state: [{ colId: 'weight', hide: true }] });

            // Weight is gone; Fat and Sugar must stay in their user-defined order.
            await expect(seriesPills(page)).toHaveText(['Fat', 'Sugar']);
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
            await reorderSeriesPillToFront(page, 'Weight');
            await expect(seriesPills(page)).toHaveText(['Weight', 'Sugar', 'Fat']);

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
            await expect(seriesPills(page)).toHaveText(['Weight', 'Sugar', 'Fat']);
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
            await reorderSeriesPillToFront(page, 'Weight');
            await expect(seriesPills(page)).toHaveText(['Weight', 'Sugar', 'Fat']);

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
            await expect(seriesPills(page)).toHaveText(['Weight', 'Fat']);
        }
    );

    // TC6 — moving a grid column must update the series order to follow the new column order
    // (unlike sort/filter/group/hide, which preserve the user-defined order).
    test.vanilla('TC6 - grid column move updates series order', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await openChartDataPanel(page);

        await expect(seriesPills(page)).toHaveText(['Sugar', 'Fat', 'Weight']);

        // Move 'weight' before 'sugar' in the grid (grid order: country, sugar, fat, weight).
        const remoteApi = remoteGrid(page);
        await remoteApi.moveColumns(['weight'], 1);

        await expect(seriesPills(page)).toHaveText(['Weight', 'Sugar', 'Fat']);
    });
});
