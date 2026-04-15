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
            PivotModule,
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
            const button = getToolbarButton(gridDiv, 'Autosize All Columns');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Autosize All Columns');
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
            const button = getToolbarButton(gridDiv, 'Autosize All Columns')!;
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
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;
            const separators = toolbar.querySelectorAll('.ag-toolbar-separator');
            expect(separators).toHaveLength(1);
            expect(separators[0].getAttribute('role')).toBe('separator');
        });
    });

    describe('menu', () => {
        test('renders button with custom label and title', async () => {
            const api = gridMgr.createGrid('menu-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        {
                            toolbarItem: 'menu',
                            toolbarItemParams: {
                                label: 'Export',
                                icon: 'save',
                                menuItems: [{ name: 'CSV Export' }, { name: 'Excel Export' }],
                            },
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Export');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('aria-label')).toBe('Export');
        });

        test('renders icon name strings as icon elements in menu items', async () => {
            const api = gridMgr.createGrid('menu-icons', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        {
                            toolbarItem: 'menu',
                            toolbarItemParams: {
                                label: 'Export',
                                icon: 'save',
                                menuItems: [
                                    { name: 'CSV Export', icon: 'csvExport' },
                                    { name: 'Excel Export', icon: 'excelExport' },
                                ],
                            },
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Export')!;
            button.click();

            const menuOptions = gridDiv.querySelectorAll('.ag-popup .ag-menu-option');
            expect(menuOptions).toHaveLength(2);

            const firstIcon = menuOptions[0].querySelector('.ag-menu-option-icon .ag-icon');
            expect(firstIcon).not.toBeNull();

            const secondIcon = menuOptions[1].querySelector('.ag-menu-option-icon .ag-icon');
            expect(secondIcon).not.toBeNull();
        });

        test('renders HTML strings as innerHTML in menu item icons', async () => {
            const api = gridMgr.createGrid('menu-html-icons', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        {
                            toolbarItem: 'menu',
                            toolbarItemParams: {
                                label: 'Actions',
                                menuItems: [{ name: 'Custom', icon: '<span class="custom-icon">X</span>' }],
                            },
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Actions')!;
            button.click();

            const iconWrapper = gridDiv.querySelector('.ag-popup .ag-menu-option-icon');
            expect(iconWrapper).not.toBeNull();
            expect(iconWrapper!.querySelector('.custom-icon')).not.toBeNull();
            expect(iconWrapper!.querySelector('.custom-icon')!.textContent).toBe('X');
        });

        test('opens popup menu with custom items when clicked', async () => {
            const api = gridMgr.createGrid('menu-click', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        {
                            toolbarItem: 'menu',
                            toolbarItemParams: {
                                label: 'Actions',
                                menuItems: [{ name: 'Action A' }, { name: 'Action B' }],
                            },
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = getToolbarButton(gridDiv, 'Actions')!;
            button.click();

            const popupParent = gridDiv.querySelector('.ag-popup');
            const menuItems = popupParent?.querySelectorAll('.ag-menu-option') ?? [];
            expect(menuItems).toHaveLength(2);
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
        test('renders row group drop zone when configured in toolbar', async () => {
            const api = gridMgr.createGrid('row-group-panel-render', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['rowGroupPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
        });

        test('renders regardless of rowGroupPanelShow setting', async () => {
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
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
        });
    });

    describe('pivotPanel', () => {
        test('renders pivot drop zone when configured in toolbar', async () => {
            const api = gridMgr.createGrid('pivot-panel-render', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['pivotPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
        });

        test('renders regardless of pivotPanelShow setting', async () => {
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
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
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
            expect(input!.placeholder).toBe('Filter...');
            expect(input!.getAttribute('aria-label')).toBe('Filter');
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
            expect(input!.placeholder).toBe('Find...');
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
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');
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
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');
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

    describe('console warnings for missing modules', () => {
        test('logs warning when columnsPanel is configured without sidebar columns panel', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridMgr.createGrid('columns-panel-warn', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['columnsPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button[title="Columns"]');
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #299'),
                expect.stringContaining('columnsPanel'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('logs warning when filtersPanel is configured without sidebar filters panel', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridMgr.createGrid('filters-panel-warn', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['filtersPanel'],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button[title="Filters"]');
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #300'),
                expect.stringContaining('filtersPanel'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });
    });

    describe('console warnings for missing feature modules', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides csvExport and logs warning when CsvExportModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('csv-export-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['csvExport'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button[title="CSV Export"]');
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('csvExport'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('hides excelExport and logs warning when ExcelExportModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('excel-export-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['excelExport'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button[title="Excel Export"]');
            expect(button).not.toBeNull();
            expect(button!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('excelExport'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('hides quickFilter and logs warning when QuickFilterModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('quick-filter-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['quickFilter'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-input');
            expect(item).not.toBeNull();
            expect(item!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('quickFilter'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('hides find and logs warning when FindModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('find-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['find'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-find');
            expect(item).not.toBeNull();
            expect(item!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('find'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('hides rowGroupPanel and logs warning when RowGroupingModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('row-group-panel-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['rowGroupPanel'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-panel');
            expect(item).not.toBeNull();
            expect(item!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('rowGroupPanel'),
                expect.anything()
            );

            warnSpy.mockRestore();
        });

        test('hides pivotPanel and logs warning when PivotModule is not registered', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('pivot-panel-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['pivotPanel'] },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-panel');
            expect(item).not.toBeNull();
            expect(item!.style.display).toBe('none');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #303'),
                expect.stringContaining('pivotPanel'),
                expect.anything()
            );

            warnSpy.mockRestore();
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

        test('rowGroupPanel and pivotPanel render independently of rowGroupPanelShow/pivotPanelShow', async () => {
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
                        { toolbarItem: 'quickFilter', alignment: 'right' },
                        { toolbarItem: 'find', alignment: 'right' },
                        'separator',
                        { toolbarItem: 'columnsPanel', alignment: 'right' },
                        { toolbarItem: 'filtersPanel', alignment: 'right' },
                        { toolbarItem: 'autoSizeAll', alignment: 'right' },
                        'separator',
                        { toolbarItem: 'csvExport', alignment: 'right' },
                        'separator',
                        { toolbarItem: 'resetColumns', alignment: 'right', display: 'iconAndLabel' },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;

            // Both rowGroupPanel and pivotPanel should render regardless of rowGroupPanelShow/pivotPanelShow
            const toolbarPanels = toolbar.querySelectorAll('.ag-toolbar-panel');
            expect(toolbarPanels).toHaveLength(2);

            const dropZones = toolbar.querySelectorAll('.ag-column-drop');
            expect(dropZones).toHaveLength(2);
        });
    });
});
