import { findByText } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { AgColumn, ColDef, GridApi } from 'ag-grid-community';
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
        let gridApi: GridApi, gridDiv: HTMLElement, toolPanel: any;
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

            gridDiv = getGridElement(gridApi)! as HTMLElement;
            toolPanel = gridApi.getToolPanelInstance('columns') as any;
            await asyncSetTimeout(1);
        });

        const getGroupedRowIds = () => gridApi.getRowGroupColumns().map((col) => col.getId());
        const getToolPanelRowGroupLabels = () =>
            Array.from(toolPanel.rowGroupDropZonePanel.getGui().querySelectorAll('.ag-column-drop-cell-text')).map(
                (element: HTMLElement) => element.textContent?.trim()
            );

        async function createContextMenu(columnId: string): Promise<any> {
            const column = gridApi.getColumn(columnId)! as AgColumn;
            const contextMenu = column.createBean(
                new ToolPanelContextMenu(column as any, new MouseEvent('contextmenu'), gridDiv)
            );
            await asyncSetTimeout(1);
            return contextMenu;
        }

        test('user can add a row group by clicking the tool panel context menu item', async () => {
            expect(getGroupedRowIds()).toStrictEqual([]);

            await createContextMenu('athlete');

            const menuItem = await findByText(gridDiv, 'Group by Athlete');
            await userEvent.click(menuItem);

            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
        });

        test('user can remove a row group by clicking the tool panel context menu item', async () => {
            gridApi.addRowGroupColumns(['athlete', 'age']);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);

            await createContextMenu('athlete');

            const menuItem = await findByText(gridDiv, 'Un-Group by Athlete');
            await userEvent.click(menuItem);

            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('group and ungroup context menu actions update the tool panel row group pills', async () => {
            expect(getToolPanelRowGroupLabels()).toStrictEqual([]);

            await createContextMenu('athlete');
            await userEvent.click(await findByText(gridDiv, 'Group by Athlete'));

            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
            expect(getToolPanelRowGroupLabels()).toStrictEqual(['Athlete']);

            await createContextMenu('athlete');
            await userEvent.click(await findByText(gridDiv, 'Un-Group by Athlete'));

            expect(getGroupedRowIds()).toStrictEqual([]);
            expect(getToolPanelRowGroupLabels()).toStrictEqual([]);
        });

        test('addColumnsToList adds columns that meet predicate and are not already in list', async () => {
            expect(getGroupedRowIds()).toStrictEqual([]);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').activateFunction(); // add to group
            expect(getGroupedRowIds()).toStrictEqual(['athlete']);
        });

        test('addColumnsToList does not add columns that are already in list', () => {
            gridApi.addRowGroupColumns(['athlete', 'age']);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').activateFunction(); // already added
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
        });

        test('removeColumnsFromList removes columns that meet predicate and are in list', async () => {
            gridApi.addRowGroupColumns(['athlete', 'age']);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            contextMenu['menuItemMap'].get('rowGroup').deActivateFunction(); // remove from group
            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('removeColumnsFromList does not remove columns not in list', () => {
            gridApi.addRowGroupColumns(['athlete', 'age']);
            expect(getGroupedRowIds()).toStrictEqual(['athlete', 'age']);
            const col = gridApi.getColumns()![0] as any;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));
            gridApi.removeRowGroupColumns(['athlete']);
            expect(getGroupedRowIds()).toStrictEqual(['age']);
            contextMenu['menuItemMap'].get('rowGroup').deActivateFunction(); // already removed
            expect(getGroupedRowIds()).toStrictEqual(['age']);
        });

        test('removeColumnsFromList keeps columns that do not match the predicate', () => {
            const col = gridApi.getColumns()![0] as any;
            const athlete = gridApi.getColumn('athlete')! as AgColumn;
            const year = gridApi.getColumn('year')! as AgColumn;
            const contextMenu = col.createBean(new ToolPanelContextMenu(col, new MouseEvent(''), gridDiv));

            expect(
                contextMenu['removeColumnsFromList'](
                    [athlete, year],
                    (candidate: any) => candidate.getColId() !== 'year'
                )
            ).toStrictEqual([year]);
        });
    });

    describe('ToolPanelContextMenu deferred mode', () => {
        function getDeferredActionButton(toolPanel: any, action: 'Apply' | 'Cancel'): HTMLButtonElement {
            const button = Array.from(toolPanel.getGui().querySelectorAll('.ag-column-panel-buttons-button')).find(
                (candidate: HTMLButtonElement) => candidate.textContent?.trim() === action
            ) as HTMLButtonElement;
            expect(button).toBeTruthy();
            return button!;
        }

        function getToolPanelRowGroupLabels(toolPanel: any): Array<string | undefined> {
            return Array.from(
                toolPanel.rowGroupDropZonePanel.getGui().querySelectorAll('.ag-column-drop-cell-text')
            ).map((element: HTMLElement) => element.textContent?.trim());
        }

        function getToolPanelDropZoneText(panel: any): string {
            return panel.getGui().textContent ?? '';
        }

        function createDeferredContextMenu(
            gridApi: GridApi,
            gridDiv: HTMLElement,
            columnId: string,
            params: { deferApply: boolean } = { deferApply: true }
        ): any {
            const column = gridApi.getColumn(columnId)! as AgColumn;
            return column.createBean(
                new ToolPanelContextMenu(column as any, new MouseEvent('contextmenu'), gridDiv, params)
            );
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

        test('row group context menu actions in deferred mode update the tool panel pills immediately', async () => {
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

            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual([]);

            contextMenu['menuItemMap'].get('rowGroup').activateFunction();

            expect(gridApi.getRowGroupColumns()).toEqual([]);
            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual(['Athlete']);

            getDeferredActionButton(toolPanel, 'Cancel').click();

            expect(gridApi.getRowGroupColumns()).toEqual([]);
            expect(getToolPanelRowGroupLabels(toolPanel)).toStrictEqual([]);
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

        test('value context menu actions in deferred mode update the tool panel pills immediately', async () => {
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

            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');

            contextMenu['menuItemMap'].get('value').activateFunction();

            expect(gridApi.getValueColumns()).toEqual([]);
            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).toContain('Age');

            getDeferredActionButton(toolPanel, 'Cancel').click();

            expect(gridApi.getValueColumns()).toEqual([]);
            expect(getToolPanelDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');
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

        test('pivot context menu actions in deferred pivot mode update the tool panel pills immediately', async () => {
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

            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Country');

            contextMenu['menuItemMap'].get('pivot').activateFunction();

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).toContain('Country');

            getDeferredActionButton(toolPanel, 'Cancel').click();

            expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
            expect(getToolPanelDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Country');
        });
    });
});
