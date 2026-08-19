import { waitFor } from '@testing-library/dom';
import { waitForNoLoadingRows } from 'ag-test-utils';

import type { AgColumn } from 'ag-grid-community';

import {
    cancelDeferredChanges,
    commitChanges,
    createDeferredGroupedNonPivotGrid,
    createDeferredGroupedPivotGrid,
    createDeferredNonPivotAggregationGrid,
    createDeferredNonPivotGrid,
    createDeferredPivotAggregationGrid,
    createDeferredPivotModeGrid,
    createPrimaryColumnComp,
    dragRenderedPrimaryColumnToEndOfPrimaryList,
    getApplyButton,
    getCancelButton,
    getDisplayedPrimaryColumnOrder,
    getDropZoneText,
    getPivotModeToggle,
    getPrimaryColumnOrder,
    getUpdateStrategy,
    getValueColumnIds,
    removeDropZonePill,
    setupDeferredPivotModeSuite,
} from './deferredPivotModeHarness';

describe('deferred column tool panel pivot mode - removing and reordering pills', () => {
    setupDeferredPivotModeSuite();

    test('removing a pivot label pill in deferred pivot mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
            { field: 'country', enableRowGroup: true, enablePivot: true },
            { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
            { field: 'age', enableValue: true, aggFunc: 'sum' },
        ]);
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();

        await waitFor(() => expect(gridApi.isPivotMode()).toBe(true));
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(createPrimaryColumnComp(toolPanel, 'Year').isSelected()).toBe(true);

        removeDropZonePill(toolPanelGui, 'Year');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Year').isSelected()).toBe(false);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual([]);
    });

    test('removing a row group pill in deferred mode applies only after clicking Apply', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        removeDropZonePill(toolPanelGui, 'Country');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getApplyButton(toolPanelGui).click();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport']);
    });

    test('removing a value pill in deferred mode is discarded by Cancel', async () => {
        const { gridApi, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', rowGroup: true, enableRowGroup: true },
            { field: 'country', rowGroup: true, enableRowGroup: true },
            { field: 'gold', enableValue: true, aggFunc: 'sum' },
            { field: 'silver', enableValue: true, aggFunc: 'sum' },
            { field: 'bronze', enableValue: true },
        ]);

        removeDropZonePill(toolPanelGui, 'sum of Silver');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);

        getCancelButton(toolPanelGui).click();

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);
    });

    test('removing a value pill in pivot mode can be cancelled', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        removeDropZonePill(toolPanelGui, 'sum of Bronze');
        getCancelButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
    });

    test('removing a value pill in pivot mode stages the change until Apply', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
        expect(createPrimaryColumnComp(toolPanel, 'Bronze').isSelected()).toBe(true);

        removeDropZonePill(toolPanelGui, 'sum of Bronze');

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver', 'bronze']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Bronze').isSelected()).toBe(false);

        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getValueColumns().map((col) => col.getColId())).toEqual(['silver']);
    });

    test('removing aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
    });

    test('removing the first row-group pill in deferred pivot mode clears the staged Country checkbox immediately', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const countryColumnComp = createPrimaryColumnComp(toolPanel, 'Country');
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(countryColumnComp.isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');

        removeDropZonePill(toolPanelGui, 'Country');

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['sport'])
        );
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Country').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');
    });

    test('reordering aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('reordering aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('reordering column groups and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('reordering column groups and cancelling in pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('reordering column groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('reordering column groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;
        const age = gridApi.getColumn('age')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('reordering column labels in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setPivotColumns(true, [year, date], 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [date, year], 'toolPanelUi');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'date']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['date', 'year']);
    });

    test('reordering columns and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns and cancelling in pivot mode should keep the original order', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.beans.colModel.getNonPivotCol('athlete') as AgColumn;

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')! as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('dragging a column to the end in non-pivot mode should update the deferred tool panel order before commit', async () => {
        const { toolPanel } = await createDeferredNonPivotGrid();

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

        await dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel, 'Athlete');

        await waitFor(() =>
            expect(getDisplayedPrimaryColumnOrder(toolPanel)).toEqual([
                'age',
                'country',
                'year',
                'date',
                'sport',
                'gold',
                'silver',
                'bronze',
                'total',
                'athlete',
            ])
        );
        expect(getPrimaryColumnOrder(toolPanel)).toEqual([
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

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual([
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
            'athlete',
        ]);
    });

    test('reordering columns in pivot mode applies primary column order only after commit', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.beans.colModel.getNonPivotCol('athlete') as AgColumn;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        getUpdateStrategy(toolPanel).moveColumns(true, [athlete], 1, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        commitChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('reordering row groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('reordering row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('row group changes and cancelling in non-pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('row group changes and cancelling in pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });
});
