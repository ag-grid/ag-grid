import { ClientSideRowModelModule, CustomFilterModule, QuickFilterModule } from 'ag-grid-community';
import {
    ContextMenuModule,
    FindModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar panel items (rowGroupPanel and pivotPanel)', () => {
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
            CustomFilterModule,
        ],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('rowGroupPanel', () => {
        test('renders row group drop zone when configured in toolbar', async () => {
            const api = gridMgr.createGrid('row-group-panel-render', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['agRowGroupPanelToolbarItem'],
                },
            });
            await new GridColumns(api, `renders row group drop zone when configured in toolbar setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `renders row group drop zone when configured in toolbar setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
            await new GridRows(api, `renders row group drop zone when configured in toolbar final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('renders regardless of rowGroupPanelShow setting', async () => {
            const api = gridMgr.createGrid('row-group-panel-never', {
                columnDefs: [{ field: 'name', enableRowGroup: true }],
                rowData: [{ name: 'Alice' }],
                rowGroupPanelShow: 'never',
                toolbar: {
                    items: ['agRowGroupPanelToolbarItem'],
                },
            });
            await new GridColumns(api, `renders regardless of rowGroupPanelShow setting setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `renders regardless of rowGroupPanelShow setting setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
            await new GridRows(api, `renders regardless of rowGroupPanelShow setting final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });
    });

    describe('pivotPanel', () => {
        test('renders pivot drop zone when configured in toolbar', async () => {
            const api = gridMgr.createGrid('pivot-panel-render', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: ['agPivotPanelToolbarItem'],
                },
            });
            await new GridColumns(api, `renders pivot drop zone when configured in toolbar setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `renders pivot drop zone when configured in toolbar setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
            await new GridRows(api, `renders pivot drop zone when configured in toolbar final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('renders regardless of pivotPanelShow setting', async () => {
            const api = gridMgr.createGrid('pivot-panel-never', {
                columnDefs: [{ field: 'name', enablePivot: true }],
                rowData: [{ name: 'Alice' }],
                pivotPanelShow: 'never',
                toolbar: {
                    items: ['agPivotPanelToolbarItem'],
                },
            });
            await new GridColumns(api, `renders regardless of pivotPanelShow setting setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `renders regardless of pivotPanelShow setting setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbarLeft = gridDiv.querySelector('.ag-toolbar')!;
            const dropZone = toolbarLeft.querySelector('.ag-column-drop');
            expect(dropZone).not.toBeNull();
            await new GridRows(api, `renders regardless of pivotPanelShow setting final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });
    });

    describe('rowGroupPanelShow/pivotPanelShow integration', () => {
        test('rowGroupPanel and pivotPanel render independently of rowGroupPanelShow/pivotPanelShow', async () => {
            const api = gridMgr.createGrid('full-toolbar-rowgroup-never', {
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
                        'agRowGroupPanelToolbarItem',
                        'agPivotPanelToolbarItem',
                        { toolbarItem: 'agQuickFilterToolbarItem', alignment: 'right' },
                        { toolbarItem: 'agFindToolbarItem', alignment: 'right' },
                    ],
                },
            });
            await new GridColumns(
                api,
                `rowGroupPanel and pivotPanel render independently of rowGroupPanelShow/pivotPane setup`
            ).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200 flex:1
                ├── country "Country" width:200 flex:1
                ├── sport "Sport" width:200 flex:1
                ├── year "Year" width:100 flex:1
                ├── gold "Gold" width:100 flex:1
                ├── silver "Silver" width:100 flex:1
                ├── bronze "Bronze" width:100 flex:1
                └── total "Total" width:100 flex:1
            `);
            await new GridRows(
                api,
                `rowGroupPanel and pivotPanel render independently of rowGroupPanelShow/pivotPane setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Alice" country:"US" sport:"Running" year:2024 gold:1 silver:0 bronze:0 total:1
            `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector('.ag-toolbar')!;

            // Both rowGroupPanel and pivotPanel should render regardless of rowGroupPanelShow/pivotPanelShow
            const toolbarPanels = toolbar.querySelectorAll('.ag-toolbar-panel');
            expect(toolbarPanels).toHaveLength(2);

            const dropZones = toolbar.querySelectorAll('.ag-column-drop');
            expect(dropZones).toHaveLength(2);
            await new GridRows(
                api,
                `rowGroupPanel and pivotPanel render independently of rowGroupPanelShow/pivotPane final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Alice" country:"US" sport:"Running" year:2024 gold:1 silver:0 bronze:0 total:1
            `);
        });
    });

    describe('embedded drop zone focus behaviour', () => {
        test('Tab inside a toolbar row group panel does not force the next grid container', async () => {
            // The standalone (above-grid) drop zones register their own focus container
            // listener that intercepts Tab and moves to the next grid container when no
            // next focusable element is found inside the panel. That hand-off is wrong
            // when the drop zone is embedded in the Toolbar — it would skip subsequent
            // toolbar items. Embedded drop zones must leave Tab to native flow.
            const api = gridMgr.createGrid('embedded-rowgroup-tab', {
                columnDefs: [{ field: 'name', enableRowGroup: true, rowGroup: true, hide: true }],
                rowData: [{ name: 'Alice' }],
                toolbar: {
                    items: [
                        'agRowGroupPanelToolbarItem',
                        { key: 'after', label: 'After', icon: 'maximize', action: () => {} },
                    ],
                },
            });
            await new GridColumns(
                api,
                `Tab inside a toolbar row group panel does not force the next grid container setup`
            ).checkColumns(`
                CENTER
                └── ag-Grid-AutoColumn "Group" width:200
            `);
            await new GridRows(api, `Tab inside a toolbar row group panel does not force the next grid container setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-name-Alice ag-Grid-AutoColumn:"Alice"
                    · └── LEAF hidden id:0 name:"Alice"
                `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            const panel = toolbar.querySelector<HTMLElement>('.ag-column-drop')!;

            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            panel.dispatchEvent(event);

            // The embedded panel no longer hijacks Tab to jump to the next grid container.
            // Without preventDefault, native tab flow moves focus to the next focusable
            // element in DOM — which, inside the toolbar, is the following action button.
            expect(event.defaultPrevented).toBe(false);
            await new GridRows(
                api,
                `Tab inside a toolbar row group panel does not force the next grid container final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-name-Alice ag-Grid-AutoColumn:"Alice"
                · └── LEAF hidden id:0 name:"Alice"
            `);
        });

        test('Tab inside a toolbar pivot panel does not force the next grid container', async () => {
            // Pivot toolbar item has its own wiring around pivot mode / visibility; verify
            // the embedded flag reaches it too. A rowGroup column + value column are
            // required for pivotMode to produce any rows — without them the pivot output
            // is empty and `firstDataRendered` never fires.
            const api = gridMgr.createGrid('embedded-pivot-tab', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'name', enablePivot: true, pivot: true },
                    { field: 'value', enableValue: true, aggFunc: 'sum' },
                ],
                rowData: [{ country: 'US', name: 'Alice', value: 1 }],
                pivotMode: true,
                toolbar: {
                    items: [
                        'agPivotPanelToolbarItem',
                        { key: 'after', label: 'After', icon: 'maximize', action: () => {} },
                    ],
                },
            });
            await new GridColumns(api, `Tab inside a toolbar pivot panel does not force the next grid container setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └─┬ "Alice" GROUP
                      └── pivot_name_Alice_value "Value" width:200 columnGroupShow:open
                `);
            await new GridRows(api, `Tab inside a toolbar pivot panel does not force the next grid container setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID pivot_name_Alice_value:1
                    └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_name_Alice_value:1
                    · └── LEAF hidden id:0 pivot_name_Alice_value:1
                `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const toolbar = gridDiv.querySelector<HTMLElement>('.ag-toolbar')!;
            const panel = toolbar.querySelector<HTMLElement>('.ag-column-drop')!;

            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            panel.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(false);
            await new GridRows(
                api,
                `Tab inside a toolbar pivot panel does not force the next grid container final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_name_Alice_value:1
                └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_name_Alice_value:1
                · └── LEAF hidden id:0 pivot_name_Alice_value:1
            `);
        });
    });

    describe('console error for missing feature modules', () => {
        const minimalGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, ToolbarModule],
        });

        afterEach(() => {
            minimalGridMgr.reset();
        });

        test('hides rowGroupPanel and logs error when RowGroupingModule is not registered', async () => {
            const errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('row-group-panel-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agRowGroupPanelToolbarItem'] },
            });
            await new GridColumns(
                api,
                `hides rowGroupPanel and logs error when RowGroupingModule is not registered setup`
            ).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `hides rowGroupPanel and logs error when RowGroupingModule is not registered setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-panel');
            expect(item).not.toBeNull();
            expect(item!.classList.contains('ag-hidden')).toBe(true);

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #302'),
                expect.stringContaining('agRowGroupPanelToolbarItem'),
                expect.anything()
            );

            errorSpy.mockRestore();
            await new GridRows(
                api,
                `hides rowGroupPanel and logs error when RowGroupingModule is not registered final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice"
            `);
        });

        test('hides pivotPanel and logs error when PivotModule is not registered', async () => {
            const errorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

            const api = minimalGridMgr.createGrid('pivot-panel-no-module', {
                columnDefs: [{ field: 'name' }],
                rowData: [{ name: 'Alice' }],
                toolbar: { items: ['agPivotPanelToolbarItem'] },
            });
            await new GridColumns(api, `hides pivotPanel and logs error when PivotModule is not registered setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `hides pivotPanel and logs error when PivotModule is not registered setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `
            );

            await waitForEvent('firstDataRendered', api);

            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const item = gridDiv.querySelector<HTMLElement>('.ag-toolbar-panel');
            expect(item).not.toBeNull();
            expect(item!.classList.contains('ag-hidden')).toBe(true);

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #302'),
                expect.stringContaining('agPivotPanelToolbarItem'),
                expect.anything()
            );

            errorSpy.mockRestore();
            await new GridRows(api, `hides pivotPanel and logs error when PivotModule is not registered final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice"
                `);
        });
    });
});
