import type { ColDef, GridApi } from 'ag-grid-community';
import { DragSourceType, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import {
    createFakeServer,
    createServerSideDatasource,
} from '../../../../documentation/ag-grid-docs/src/content/docs/tool-panel-columns/_examples/deferred-apply-mode/fakeServer';
import { AgGridHeaderDropZonesSelector } from '../../../../packages/ag-grid-enterprise/src/rowGrouping/columnDropZones/agGridHeaderDropZones';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('deferred column tool panel pivot mode', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [
        {
            athlete: 'Michael Phelps',
            age: 23,
            country: 'United States',
            year: 2008,
            date: '24/08/2008',
            sport: 'Swimming',
            gold: 8,
            silver: 0,
            bronze: 0,
            total: 8,
        },
        {
            athlete: 'Michael Phelps',
            age: 19,
            country: 'United States',
            year: 2004,
            date: '29/08/2004',
            sport: 'Swimming',
            gold: 6,
            silver: 0,
            bronze: 2,
            total: 8,
        },
        {
            athlete: 'Julian Weber',
            age: 24,
            country: 'Romania',
            year: 2000,
            date: '01/10/2000',
            sport: 'Gymnastics',
            gold: 2,
            silver: 1,
            bronze: 3,
            total: 6,
        },
    ];

    const columnDefs: ColDef[] = [
        {
            field: 'athlete',
            minWidth: 200,
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'age',
            enableValue: true,
        },
        {
            field: 'country',
            minWidth: 200,
            enableRowGroup: true,
            enablePivot: true,
            rowGroupIndex: 1,
        },
        {
            field: 'year',
            enableRowGroup: true,
            enablePivot: true,
            pivotIndex: 1,
        },
        {
            field: 'date',
            minWidth: 180,
            enableRowGroup: true,
            enablePivot: true,
        },
        {
            field: 'sport',
            minWidth: 200,
            enableRowGroup: true,
            enablePivot: true,
            rowGroupIndex: 2,
        },
        { field: 'gold', hide: true, enableValue: true },
        { field: 'silver', hide: true, enableValue: true, aggFunc: 'sum' },
        { field: 'bronze', hide: true, enableValue: true, aggFunc: 'sum' },
        { headerName: 'Total', field: 'total', enableValue: true },
    ];

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    async function createDeferredPivotModeGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            serverSideDatasource: createServerSideDatasource(createFakeServer(rowData as any)),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createDeferredNonPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createDeferredNonPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, enableRowGroup: true },
                { field: 'country', rowGroup: true, enableRowGroup: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
                { field: 'silver', enableValue: true, aggFunc: 'sum' },
                { field: 'bronze', enableValue: true },
            ],
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createDeferredGroupedNonPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    headerName: 'Group A',
                    children: [
                        { field: 'athlete' },
                        { field: 'age' },
                    ],
                },
                {
                    headerName: 'Group B',
                    children: [
                        { field: 'country' },
                        { field: 'year' },
                    ],
                },
            ],
            rowData,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createDeferredGroupedPivotGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    headerName: 'Group A',
                    children: [
                        { field: 'athlete', enableRowGroup: true, enablePivot: true },
                        { field: 'age', enableValue: true },
                    ],
                },
                {
                    headerName: 'Group B',
                    children: [
                        { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                        { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
                    ],
                },
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
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });

        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    async function createDeferredPivotAggregationGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
                { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
                { field: 'silver', enableValue: true, aggFunc: 'sum' },
                { field: 'bronze', enableValue: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            rowGroupPanelShow: 'always',
            pivotPanelShow: 'always',
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: {
                            deferApply: true,
                        },
                    },
                ],
                defaultToolPanel: 'columns',
            },
            serverSideDatasource: createServerSideDatasource(createFakeServer(rowData as any)),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
        };
    }

    function getPrimaryColumnOrder(toolPanel: any): string[] {
        return toolPanel.editStrategy.beans.colModel.getColDefCols().map((col: any) => col.getColId());
    }

    function getValueColumnIds(gridApi: GridApi): string[] {
        return gridApi.getValueColumns().map((col) => col.getColId());
    }

    function createSortEvent(): MouseEvent {
        return new MouseEvent('click', { bubbles: true });
    }

    function cancelDeferredChanges(toolPanel: any): void {
        toolPanel['onDeferredCancel']();
        toolPanel.editStrategy.commit();
    }

    test('turning pivot mode off and applying should remove year header group text', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const hasYearHeaderGroupText = Array.from(gridEl.querySelectorAll('.ag-header-group-text')).some(
            (el) => el.textContent?.trim() === '2000'
        );
        expect(hasYearHeaderGroupText).toBe(false);
        expect(gridApi.getPivotResultColumns() == null).toBe(true);
    });

    test('reordering columns in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        toolPanel.editStrategy.commit();

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('reordering columns in pivot mode applies primary column order only after commit', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.editStrategy.beans.colModel.getColDefCol('athlete');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        toolPanel.editStrategy.commit();

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('reordering column groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;
        const age = gridApi.getColumn('age')!;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        toolPanel.editStrategy.moveColumns([athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        toolPanel.editStrategy.commit();

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('reordering column groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;
        const age = gridApi.getColumn('age')!;

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        toolPanel.editStrategy.moveColumns([athlete, age], 4, 'toolPanelUi');

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);

        toolPanel.editStrategy.commit();

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['country', 'year', 'athlete', 'age']);
    });

    test('changing column visibility in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        expect(country.isVisible()).toBe(true);

        toolPanel.editStrategy.setColumnsVisible([country], false, 'toolPanelUi');

        expect(country.isVisible()).toBe(true);

        toolPanel.editStrategy.commit();

        expect(country.isVisible()).toBe(false);
    });

    test('select all and deselect all from the header checkbox apply only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const header = toolPanel.primaryColsPanel.primaryColsHeaderPanel;
        const visibleColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'total'];

        header['setSelectionState'](true);
        header['onSelectClicked']();

        expect(visibleColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);

        toolPanel.editStrategy.commit();

        expect(visibleColumns.some((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(false);

        header['setSelectionState'](false);
        header['onSelectClicked']();

        expect(visibleColumns.some((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(false);

        toolPanel.editStrategy.commit();

        expect(visibleColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('reordering row groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('adding row groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;
        const date = gridApi.getColumn('date')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country, sport, date], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport', 'date']);
    });

    test('removing row groups in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);
    });

    test('reordering row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([sport, country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['sport', 'country']);
    });

    test('adding row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;
        const date = gridApi.getColumn('date')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country, sport, date], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport', 'date']);
    });

    test('removing row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country']);
    });

    test('adding aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;
        const bronze = gridApi.getColumn('bronze')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('removing aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
    });

    test('reordering aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('adding aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;
        const bronze = gridApi.getColumn('bronze')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('removing aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['gold']);
    });

    test('reordering aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([silver, gold], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'gold']);
    });

    test('changing agg function on an existing value pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        expect(gold.getAggFunc()).toBe('sum');

        toolPanel.editStrategy.setColumnAggFunc(gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        toolPanel.editStrategy.commit();

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        toolPanel.editStrategy.setColumnAggFunc(gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        expect(gold.getAggFunc()).toBe('sum');

        toolPanel.editStrategy.setColumnAggFunc(gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        toolPanel.editStrategy.setColumnAggFunc(gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('sorting a row-group pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        expect(country.getSort()).toBeNull();

        toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent());

        expect(country.getSort()).toBeNull();

        toolPanel.editStrategy.commit();

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent());
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('sorting a row-group pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;

        expect(country.getSort()).toBeNull();

        toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent());

        expect(country.getSort()).toBeNull();

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('sorting a row-group pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;

        toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent());
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
    });

    test('adding a column label in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')!;
        const date = gridApi.getColumn('date')!;

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.setPivotColumns([year, date], 'toolPanelUi');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'date']);
    });

    test('removing a column label in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.setPivotColumns([], 'toolPanelUi');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns()).toEqual([]);
    });

    test('reordering column labels in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')!;
        const date = gridApi.getColumn('date')!;

        toolPanel.editStrategy.setPivotColumns([year, date], 'toolPanelUi');
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'date']);

        toolPanel.editStrategy.setPivotColumns([date, year], 'toolPanelUi');

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'date']);

        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['date', 'year']);
    });

    test('turning pivot mode off, applying, then cancelling should keep the primary list populated', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        toolPanel['onDeferredCancel']();

        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });

    test('turning pivot mode off and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();

        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('turning pivot mode off then on and cancelling should keep pivot mode on', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.setPivotMode(true, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();

        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(toolPanel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
    });

    test('dragging from the deferred tool panel into external non-tool-panel drop zones should be prohibited', async () => {
        const { gridApi } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const rowGroupPanel = headerDropZones.rowGroupComp;
        const pivotPanel = headerDropZones.pivotComp;

        expect(rowGroupPanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(false);
        expect(pivotPanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(false);
    });

    test('reordering columns and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;

        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering columns and cancelling in pivot mode should keep the original order', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const athlete = toolPanel.editStrategy.beans.colModel.getColDefCol('athlete');

        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
    });

    test('reordering column groups and cancelling in non-pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;
        const age = gridApi.getColumn('age')!;

        toolPanel.editStrategy.moveColumns([athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('reordering column groups and cancelling in pivot mode should keep the original order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;
        const age = gridApi.getColumn('age')!;

        toolPanel.editStrategy.moveColumns([athlete, age], 4, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['athlete', 'age', 'country', 'year']);
    });

    test('changing column visibility and cancelling in non-pivot mode should keep visibility unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        toolPanel.editStrategy.setColumnsVisible([country], false, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(country.isVisible()).toBe(true);
    });

    test('select all or deselect all and cancelling in non-pivot mode should keep visibility unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const header = toolPanel.primaryColsPanel.primaryColsHeaderPanel;
        const visibleColumns = ['athlete', 'age', 'country', 'year', 'date', 'sport', 'total'];

        header['setSelectionState'](true);
        header['onSelectClicked']();
        cancelDeferredChanges(toolPanel);

        expect(visibleColumns.every((colId) => gridApi.getColumn(colId)!.isVisible())).toBe(true);
    });

    test('row group changes and cancelling in non-pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;
        const date = gridApi.getColumn('date')!;

        toolPanel.editStrategy.setRowGroupColumns([sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('row group changes and cancelling in pivot mode should keep row groups unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;
        const date = gridApi.getColumn('date')!;

        toolPanel.editStrategy.setRowGroupColumns([sport, country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country, sport, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        toolPanel.editStrategy.setRowGroupColumns([country], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('aggregation value changes and cancelling in non-pivot mode should keep values unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;
        const bronze = gridApi.getColumn('bronze')!;

        toolPanel.editStrategy.setValueColumns([gold, silver, bronze], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([silver, gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);
    });

    test('aggregation value changes and cancelling in pivot mode should keep values unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;
        const silver = gridApi.getColumn('silver')!;
        const bronze = gridApi.getColumn('bronze')!;

        toolPanel.editStrategy.setValueColumns([gold, silver, bronze], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        toolPanel.editStrategy.setValueColumns([silver, gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);
    });

    test('column label changes and cancelling in pivot mode should keep labels unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')!;
        const date = gridApi.getColumn('date')!;

        toolPanel.editStrategy.setPivotColumns([year, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.setPivotColumns([], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        toolPanel.editStrategy.setPivotColumns([date, year], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('deferred mode should show a Defer mode toggle in the column tool panel footer', async () => {
        const { toolPanel } = await createDeferredNonPivotGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;

        expect(toolPanelGui.textContent).toContain('Defer mode');
        expect(toolPanelGui.textContent).toContain('Apply');
        expect(toolPanelGui.textContent).toContain('Cancel');
    });
});
