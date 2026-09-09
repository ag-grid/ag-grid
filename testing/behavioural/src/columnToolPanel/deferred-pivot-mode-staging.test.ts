import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';

import { DragSourceType, getGridElement } from 'ag-grid-community';
import type { AgColumn } from 'ag-grid-community';

import {
    addPrimaryColumnBackToRowGroups,
    cancelDeferredChanges,
    commitChanges,
    createDeferredNonPivotAggregationGrid,
    createDeferredNonPivotGrid,
    createDeferredPivotAggregationGrid,
    createDeferredPivotModeGrid,
    createNonDeferredPivotModeGrid,
    createPrimaryColumnComp,
    dragRenderedPrimaryColumnToRowGroups,
    getApplyButton,
    getCancelButton,
    getDropZoneText,
    getPivotModeToggle,
    getUpdateStrategy,
    getValueColumnIds,
    gridMgr,
    rowData,
    setupDeferredPivotModeSuite,
} from './deferredPivotModeHarness';

describe('deferred column tool panel pivot mode - staging changes and committing them', () => {
    setupDeferredPivotModeSuite();

    test('adding aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding an unchecked column to row groups in deferred pivot mode stages both state and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await addPrimaryColumnBackToRowGroups(toolPanel, gridApi, 'athlete');

        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
                .sort()
        ).toEqual(['athlete', 'country', 'sport']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getCancelButton(toolPanelGui).click();

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['country', 'sport'])
        );
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('adding row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport', 'date']);
    });

    test('aggregation value changes and cancelling in non-pivot mode should keep values unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing agg function on an existing value pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing column visibility and cancelling in non-pivot mode should keep visibility unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(country.isVisible()).toBe(true);
    });

    test('changing column visibility in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(country.isVisible()).toBe(true);

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');

        expect(country.isVisible()).toBe(true);

        commitChanges(toolPanel);

        expect(country.isVisible()).toBe(false);
    });

    test('checking a pivot-only column in deferred pivot mode draws a staged label pill immediately', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enableRowGroup: true, rowGroup: true },
                { field: 'year', enablePivot: true, pivot: true },
                { field: 'date', enablePivot: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
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
        await new GridColumns(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── pivot_year_2000_gold "Gold" width:200 columnGroupShow:open
            ├─┬ "2004" GROUP
            │ └── pivot_year_2004_gold "Gold" width:200 columnGroupShow:open
            └─┬ "2008" GROUP
              └── pivot_year_2008_gold "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
        // The panel is ready once it has drawn the pill for the configured pivot column.
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(getDropZoneText(panel.pivotDropZonePanel)).toContain('Year');
            expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
            return panel;
        });
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');

        createPrimaryColumnComp(toolPanel, 'Date')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getPivotColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['year', 'date'])
        );
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).toContain('Date');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
    });

    test('checking a row-group column in deferred pivot mode draws a staged row-group pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        createPrimaryColumnComp(toolPanel, 'Athlete')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
                    .sort()
            ).toEqual(['athlete', 'country', 'sport'])
        );
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('checking a value column in deferred pivot mode draws a staged value pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');

        createPrimaryColumnComp(toolPanel, 'Age')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getValueColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['silver', 'bronze', 'age'])
        );
        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).toContain('Age');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');
    });

    test('column label changes and cancelling in pivot mode should keep labels unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setPivotColumns(true, [year, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [date, year], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('commit should call exactly one state-application path', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Observe the public batch signal: a single batched state application fires exactly one
        // `columnEverythingChanged`. A redundant grid-state round-trip would fire it twice; a piecemeal
        // path (per-column moveColumns / setColumns / setColumnAggFunc, which emit only granular events)
        // would fire it zero times. Both regressions are caught by asserting exactly one.
        let everythingChangedCount = 0;
        gridApi.addEventListener('columnEverythingChanged', () => {
            everythingChangedCount++;
        });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);

        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any second (redundant) columnEverythingChanged to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        // Turning pivot off applies state in a single batch — exactly one `columnEverythingChanged`.
        expect(everythingChangedCount).toBe(1);
        expect(gridApi.isPivotMode()).toBe(false);
    });

    test('toggling pivot mode in deferred mode persists pivot state to grid state and restores pivot columns', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getState().pivot?.pivotMode ?? false).toBe(false);

        getUpdateStrategy(toolPanel).setPivotMode(true, true, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });
    });

    test('commit should make exactly one server call', async () => {
        const { gridApi, toolPanelGui, serverGetDataSpy } = await createDeferredPivotModeGrid();
        const initialCallCount = serverGetDataSpy.mock.calls.length;

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(serverGetDataSpy.mock.calls.length - initialCallCount).toBe(1);
    });

    test('dragging an unchecked column from the column list into row groups in deferred pivot mode stages the pill and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
                    .sort()
            ).toEqual(['athlete', 'country', 'sport'])
        );
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the deferred tool panel into external header drop zones should be prohibited', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;

        const rowGroupBefore = gridApi.getRowGroupColumns().map((col) => col.getColId());
        const pivotBefore = gridApi.getPivotColumns().map((col) => col.getColId());
        const deferredRowGroupBefore = getUpdateStrategy(toolPanel)
            .getRowGroupColumns(true)
            .map((col) => col.getColId());
        const deferredPivotBefore = getUpdateStrategy(toolPanel)
            .getPivotColumns(true)
            .map((col) => col.getColId());

        // Drag a CTP column to the live header row-group drop zone. In deferred mode this is
        // rejected by the drop-zone predicate (no `data-column-tool-panel-deferred` allowed).
        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        // Drag the same column to the live header pivot drop zone — also rejected.
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Neither live state nor deferred state should have changed.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(rowGroupBefore);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(pivotBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredRowGroupBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredPivotBefore);
    });

    test('dragging a CTP column to the header pivot panel in deferred mode should not apply changes', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        // Athlete is not a pivot column initially
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Get the header (horizontal) pivot drop zone GUI from the grid DOM
        const gridEl = getGridElement(gridApi)!;
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();

        // Simulate full drag from CTP column list to header pivot panel
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Grid pivot columns should remain unchanged (no immediate apply)
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Deferred state should also remain unchanged (drag should be fully rejected)
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);
    });

    test('onGridExit and onGridEnter drag callbacks should be no-ops in deferred mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Country is an active row group
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        // Create a Country column comp (which registers drag source with onGridExit/onGridEnter)
        const countryComp = createPrimaryColumnComp(toolPanel, 'Country');
        const onChangeCommonSpy = vi.spyOn(countryComp, 'onChangeCommon');

        // Find the drag source via dragSourceAndParamsList
        const dragAndDrop = countryComp.beans.dragAndDrop;
        const entry = dragAndDrop['dragSourceAndParamsList'].find(
            (e: any) => e.dragSource.eElement === countryComp.eDragHandle
        );
        expect(entry).toBeTruthy();
        const dragSource = entry.dragSource;

        // Trigger onGridExit — should not call onChangeCommon in deferred mode
        dragSource.onGridExit(null);

        expect(onChangeCommonSpy).not.toHaveBeenCalled();

        // Deferred state should remain unchanged
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);

        // Grid state should remain unchanged
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the non-deferred tool panel into external header drop zones should remain allowed', async () => {
        const { gridApi, toolPanel } = await createNonDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;
        const toolPanelGui = toolPanel.getGui() as HTMLElement;

        // Athlete is not yet a row group — drag it to the live header row-group drop zone.
        // In non-deferred mode the drop is allowed → it becomes a row-group column immediately.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).not.toContain('athlete');

        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        await waitFor(() => expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toContain('athlete'));
    });

    test('dragging into column groups is allowed after clearing groups, labels and aggregations then committing non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setValueColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns()).toEqual([]);
        expect(gridApi.getPivotColumns()).toEqual([]);
        expect(gridApi.getValueColumns()).toEqual([]);
        expect(toolPanel.rowGroupDropZonePanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(true);
    });
});
