import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, waitForNoLoadingRows } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';
import type { AgColumn } from 'ag-grid-community';

import {
    baseColumnDefs,
    cancelDeferredChanges,
    commitChanges,
    createDeferredNonPivotGrid,
    createDeferredPivotModeGrid,
    createPrimaryColumnComp,
    createRowGroupingOnlyGrid,
    createSortEvent,
    getApplyButton,
    getCancelButton,
    getDisplayedPrimaryColumnOrder,
    getDropZoneText,
    getPivotModeToggle,
    getSelectAllCheckbox,
    getUpdateStrategy,
    gridMgr,
    removeDropZonePill,
    rowData,
    setupDeferredPivotModeSuite,
} from './deferredPivotModeHarness';

describe('deferred column tool panel pivot mode - select all, sorting, and toggling pivot mode', () => {
    setupDeferredPivotModeSuite();

    test('select all after staging pivot mode off applies visibility changes, not pivot-mode selection changes', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getPivotModeToggle(toolPanelGui).click();
        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all and deselect all apply only after clicking Apply in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();
        const allColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'];

        getSelectAllCheckbox(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getApplyButton(toolPanelGui).click();

        expect(allColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);

        getSelectAllCheckbox(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();

        expect(allColumns.some((colId) => !gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('select all can be cancelled in non-pivot mode', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        getSelectAllCheckbox(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();

        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('silver')!.isVisible()).toBe(false);
        expect(gridApi.getColumn('bronze')!.isVisible()).toBe(false);
    });

    test('sorting a header row-group pill still works without the columns tool panel module', async () => {
        const gridApi = await createRowGroupingOnlyGrid();
        const gridEl = getGridElement(gridApi)!;
        // `rowGroupPanelShow: 'always'` renders the header row-group drop zone live.
        const rowGroupPill = gridEl.querySelector(
            '.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell'
        ) as HTMLElement | null;

        expect(rowGroupPill).toBeTruthy();

        rowGroupPill!.click();

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('sorting a row-group pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());

        expect(country.getSort()).toBeNull();

        commitChanges(toolPanel);

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).progressSortFromEvent(true, country, createSortEvent());

        expect(country.getSort()).toBeNull();

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('starting a drag for a just-removed row-group column should snapshot the unchecked deferred state', async () => {
        const { toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        removeDropZonePill(toolPanelGui, 'Sport');

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['country'])
        );
        expect(createPrimaryColumnComp(toolPanel, 'Sport').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Sport');

        const sportColumnComp = createPrimaryColumnComp(toolPanel, 'Sport');
        const dragItem = sportColumnComp['createDragItem']();

        expect(dragItem.pivotState.sport?.rowGroup).toBe(false);
    });

    test('getState().pivot through a deferred pivot-mode toggle off then back on', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.isPivotMode()).toBe(false);
        // Pivot off ⇒ no pivot state persisted; the pivot cols are remembered internally for re-enable.
        expect(gridApi.getState().pivot).toBeUndefined();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });
        expect(gridApi.getPivotColumns().map((c) => c.getColId())).toEqual(['year']);
    });

    test('toggling pivot mode off preserves existing row-group, value, sort and visibility state', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();
        gridApi.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        // The removed setState round-trip used to re-apply all of this from the cache; confirm it survives
        // the pivot toggle on its own.
        expect(gridApi.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
        expect(gridApi.getValueColumns().map((c) => c.getColId())).toEqual(['silver', 'bronze']);
        expect(gridApi.getColumn('athlete')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
        expect(gridApi.getValueColumns().map((c) => c.getColId())).toEqual(['silver', 'bronze']);
        expect(gridApi.getColumn('athlete')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('gold')!.isVisible()).toBe(false);
    });

    test('turning pivot mode back on after disabling and applying restores the previous pivot columns', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getPivotColumns()).toEqual([]);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('column labels section shows previous pivot columns after toggling pivot mode off, applying, then back on', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        // Initially Year is a pivot column
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);

        // Toggle pivot off and apply
        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);

        // Toggle pivot back on (before Apply)
        getPivotModeToggle(toolPanelGui).click();

        // Deferred state should show Year in pivot columns
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);
    });

    test('turning pivot mode off and applying should remove year header group text and update the grid option', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(gridApi.getGridOption('pivotMode')).toBe(true);

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getGridOption('pivotMode')).toBe(false);

        const gridEl = getGridElement(gridApi)!;
        const hasYearHeaderGroupText = Array.from(gridEl.querySelectorAll('.ag-header-group-text')).some(
            (el) => el.textContent?.trim() === '2000'
        );
        expect(hasYearHeaderGroupText).toBe(false);
    });

    test('tool panel shows primary columns after disabling pivot mode with user-supplied pivot result columns', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            sideBar: {
                toolPanels: ['columns'],
                defaultToolPanel: 'columns',
            },
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: rowData.slice(0, 1), rowCount: 1 });
                },
            },
        });
        await new GridColumns(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── silver "Silver" width:200 aggFunc:sum !visible
            └── bronze "Bronze" width:200 aggFunc:sum !visible
        `);
        await new GridRows(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p setup`
        ).check(`
            ROOT id:<no-id>
            └── GROUP collapsed id:0 ag-Grid-AutoColumn:"United States" athlete:"Michael Phelps" age:23 country:"United States" year:2008 date:"24/08/2008" sport:"Swimming" gold:8 silver:0 bronze:0 total:8
        `);

        await waitForNoLoadingRows(gridApi);
        gridApi.setPivotResultColumns([
            {
                headerName: '2000',
                children: [{ colId: '2000_gold', field: '2000_gold', headerName: 'Gold' }],
            },
        ]);
        expect(gridApi.getPivotResultColumns()?.map((col) => col.getColId())).toEqual(['2000_gold']);

        gridApi.setGridOption('pivotMode', false);
        await new GridColumns(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p after setGridOption pivotMode`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── athlete "Athlete" width:200
            ├── age "Age" width:200
            ├── country "Country" width:200 rowGroup rowGroupIndex:1
            ├── year "Year" width:200 pivot pivotIndex:1
            ├── date "Date" width:200
            ├── sport "Sport" width:200 rowGroup rowGroupIndex:2
            └── total "Total" width:200
        `);
        await new GridRows(
            gridApi,
            `tool panel shows primary columns after disabling pivot mode with user-supplied p after setGridOption pivotMode`
        ).check(`
            ROOT id:<no-id>
            └── filler collapsed id:rowIndex:0
        `);
        await waitForNoLoadingRows(gridApi);

        gridApi.closeToolPanel();
        gridApi.openToolPanel('columns');

        await waitFor(() => {
            const toolPanel = gridApi.getToolPanelInstance('columns') as any;
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual([
                'athlete',
                'age',
                'country',
                'year',
                'date',
                'sport',
                'gold',
                'silver',
                'bronze',
                'total',
            ]);
        });
    });

    test('turning pivot mode off and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('turning pivot mode off then on and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getPivotModeToggle(toolPanelGui).click();
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });

    test('turning pivot mode off, applying, then cancelling should keep the primary list populated', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);
        await waitFor(() => {
            expect(gridApi.isPivotMode()).toBe(false);
            expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
        });

        getCancelButton(toolPanelGui).click();

        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });
});
