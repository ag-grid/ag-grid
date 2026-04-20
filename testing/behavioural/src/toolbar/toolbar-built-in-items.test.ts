import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import {
    ContextMenuModule,
    FindModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar Built-in Items', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ContextMenuModule,
            FindModule,
            PivotModule,
            QuickFilterModule,
            RowGroupingModule,
            RowGroupingPanelModule,
            ToolbarModule,
        ],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('separator', () => {
        test('renders separator elements between items', async () => {
            const api = gridMgr.createGrid('separator-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['find', 'separator', 'quickFilter'],
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

    describe('action button', () => {
        test('renders a button with icon and tooltip from label', async () => {
            const api = gridMgr.createGrid('action-button-render', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        {
                            key: 'autoSizeAll',
                            label: 'Auto Size All',
                            icon: 'maximize',
                            action: () => {},
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button');
            expect(button).not.toBeNull();
            expect(button!.getAttribute('title')).toBe('Auto Size All');
            expect(button!.getAttribute('aria-label')).toBe('Auto Size All');
            expect(button!.querySelector('.ag-icon')).not.toBeNull();
            expect(button!.querySelector('.ag-toolbar-button-label')!.classList.contains('ag-hidden')).toBe(true);
        });

        test('shows label text when display is iconAndLabel', async () => {
            const api = gridMgr.createGrid('action-button-icon-and-label', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    display: 'iconAndLabel',
                    items: [
                        {
                            key: 'autoSizeAll',
                            label: 'Auto Size All',
                            icon: 'maximize',
                            action: () => {},
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const label = gridDiv.querySelector<HTMLElement>('.ag-toolbar-button-label')!;
            expect(label.classList.contains('ag-hidden')).toBe(false);
            expect(label.textContent).toBe('Auto Size All');
        });

        test('invokes action with grid api, context and key on click', async () => {
            const action = vitest.fn();
            const api = gridMgr.createGrid('action-button-click', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                context: { userContext: 'hello' },
                toolbar: {
                    items: [
                        {
                            key: 'autoSizeAll',
                            label: 'Auto Size All',
                            icon: 'maximize',
                            action,
                        },
                    ],
                },
            });

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const button = gridDiv.querySelector<HTMLButtonElement>('.ag-toolbar-button')!;
            button.click();

            expect(action).toHaveBeenCalledTimes(1);
            const [params] = action.mock.calls[0];
            expect(params.api).toBe(api);
            expect(params.context).toEqual({ userContext: 'hello' });
            expect(params.key).toBe('autoSizeAll');
        });
    });

    describe('console warnings for missing feature modules', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
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
                expect.stringContaining('warning #302'),
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
                expect.stringContaining('warning #302'),
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
                expect.stringContaining('warning #302'),
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
                expect.stringContaining('warning #302'),
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
                ContextMenuModule,
                FindModule,
                PivotModule,
                QuickFilterModule,
                RowGroupingModule,
                RowGroupingPanelModule,
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
                toolbar: {
                    items: [
                        'rowGroupPanel',
                        'pivotPanel',
                        { toolbarItem: 'quickFilter', alignment: 'right' },
                        { toolbarItem: 'find', alignment: 'right' },
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
