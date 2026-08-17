import { waitFor } from '@testing-library/dom';

import type { AgColumn, GridApi } from 'ag-grid-community';

import {
    cancelDeferredChanges,
    commitChanges,
    createDeferredNonPivotGrid,
    createDeferredPivotModeGrid,
    createPrimaryColumnComp,
    getApplyButton,
    getPivotModeToggle,
    getUpdateStrategy,
    getValueColumnIds,
    gridMgr,
    rowData,
    setupDeferredPivotModeSuite,
} from './deferredPivotModeHarness';

describe('deferred column tool panel pivot mode - the Apply button and regenerated pivot columns', () => {
    setupDeferredPivotModeSuite();

    test('apply button is disabled when there are no pending changes', async () => {
        const { toolPanelGui } = await createDeferredNonPivotGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when pivot mode is toggled off', async () => {
        const { toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        getPivotModeToggle(toolPanelGui).click();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button becomes enabled when a column is toggled and disabled again when toggled back to original state', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], true, 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after reverting a staged column visibility change via checkbox', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredNonPivotGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Toggle Athlete checkbox off (hide column)
        const athleteComp = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp['onChangeCommon'](false);

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Toggle Athlete checkbox back on (show column — revert to original state)
        const athleteComp2 = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp2['onChangeCommon'](true);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after reverting a staged pivot column change via checkbox', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Toggle Athlete checkbox on (add to row group in pivot mode)
        const athleteComp = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp['onChangeCommon'](true);

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Toggle Athlete checkbox back off (revert)
        const athleteComp2 = createPrimaryColumnComp(toolPanel, 'Athlete');
        athleteComp2['onChangeCommon'](false);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when a row group pill sort direction is changed', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Click the Country pill in the row group drop zone to change sort direction
        const countryPill = Array.from(
            (toolPanel.rowGroupDropZonePanel.getGui() as HTMLElement).querySelectorAll<HTMLElement>(
                '.ag-column-drop-cell'
            )
        ).find((el) => el.textContent?.includes('Country'));
        expect(countryPill).toBeTruthy();
        countryPill!.click();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button is disabled after reverting a staged row group change', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'country', enableRowGroup: true, rowGroup: true },
            { field: 'athlete' },
            { field: 'gold' },
        ]);
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove country from row groups
        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [], 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Add country back to row groups (revert to original state)
        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button stays enabled after removing then re-adding a row group column at a different position', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove country from row groups via the drop zone
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const existingRowGroupCols = rowGroupPanel.getExistingItems();
        const withoutCountry = existingRowGroupCols.filter((c: AgColumn) => c !== country);
        rowGroupPanel['updateItems'](withoutCountry);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Add country back at the end (different position from original)
        const currentRowGroupCols = rowGroupPanel.getExistingItems();
        rowGroupPanel['updateItems']([...currentRowGroupCols, country]);
        toolPanel.refreshDeferredUi();

        // Apply should stay enabled because order changed
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button is disabled after removing then re-adding a row group column at same position via drop zone', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const sport = gridApi.getColumn('sport')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Step 1: Remove sport from row groups via the drop zone (simulates removing pill)
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const originalRowGroupCols = [...rowGroupPanel.getExistingItems()];
        const withoutSport = originalRowGroupCols.filter((c: AgColumn) => c !== sport);
        rowGroupPanel['updateItems'](withoutSport);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Step 2: Drag sport back to row groups at same position (exact revert)
        rowGroupPanel['updateItems'](originalRowGroupCols);
        toolPanel.refreshDeferredUi();

        // Apply should be disabled since we reverted to original state
        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button is disabled after removing row group pill via X and dragging column back from list in pivot mode', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Step 1: Click X on Sport pill in CTP row group drop zone
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const withoutSport = rowGroupPanel.getExistingItems().filter((c: AgColumn) => c !== sport);
        rowGroupPanel['updateItems'](withoutSport);
        rowGroupPanel.refreshGui();
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        // Step 2: Drag Sport from columns list into row groups drop zone
        // handleDragEnterEnd sets column visibility to false (hide column on group)
        rowGroupPanel.setColumnsVisible([sport], false, 'uiColumnDragged');
        // addItem adds Sport back to row groups
        rowGroupPanel.addItem(sport);
        toolPanel.refreshDeferredUi();

        // Deferred state should match live state — no pending changes
        expect(strategy.hasPendingChanges(true)).toBe(false);
        expect(getApplyButton(toolPanelGui).disabled).toBe(true);
    });

    test('apply button becomes enabled when row group columns are rearranged', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Rearrange row group columns: swap country and sport
        const rowGroupPanel = toolPanel.rowGroupDropZonePanel;
        const originalRowGroupCols = [...rowGroupPanel.getExistingItems()];
        const reversed = [...originalRowGroupCols].reverse();
        rowGroupPanel['updateItems'](reversed);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('apply button becomes enabled when a value column aggregation function is changed', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const silver = gridApi.getColumn('silver')! as AgColumn;

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, silver, 'avg', 'toolPanelDragAndDrop');
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });

    test('re-adding a value column in pivot mode without an active pivot regenerates its column after Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enableRowGroup: true, enablePivot: true },
                { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
                { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
            return panel;
        });
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        strategy.setValueColumns(true, [silver], 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId() === 'bronze')).toBe(false);

        strategy.setValueColumns(true, [silver, bronze], 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId() === 'bronze')).toBe(true);
    });

    test('deferred setColumnAggFunc activating a value column in pivot mode regenerates pivot result columns after Apply', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', enableValue: true },
            ],
            rowData: [
                { country: 'UK', year: 2000, gold: 5 },
                { country: 'UK', year: 2004, gold: 3 },
            ],
            pivotMode: true,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
            return panel;
        });
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);

        // gold has no aggFunc → not a value column → its pivot result columns carry no measure.
        expect(getValueColumnIds(gridApi)).toEqual([]);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId().endsWith('_gold'))).toBe(false);

        strategy.setColumnAggFunc(true, gold, 'sum', 'toolPanelUi');
        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
        expect(gridApi.getAllDisplayedColumns().some((col) => col.getColId().endsWith('_gold'))).toBe(true);
    });

    // AG-9664: pivotSort from a deferred panel pill stages until Apply, mirroring the synchronous coverage in
    // sorting/pivot-column-sort.test.ts.
    async function createDeferredPivotSortGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            // Insertion order is deliberately not ascending, so natural (null) order differs from ascending.
            rowData: [
                { country: 'USA', year: 2022, sales: 1 },
                { country: 'USA', year: 2020, sales: 1 },
                { country: 'USA', year: 2021, sales: 1 },
            ],
            pivotMode: true,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
            return panel;
        });
        return { gridApi, toolPanel };
    }

    function getPivotColumnOrder(gridApi: GridApi): string[] {
        return gridApi
            .getAllDisplayedColumns()
            .map((col) => col.getColId())
            .filter((id) => id.startsWith('pivot_'));
    }

    test('pivot sort in deferred pivot mode stages until commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotSortGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];
        const descending = ['pivot_year_2022_sales', 'pivot_year_2021_sales', 'pivot_year_2020_sales'];

        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);

        // Unset default cycles to descending; the change is staged, the grid is untouched.
        strategy.progressPivotSortFromEvent(true, year);
        await waitFor(() => expect(strategy.getPivotSort(true, year)).toBe('desc'));
        expect(year.pivotSort).toBeUndefined();
        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);

        commitChanges(toolPanel);

        await waitFor(() => expect(getPivotColumnOrder(gridApi)).toEqual(descending));
        expect(gridApi.getColumnState().find((s) => s.colId === 'year')!.pivotSort).toBe('desc');
    });

    test('pivot sort staged in deferred pivot mode is discarded on cancel', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotSortGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const strategy = getUpdateStrategy(toolPanel);
        const ascending = ['pivot_year_2020_sales', 'pivot_year_2021_sales', 'pivot_year_2022_sales'];

        strategy.progressPivotSortFromEvent(true, year);
        await waitFor(() => expect(strategy.getPivotSort(true, year)).toBe('desc'));

        cancelDeferredChanges(toolPanel);

        // A real transition back from the staged 'desc', so polling cannot pass vacuously.
        await waitFor(() => expect(strategy.getPivotSort(true, year)).toBeUndefined());
        expect(year.pivotSort).toBeUndefined();
        expect(getPivotColumnOrder(gridApi)).toEqual(ascending);
    });

    test('apply button becomes enabled when a value column is re-added via checkbox in pivot mode after committing its removal', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const strategy = getUpdateStrategy(toolPanel);

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Remove Bronze from Values via its checkbox, then commit the removal
        createPrimaryColumnComp(toolPanel, 'Bronze')['onChangeCommon'](false);
        commitChanges(toolPanel);
        toolPanel.refreshDeferredUi();

        expect(getApplyButton(toolPanelGui).disabled).toBe(true);

        // Re-add Bronze via its checkbox — its colDef aggFunc ('sum') still matches the live column
        createPrimaryColumnComp(toolPanel, 'Bronze')['onChangeCommon'](true);
        toolPanel.refreshDeferredUi();

        expect(strategy.hasPendingChanges(true)).toBe(true);
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);
    });
});
