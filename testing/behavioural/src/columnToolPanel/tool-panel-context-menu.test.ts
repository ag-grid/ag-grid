import type { ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { ToolPanelContextMenu } from '../../../../packages/ag-grid-enterprise/src/columnToolPanel/toolPanelContextMenu';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Cell Editing Start', async () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowDataFactory = () => [
        { athlete: 'Michael Phelps', age: 23, country: 'United States', year: 2008 },
        { athlete: 'Michael Phelps', age: 19, country: 'United States', year: 2004 },
        { athlete: 'Michael Phelps', age: 27, country: 'United States', year: 2012 },
    ];

    const columnDefs: ColDef[] = [
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 180 },
        { field: 'year' },
    ];
    let rowData: any[];

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    describe('ToolPanelContextMenu addColumnsToList and removeColumnsFromList', async () => {
        let gridApi: GridApi, gridDiv: HTMLElement, firstTwoColumns: string[];
        beforeEach(async () => {
            gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    enableValue: true,
                    enableRowGroup: true,
                },
                sideBar: 'columns',
            });

            firstTwoColumns = gridApi
                .getColumns()!
                .slice(0, 2)
                .map((c) => c.getId());
            gridDiv = getGridElement(gridApi)! as HTMLElement;
            await asyncSetTimeout(1);
        });

        const getGroupedRowIds = () => gridApi.getRowGroupColumns().map((col) => col.getId());

        /**
         * TODO: these tests use private apis like createBean and 'menuItemMap'
         * reason we do it this way is because virtualized list is not rendered in jsdom
         * so we cannot simulate user interaction that way.
         *
         * once that is added to mockGridLayout, use the tests below instead:
         *
         *
         *
         *         test('addColumnsToList adds columns that meet predicate and are not already in list', async () => {
         *             expect(gridApi.getRowGroupColumns()).toStrictEqual([]);
         *             const panelColId = agTestIdFor.columnSelectListItemDragHandle(`${firstTwoColumns[0].headerName} Column`);
         *             await asyncSetTimeout(1000);
         *             const menu = gridDiv.querySelector(`[data-testid="${panelColId}"]`)!;
         *             expect(menu).not.toBeNull();
         *             fireEvent.contextMenu(menu);
         *             await asyncSetTimeout(1);
         *             const menuItem = await findByText(gridDiv, 'Group by ' + firstTwoColumns[0].headerName);
         *             await userEvent.click(menuItem);
         *             expect(gridApi.getRowGroupColumns()).toBe([]);
         *         });
         *
         *         test('removeColumnsFromList removes columns that meet predicate and are in list', async () => {
         *             gridApi.addRowGroupColumns(firstTwoColumns.map((col) => col.field!));
         *             expect(gridApi.getRowGroupColumns().length).toBe(2);
         *             const panelColId = agTestIdFor.columnSelectListItemDragHandle(`${firstTwoColumns[0].headerName} Column`);
         *             await asyncSetTimeout(1000);
         *             const menu = gridDiv.querySelector(`[data-testid="${panelColId}"]`)!;
         *             expect(menu).not.toBeNull();
         *             fireEvent.contextMenu(menu);
         *             await asyncSetTimeout(1);
         *             const menuItem = await findByText(gridDiv, 'Un-Group by ' + firstTwoColumns[0].headerName);
         *             await userEvent.click(menuItem);
         *             expect(gridApi.getRowGroupColumns()).toBe([]);
         *         });
         *
         */

        test('addColumnsToList adds columns that meet predicate and are not already in list', async () => {
            expect(getGroupedRowIds()).toStrictEqual([]);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').activateFunction(); // add to group
            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
        });

        test('addColumnsToList does not add columns that are already in list', () => {
            gridApi.addRowGroupColumns(firstTwoColumns);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').activateFunction(); // already added
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
        });

        test('removeColumnsFromList removes columns that meet predicate and are in list', async () => {
            gridApi.addRowGroupColumns(firstTwoColumns);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').deActivateFunction(); // remove from group
            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('removeColumnsFromList does not remove columns not in list', () => {
            gridApi.addRowGroupColumns(firstTwoColumns);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            gridApi.removeRowGroupColumns(firstTwoColumns.slice(0, 1));
            expect(getGroupedRowIds()).toStrictEqual(['age']);
            contextMenu['menuItemMap'].get('rowGroup').deActivateFunction(); // already removed
            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('removeColumnsFromList keeps columns that do not match the predicate', () => {
            const col = gridApi.getColumns()![0] as any;
            const athlete = gridApi.getColumn('athlete')!;
            const year = gridApi.getColumn('year')!;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));

            expect(
                contextMenu['removeColumnsFromList']([athlete, year], (candidate: any) => candidate.getColId() !== 'year')
            ).toStrictEqual([year]);
        });
    });

    describe('ToolPanelContextMenu deferred mode', () => {
        function getDeferredActionButton(toolPanel: any, action: 'Apply' | 'Cancel'): HTMLButtonElement {
            const button = Array.from(
                toolPanel.getGui().querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')
            ).find((candidate) => candidate.textContent?.trim() === action);
            expect(button).toBeTruthy();
            return button!;
        }

        function createDeferredContextMenu(
            gridApi: GridApi,
            gridDiv: HTMLElement,
            columnId: string,
            params: { deferApply: boolean } = { deferApply: true }
        ): any {
            const column = gridApi.getColumn(columnId)! as any;
            return column.createBean(new ToolPanelContextMenu(column, new MouseEvent('contextmenu'), gridDiv, params));
        }

        test('row group context menu action in deferred mode applies only after clicking Apply', async () => {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    enableRowGroup: true,
                },
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { deferApply: true },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const gridDiv = getGridElement(gridApi)! as HTMLElement;
            const toolPanel = gridApi.getToolPanelInstance('columns') as any;
            const contextMenu = createDeferredContextMenu(gridApi, gridDiv, 'athlete');

            contextMenu['menuItemMap'].get('rowGroup').activateFunction();

            expect(gridApi.getRowGroupColumns()).toEqual([]);

            getDeferredActionButton(toolPanel, 'Apply').click();

            expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['athlete']);
        });

        test('value context menu action in deferred mode is discarded by Cancel', async () => {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    enableValue: true,
                },
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { deferApply: true },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const gridDiv = getGridElement(gridApi)! as HTMLElement;
            const toolPanel = gridApi.getToolPanelInstance('columns') as any;
            const contextMenu = createDeferredContextMenu(gridApi, gridDiv, 'age');

            contextMenu['menuItemMap'].get('value').activateFunction();

            expect(gridApi.getValueColumns()).toEqual([]);

            getDeferredActionButton(toolPanel, 'Cancel').click();

            expect(gridApi.getValueColumns()).toEqual([]);
        });

        test('pivot context menu action in deferred pivot mode applies only after clicking Apply', async () => {
            const gridApi = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', enableRowGroup: true, enablePivot: true, rowGroup: true },
                    { field: 'country', enableRowGroup: true, enablePivot: true },
                    { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
                    { field: 'age', enableValue: true, aggFunc: 'sum' },
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
                            toolPanelParams: { deferApply: true },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            await asyncSetTimeout(1);
            const gridDiv = getGridElement(gridApi)! as HTMLElement;
            const toolPanel = gridApi.getToolPanelInstance('columns') as any;
            const contextMenu = createDeferredContextMenu(gridApi, gridDiv, 'country');

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

            contextMenu['menuItemMap'].get('pivot').activateFunction();

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

            getDeferredActionButton(toolPanel, 'Apply').click();

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year', 'country']);
        });
    });
});
