import { ClientSideRowModelModule, ColumnAutoSizeModule, CsvExportModule, QuickFilterModule } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    FindModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar Built-in Items', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnAutoSizeModule,
            ContextMenuModule,
            CsvExportModule,
            ExcelExportModule,
            ColumnsToolPanelModule,
            FiltersToolPanelModule,
            FindModule,
            QuickFilterModule,
            RowGroupingModule,
            RowGroupingPanelModule,
            SideBarModule,
            ToolbarModule,
        ],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    function getToolbarButton(gridDiv: HTMLElement, label: string): HTMLButtonElement | null {
        return gridDiv.querySelector<HTMLButtonElement>(`.ag-toolbar-button[title="${label}"]`);
    }

    describe('autoSizeAll', () => {
        test('renders button with correct label and title', async () => {
            const api = gridMgr.createGrid('auto-size-all-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['autoSizeAll'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Auto Size All');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Auto Size All');
        });

        test('calls autoSizeAllColumns when clicked', async () => {
            const api = gridMgr.createGrid('auto-size-all-click', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
                rowData: [{ name: 'Alice', age: 30 }],
                toolbar: {
                    items: ['autoSizeAll'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const spy = vitest.spyOn(api, 'autoSizeAllColumns');

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Auto Size All')!;
            button.click();

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('separator', () => {
        test('renders separator elements between items', async () => {
            const api = gridMgr.createGrid('separator-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['autoSizeAll', 'separator', 'resetColumns'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const leftContainer = gridDiv.querySelector('.ag-toolbar-left')!;
            const separators = leftContainer.querySelectorAll('.ag-toolbar-separator');
            expect(separators).toHaveLength(1);
            expect(separators[0].getAttribute('role')).toBe('separator');
        });
    });

    describe('export', () => {
        test('renders button with correct label and title', async () => {
            const api = gridMgr.createGrid('export-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['export'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Export');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Export');
        });

        test('opens popup menu with export options when clicked', async () => {
            const api = gridMgr.createGrid('export-menu', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['export'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Export')!;
            button.click();

            const popupParent = gridDiv.querySelector('.ag-popup');
            const menuItems = popupParent?.querySelectorAll('.ag-menu-option') ?? [];
            expect(menuItems.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('excelExport', () => {
        test('renders button with correct label and title', async () => {
            const api = gridMgr.createGrid('excel-export-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['excelExport'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Excel Export');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Excel Export');
        });

        test('calls exportDataAsExcel when clicked', async () => {
            const api = gridMgr.createGrid('excel-export-click', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['excelExport'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const spy = vitest.spyOn(api, 'exportDataAsExcel').mockImplementation(() => {});

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Excel Export')!;
            button.click();

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('rowGroupPanel', () => {
        test('renders row group drop zone when rowGroupPanelShow is always', async () => {
            const api = gridMgr.createGrid('row-group-panel-render', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                rowGroupPanelShow: 'always',
                toolbar: {
                    items: ['rowGroupPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar-left')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
        });

        test('does not render toolbar panel when rowGroupPanelShow is never', async () => {
            const api = gridMgr.createGrid('row-group-panel-never', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                rowGroupPanelShow: 'never',
                toolbar: {
                    items: ['rowGroupPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;
            const toolbarPanel = toolbar.querySelector('.ag-toolbar-panel');
            expect(toolbarPanel).toBeNull();
        });

        test('does not render toolbar panel by default (rowGroupPanelShow defaults to never)', async () => {
            const api = gridMgr.createGrid('row-group-panel-default', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['rowGroupPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;
            const toolbarPanel = toolbar.querySelector('.ag-toolbar-panel');
            expect(toolbarPanel).toBeNull();
        });
    });

    describe('pivotPanel', () => {
        test('renders pivot drop zone when pivotPanelShow is always', async () => {
            const api = gridMgr.createGrid('pivot-panel-render', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                pivotPanelShow: 'always',
                toolbar: {
                    items: ['pivotPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar-left')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
        });

        test('does not render toolbar panel when pivotPanelShow is never', async () => {
            const api = gridMgr.createGrid('pivot-panel-never', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                pivotPanelShow: 'never',
                toolbar: {
                    items: ['pivotPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;
            const toolbarPanel = toolbar.querySelector('.ag-toolbar-panel');
            expect(toolbarPanel).toBeNull();
        });

        test('does not render toolbar panel by default (pivotPanelShow defaults to never)', async () => {
            const api = gridMgr.createGrid('pivot-panel-default', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['pivotPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;
            const toolbarPanel = toolbar.querySelector('.ag-toolbar-panel');
            expect(toolbarPanel).toBeNull();
        });
    });

    describe('quickFilter', () => {
        test('renders input with placeholder', async () => {
            const api = gridMgr.createGrid('quick-filter-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }, { name: 'Bob' }],
                toolbar: {
                    items: ['quickFilter'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
            expect(input).not.toBeNull();
            expect(input!.placeholder).toBe('Quick Filter');
            expect(input!.getAttribute('aria-label')).toBe('Quick Filter');
        });

        test('sets quickFilterText on input', async () => {
            const api = gridMgr.createGrid('quick-filter-input', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }, { name: 'Bob' }],
                toolbar: {
                    items: ['quickFilter'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
            input.value = 'Alice';
            input.dispatchEvent(new Event('input'));

            expect(api.getGridOption('quickFilterText')).toBe('Alice');
        });
    });

    describe('find', () => {
        test('renders input with placeholder', async () => {
            const api = gridMgr.createGrid('find-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['find'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field');
            expect(input).not.toBeNull();
            expect(input!.placeholder).toBe('Find');
            expect(input!.getAttribute('aria-label')).toBe('Find');
        });

        test('sets findSearchValue on input', async () => {
            const api = gridMgr.createGrid('find-input', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['find'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const input = gridDiv.querySelector<HTMLInputElement>('.ag-toolbar-input-field')!;
            input.value = 'Alice';
            input.dispatchEvent(new Event('input'));

            expect(api.getGridOption('findSearchValue')).toBe('Alice');
        });
    });

    describe('columnsPanel', () => {
        test('renders button when sidebar has columns panel', async () => {
            const api = gridMgr.createGrid('columns-panel-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: '' },
                toolbar: {
                    items: ['columnsPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Columns');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Columns');
        });

        test('hides button when sidebar does not have columns panel', async () => {
            const api = gridMgr.createGrid('columns-panel-no-sidebar', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['columnsPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Columns');
            expect(button).toBeNull();
        });

        test('toggles columns tool panel on click', async () => {
            const api = gridMgr.createGrid('columns-panel-toggle', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: '' },
                toolbar: {
                    items: ['columnsPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Columns')!;

            button.click();
            expect(api.getOpenedToolPanel()).toBe('columns');

            button.click();
            expect(api.getOpenedToolPanel()).toBeNull();
        });
    });

    describe('filtersPanel', () => {
        test('renders button when sidebar has filters panel', async () => {
            const api = gridMgr.createGrid('filters-panel-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                sideBar: { toolPanels: ['filters'], defaultToolPanel: '' },
                toolbar: {
                    items: ['filtersPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Filters');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Filters');
        });

        test('hides button when sidebar does not have filters panel', async () => {
            const api = gridMgr.createGrid('filters-panel-no-sidebar', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['filtersPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Filters');
            expect(button).toBeNull();
        });

        test('toggles filters tool panel on click', async () => {
            const api = gridMgr.createGrid('filters-panel-toggle', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                sideBar: { toolPanels: ['filters'], defaultToolPanel: '' },
                toolbar: {
                    items: ['filtersPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Filters')!;

            button.click();
            expect(api.getOpenedToolPanel()).toBe('filters');

            button.click();
            expect(api.getOpenedToolPanel()).toBeNull();
        });
    });

    describe('rowGroupPanelShow/pivotPanelShow integration', () => {
        const integrationGridMgr = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                ColumnAutoSizeModule,
                ContextMenuModule,
                CsvExportModule,
                ExcelExportModule,
                ColumnsToolPanelModule,
                FiltersToolPanelModule,
                FindModule,
                PivotModule,
                QuickFilterModule,
                RowGroupingModule,
                RowGroupingPanelModule,
                SideBarModule,
                ToolbarModule,
            ],
        });

        afterEach(() => {
            integrationGridMgr.reset();
        });

        test('rowGroupPanel hidden when rowGroupPanelShow is never with full toolbar config', async () => {
            const api = integrationGridMgr.createGrid('full-toolbar-rowgroup-never', {
                columnDefs: [
                    { field: 'athlete', minWidth: 200 },
                    { field: 'country', minWidth: 200 },
                    { field: 'sport', minWidth: 200 },
                    { field: 'year' },
                    { field: 'gold', enableValue: true },
                    { field: 'silver', enableValue: true },
                    { field: 'bronze', enableValue: true },
                    { field: 'total' },
                ],
                defaultColDef: {
                    flex: 1,
                    minWidth: 100,
                    filter: true,
                    enableRowGroup: true,
                    enablePivot: true,
                },
                rowData: [
                    {
                        athlete: 'Alice',
                        country: 'US',
                        sport: 'Running',
                        year: 2024,
                        gold: 1,
                        silver: 0,
                        bronze: 0,
                        total: 1,
                    },
                ],
                rowGroupPanelShow: 'never',
                sideBar: { toolPanels: ['columns'] },
                toolbar: {
                    items: [
                        'rowGroupPanel',
                        'pivotPanel',
                        { component: 'quickFilter', alignment: 'right' },
                        { component: 'find', alignment: 'right' },
                        'separator',
                        { component: 'columnsPanel', alignment: 'right' },
                        { component: 'filtersPanel', alignment: 'right' },
                        { component: 'autoSizeAll', alignment: 'right' },
                        'separator',
                        { component: 'export', alignment: 'right' },
                        'separator',
                        { component: 'resetColumns', alignment: 'right', display: 'iconAndLabel' },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;

            // Both rowGroupPanel and pivotPanel should not be in the DOM (both default to 'never')
            const toolbarPanels = toolbar.querySelectorAll('.ag-toolbar-panel');
            expect(toolbarPanels).toHaveLength(0);

            // No drop zone should exist inside the toolbar
            const dropZones = toolbar.querySelectorAll('.ag-column-drop');
            expect(dropZones).toHaveLength(0);
        });
    });
});
