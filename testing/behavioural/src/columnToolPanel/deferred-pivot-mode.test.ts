import type { ColDef, GridApi } from 'ag-grid-community';
import { DragSourceType, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import {
    createFakeServer,
    createServerSideDatasource,
} from '../../../../documentation/ag-grid-docs/src/content/docs/tool-panel-columns/_examples/deferred-apply-mode/fakeServer';
import { AgGridHeaderDropZonesSelector } from '../../../../packages/ag-grid-enterprise/src/rowGrouping/columnDropZones/agGridHeaderDropZones';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

describe('deferred column tool panel pivot mode', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });
    const rowGroupingOnlyGridMgr = new TestGridsManager({
        modules: [RowGroupingModule, RowGroupingPanelModule],
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
        rowGroupingOnlyGridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    async function createDeferredPivotModeGrid(): Promise<{
        gridApi: GridApi;
        toolPanel: any;
        serverGetDataSpy: ReturnType<typeof vi.spyOn>;
    }> {
        const fakeServer = createFakeServer(rowData as any);
        const serverGetDataSpy = vi.spyOn(fakeServer, 'getData');
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
            serverSideDatasource: createServerSideDatasource(fakeServer),
        });

        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        return {
            gridApi,
            toolPanel: gridApi.getToolPanelInstance('columns') as any,
            serverGetDataSpy,
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

    async function createNonDeferredPivotModeGrid(): Promise<{ gridApi: GridApi; toolPanel: any }> {
        const gridApi: GridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            pivotMode: true,
            rowData,
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

    async function createRowGroupingOnlyGrid(): Promise<GridApi> {
        const gridApi: GridApi = await rowGroupingOnlyGridMgr.createGridAndWait('rowGroupingOnlyGrid', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true, enableRowGroup: true },
                { field: 'gold' },
            ],
            rowData,
            rowGroupPanelShow: 'always',
        });

        await asyncSetTimeout(50);

        return gridApi;
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
                    children: [{ field: 'athlete' }, { field: 'age' }],
                },
                {
                    headerName: 'Group B',
                    children: [{ field: 'country' }, { field: 'year' }],
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

    function getToolPanelDragHandle(toolPanel: any): Element {
        const dragHandle = toolPanel.getGui().querySelector('.ag-drag-handle');
        expect(dragHandle).toBeTruthy();
        return dragHandle!;
    }

    function createSortEvent(init: MouseEventInit = {}): MouseEvent {
        return new MouseEvent('click', { bubbles: true, ...init });
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

    test('turning pivot mode off and applying should update the pivotMode grid option', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(gridApi.getGridOption('pivotMode')).toBe(true);

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getGridOption('pivotMode')).toBe(false);
    });

    test('turning defer mode off then toggling pivot mode should remove and restore the year label immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;
        const deferModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-panel-defer-mode-toggle input[type="checkbox"]'
        );
        const pivotModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-pivot-mode-panel input[type="checkbox"]'
        );

        expect(deferModeToggle).not.toBeNull();
        expect(pivotModeToggle).not.toBeNull();

        deferModeToggle!.click();
        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        const gridEl = getGridElement(gridApi)! as HTMLElement;
        const hasYearHeaderGroupText = Array.from(gridEl.querySelectorAll('.ag-header-group-text')).some(
            (el) => el.textContent?.trim() === '2000'
        );
        expect(hasYearHeaderGroupText).toBe(false);
        expect(gridApi.getPivotResultColumns() == null).toBe(true);

        toolPanel.editStrategy.setPivotMode(true, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        await waitForNoLoadingRows(gridApi);
        await asyncSetTimeout(50);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(toolPanel.pivotDropZonePanel.getGui().textContent).toContain('Year');
    });

    test('turning defer mode back on after leaving pivot mode should keep row groups and values populated', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;
        const deferModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-panel-defer-mode-toggle input[type="checkbox"]'
        );
        const pivotModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-pivot-mode-panel input[type="checkbox"]'
        );

        expect(deferModeToggle).not.toBeNull();
        expect(pivotModeToggle).not.toBeNull();

        deferModeToggle!.click();
        pivotModeToggle!.click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        const liveRowGroupColIds = gridApi.getRowGroupColumns().map((col) => col.getColId());
        const liveValueColIds = getValueColumnIds(gridApi);
        expect(liveRowGroupColIds).toEqual(['country', 'sport']);
        expect(liveValueColIds.length).toBeGreaterThan(0);

        deferModeToggle!.click();

        expect(toolPanel.editStrategy.getRowGroupColumns().map((col) => col.getColId())).toEqual(liveRowGroupColIds);
        expect(toolPanel.editStrategy.getValueColumns().map((col) => col.getColId())).toEqual(liveValueColIds);
        expect(toolPanel.rowGroupDropZonePanel.getGui().textContent).toContain('Country');
        expect(toolPanel.rowGroupDropZonePanel.getGui().textContent).toContain('Sport');
        for (const colId of liveValueColIds) {
            const expectedLabel = colId[0].toUpperCase() + colId.slice(1);
            expect(toolPanel.valuesDropZonePanel.getGui().textContent).toContain(expectedLabel);
        }
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

    test('multiple deferred column moves should interpret target indices against the live order', async () => {
        const { gridApi, toolPanel } = await createDeferredGroupedNonPivotGrid();
        const athlete = gridApi.getColumn('athlete')!;
        const year = gridApi.getColumn('year')!;

        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');
        toolPanel.editStrategy.moveColumns([year], 1, 'toolPanelUi');
        toolPanel.editStrategy.commit();

        expect(getPrimaryColumnOrder(toolPanel)).toEqual(['age', 'athlete', 'year', 'country']);
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

    test('getColumnAggFunc returns the staged agg function before commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')!;

        expect(toolPanel.editStrategy.getColumnAggFunc(gold)).toBe('sum');

        toolPanel.editStrategy.setColumnAggFunc(gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');
        expect(toolPanel.editStrategy.getColumnAggFunc(gold)).toBe('max');
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

    test('multi-sort in deferred mode applies all staged sorts after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;
        const sport = gridApi.getColumn('sport')!;

        toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent());
        toolPanel.editStrategy.progressSortFromEvent(sport, createSortEvent({ shiftKey: true }));

        expect(gridApi.getColumn('country')!.getSort()).toBeNull();
        expect(gridApi.getColumn('sport')!.getSort()).toBeNull();

        toolPanel.editStrategy.commit();

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('country')!.getSortIndex()).toBe(0);
        expect(gridApi.getColumn('sport')!.getSort()).toBe('asc');
        expect(gridApi.getColumn('sport')!.getSortIndex()).toBe(1);
    });

    test('sorting in deferred mode should no-op when sort service is unavailable', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')!;

        (toolPanel.editStrategy.beans as any).sortSvc = undefined;

        expect(() => toolPanel.editStrategy.progressSortFromEvent(country, createSortEvent())).not.toThrow();

        toolPanel.editStrategy.commit();

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
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const rowGroupPanel = headerDropZones.rowGroupComp;
        const pivotPanel = headerDropZones.pivotComp;
        const dragHandle = getToolPanelDragHandle(toolPanel);

        expect(rowGroupPanel.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(false);
        expect(pivotPanel.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(false);
    });

    test('dragging from the non-deferred tool panel into external header drop zones should remain allowed', async () => {
        const { gridApi, toolPanel } = await createNonDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const rowGroupPanel = headerDropZones.rowGroupComp;
        const pivotPanel = headerDropZones.pivotComp;
        const dragHandle = getToolPanelDragHandle(toolPanel);

        expect(rowGroupPanel.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(true);
        expect(pivotPanel.isInterestedIn(DragSourceType.ToolPanel, dragHandle)).toBe(true);
    });

    test('sorting a header row-group pill still works without the columns tool panel module', async () => {
        const gridApi = await createRowGroupingOnlyGrid();

        const country = gridApi.getColumn('country')! as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        const rowGroupPanel = headerDropZones.rowGroupComp as any;
        const rowGroupPill = rowGroupPanel.getGui().querySelector('.ag-column-drop-cell') as HTMLElement | null;

        expect(rowGroupPill).toBeTruthy();

        rowGroupPill!.click();

        expect(gridApi.getColumn('country')!.getSort()).toBe('asc');
    });

    test('dragging into column groups is allowed after clearing groups, labels and aggregations then committing non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();

        toolPanel.editStrategy.setRowGroupColumns([], 'toolPanelUi');
        toolPanel.editStrategy.setPivotColumns([], 'toolPanelUi');
        toolPanel.editStrategy.setValueColumns([], 'toolPanelUi');
        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns()).toEqual([]);
        expect(gridApi.getPivotColumns()).toEqual([]);
        expect(gridApi.getValueColumns()).toEqual([]);

        expect(toolPanel.rowGroupDropZonePanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(true);
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

    test('Defer mode toggle should work (toggle between deferMode and normal)', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;

        const deferModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-panel-defer-mode-toggle input[type="checkbox"]'
        );
        expect(deferModeToggle).not.toBeNull();

        const athlete = gridApi.getColumn('athlete')!;
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        // Defer mode: column move should not apply until commit.
        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
        toolPanel.editStrategy.commit();
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);

        // Normal mode: after toggle, column move should apply immediately.
        deferModeToggle!.click();
        toolPanel.editStrategy.moveColumns([athlete], 0, 'toolPanelUi');
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);

        // Defer mode again: after toggling back, move should require commit.
        deferModeToggle!.click();
        toolPanel.editStrategy.moveColumns([athlete], 2, 'toolPanelUi');
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['athlete', 'age', 'country']);
        toolPanel.editStrategy.commit();
        expect(getPrimaryColumnOrder(toolPanel).slice(0, 3)).toEqual(['age', 'athlete', 'country']);
    });

    test('defer mode buttons should not render when defer mode is not selected', async () => {
        const { toolPanel } = await createDeferredNonPivotGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;
        const deferModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-panel-defer-mode-toggle input[type="checkbox"]'
        );
        expect(deferModeToggle).not.toBeNull();

        expect(toolPanelGui.querySelectorAll('.ag-column-panel-buttons .ag-column-panel-buttons-button').length).toBe(
            2
        );

        deferModeToggle!.click();

        expect(toolPanelGui.querySelectorAll('.ag-column-panel-buttons .ag-column-panel-buttons-button').length).toBe(
            0
        );
        expect(toolPanelGui.textContent).not.toContain('Apply');
        expect(toolPanelGui.textContent).not.toContain('Cancel');
    });

    test('turning defer mode off then turning pivot mode off updates the live grid immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const toolPanelGui = toolPanel.getGui() as HTMLElement;
        const deferModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-column-panel-defer-mode-toggle input[type="checkbox"]'
        );
        const pivotModeToggle = toolPanelGui.querySelector<HTMLInputElement>(
            '.ag-pivot-mode-panel input[type="checkbox"]'
        );

        expect(deferModeToggle).not.toBeNull();
        expect(pivotModeToggle).not.toBeNull();
        expect(gridApi.isPivotMode()).toBe(true);

        deferModeToggle!.click();
        expect(gridApi.isPivotMode()).toBe(true);

        pivotModeToggle!.click();
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
    });

    test('commit should update pivot mode through grid options once', async () => {
        const { toolPanel } = await createDeferredPivotModeGrid();
        const { gos, stateSvc, colModel, colMoves, rowGroupColsSvc, valueColsSvc, pivotColsSvc } =
            toolPanel.editStrategy.beans;

        const updateGridOptionsSpy = vi.spyOn(gos, 'updateGridOptions');
        const setStateSpy = stateSvc ? vi.spyOn(stateSvc, 'setState') : undefined;
        const setPivotModeSpy = vi.spyOn(colModel as any, 'setPivotMode');
        const moveColumnsSpy = colMoves ? vi.spyOn(colMoves, 'moveColumns') : undefined;
        const setRowGroupColumnsSpy = rowGroupColsSvc ? vi.spyOn(rowGroupColsSvc, 'setColumns') : undefined;
        const setValueColumnsSpy = valueColsSvc ? vi.spyOn(valueColsSvc, 'setColumns') : undefined;
        const setColumnAggFuncSpy = valueColsSvc ? vi.spyOn(valueColsSvc, 'setColumnAggFunc') : undefined;
        const setPivotColumnsSpy = pivotColsSvc ? vi.spyOn(pivotColsSvc, 'setColumns') : undefined;

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel.editStrategy.commit();

        expect(setStateSpy?.mock.calls.length ?? 0).toBe(1);
        expect(updateGridOptionsSpy).toHaveBeenCalledTimes(1);
        expect(setPivotModeSpy).toHaveBeenCalledTimes(1);
        expect(moveColumnsSpy).not.toHaveBeenCalled();
        expect(setRowGroupColumnsSpy).not.toHaveBeenCalled();
        expect(setValueColumnsSpy).not.toHaveBeenCalled();
        expect(setColumnAggFuncSpy).not.toHaveBeenCalled();
        expect(setPivotColumnsSpy).not.toHaveBeenCalled();
    });

    test('commit should make exactly one server call', async () => {
        const { gridApi, toolPanel, serverGetDataSpy } = await createDeferredPivotModeGrid();
        const initialCallCount = serverGetDataSpy.mock.calls.length;

        toolPanel.editStrategy.setPivotMode(false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        toolPanel.editStrategy.commit();
        await waitForNoLoadingRows(gridApi);

        expect(serverGetDataSpy.mock.calls.length - initialCallCount).toBe(1);
    });
});
