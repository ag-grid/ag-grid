import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    setRowDataChecked,
    waitForEvent,
} from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import type { MockInstance } from 'vitest';

import type { GetDetailRowDataParams, GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    RowAutoHeightModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

describe('ag-grid master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, MasterDetailModule, RowAutoHeightModule],
    });
    let consoleErrorSpy: MockInstance | undefined;
    let consoleWarnSpy: MockInstance | undefined;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleErrorSpy?.mockRestore();
        consoleWarnSpy?.mockRestore();
    });

    test('masterDetail not expanded', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            masterDetail: true,
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── master collapsed id:0 k:"1"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── k "K" width:200
        `);
    });

    test('masterDetail all expanded', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            masterDetail: true,
            rowData: [
                { k: '1', records: [{ x: 'a' }] },
                { k: '2', records: [{ x: 'a' }, { x: 'b' }, { x: 'c' }] },
                { k: '3', records: [{ x: 'x' }, { x: 'y' }] },
            ],
            groupDefaultExpanded: -1,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:0 k:"1"
            │ └─┬ detail id:detail_0 k:"1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:0 x:"a"
            ├─┬ master id:1 k:"2"
            │ └─┬ detail id:detail_1 k:"2"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · ├── LEAF id:0 x:"a"
            │ · · ├── LEAF id:1 x:"b"
            │ · · └── LEAF id:2 x:"c"
            └─┬ master id:2 k:"3"
            · └─┬ detail id:detail_2 k:"3"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"x"
            · · · └── LEAF id:1 x:"y"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── k "K" width:200
        `);
    });

    test('masterDetail property is reactive', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }, { x: 'b' }] }],
            groupDefaultExpanded: -1,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 k:"1"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        api.setGridOption('masterDetail', true);
        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"a"
            · · · └── LEAF id:1 x:"b"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        api.setGridOption('masterDetail', false);
        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 k:"1"
        `);
    });

    test('masterDetail set rowData (without id)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        setRowDataChecked(api, [{ k: '2', records: [{ x: 'a' }, { x: 'b' }] }]);

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"2"
            · └─┬ detail id:detail_0 k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"a"
            · · · └── LEAF id:1 x:"b"
        `);
    });

    test('masterDetail set rowData (with id)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [
                {
                    id: 'master',
                    k: '1',
                    records: [
                        { id: 'detail1', x: 1 },
                        { id: 'detail2', x: 1 },
                    ],
                },
            ],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                    getRowId: ({ data }: GetRowIdParams) => data.id,
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:master k:"1"
            · └─┬ detail id:detail_master k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:detail1 x:1
            · · · └── LEAF id:detail2 x:1
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        setRowDataChecked(api, [
            {
                id: 'master',
                k: '2',
                records: [{ id: 'detail1', x: 2 }],
            },
        ]);

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:master k:"2"
            · └─┬ detail id:detail_master k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:detail1 x:2
        `);
    });

    test('masterDetail transactions', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [
                {
                    id: 'x0',
                    k: 'a0',
                    records: [
                        { id: 'y1', x: 'a1' },
                        { id: 'y2', x: 'a2' },
                    ],
                },
                {
                    id: 'x1',
                    k: 'a0',
                    records: [
                        { id: 'y1', x: 'a1' },
                        { id: 'y2', x: 'a2' },
                    ],
                },
            ],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                    getRowId: ({ data }: GetRowIdParams) => data.id,
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:x0 k:"a0"
            │ └─┬ detail id:detail_x0 k:"a0"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · ├── LEAF id:y1 x:"a1"
            │ · · └── LEAF id:y2 x:"a2"
            └─┬ master id:x1 k:"a0"
            · └─┬ detail id:detail_x1 k:"a0"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:y1 x:"a1"
            · · · └── LEAF id:y2 x:"a2"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        applyTransactionChecked(api, {
            remove: [{ id: 'x0' }],
            add: [{ id: 'x2', k: 'a2', records: [{ id: 's', x: 't' }] }],
            update: [{ id: 'x1', k: 'a1', records: [{ id: 'y1', x: 'a1' }] }],
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:x1 k:"a1"
            │ └─┬ detail id:detail_x1 k:"a1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:y1 x:"a1"
            └─┬ master id:x2 k:"a2"
            · └─┬ detail id:detail_x2 k:"a2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:s x:"t"
        `);
    });

    test('masterDetail expand/collapse', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.forEachNode((node) => {
            node.setExpanded(false, undefined, true);
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── master collapsed id:0 k:"1"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.forEachNode((node) => {
            node.setExpanded(true, undefined, true);
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);
    });

    test('expandAll/collapseAll on the master grid does not warn about a destroyed detail grid', async () => {
        // `expandOrCollapseAll` listeners are dispatched asynchronously, so a thrown diagnostic would land
        // outside the test body: suppress the throw for #26 and assert on the console instead.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [26] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const expanded = `
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `;
        const collapsed = `
            ROOT id:ROOT_NODE_ID
            └── master collapsed id:0 k:"1"
        `;

        // the master-grid listeners are registered in the detail grid's firstDataRendered callback
        api.expandAll();
        await new GridRows(api, 'expanded').check(expanded);
        await waitForEvent('firstDataRendered', api.getDetailGridInfo('detail_0')!.api!);

        // destroys the detail grid
        api.collapseAll();
        await new GridRows(api, 'collapsed').check(collapsed);

        api.expandAll();
        await new GridRows(api, 'expanded again').check(expanded);

        api.collapseAll();
        await new GridRows(api, 'collapsed again').check(collapsed);

        // a stale listener would ride on the async `expandOrCollapseAll` dispatch, so flush it before asserting
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    test('a detail row kept while collapsed is shown again sized to the columns as they are now', async () => {
        const details: HTMLElement[] = [];
        class Detail {
            private readonly eGui = document.createElement('div');
            constructor() {
                details.push(this.eGui);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'l', pinned: 'left', width: 100 },
                { field: 'v', width: 200 },
            ],
            rowData: [{ id: '1', l: 'x', v: 'y' }],
            getRowId: (params) => params.data.id,
            masterDetail: true,
            isRowMaster: () => true,
            detailCellRenderer: Detail,
            keepDetailRows: true,
            embedFullWidthRows: true,
        });
        const sectionWidths = () =>
            ['ag-grid-pinned-left-cells', 'ag-grid-scrolling-cells', 'ag-grid-pinned-right-cells'].map(
                (section) =>
                    getGridElement(api)!.querySelector<HTMLElement>(`.ag-full-width-row .${section}`)?.style.width
            );
        const master = api.getRowNode('1')!;

        master.setExpanded(true);
        await asyncSetTimeout(0);
        expect(sectionWidths()).toEqual(['0px', '300px', '0px']);
        const built = details.length;

        master.setExpanded(false);
        await asyncSetTimeout(0);
        api.setColumnWidths([{ key: 'l', newWidth: 150 }]);
        master.setExpanded(true);
        await asyncSetTimeout(0);
        expect(sectionWidths()).toEqual(['0px', '350px', '0px']);
        // the kept row is shown again, not built anew
        expect(details.length).toBe(built);
        expect(getGridElement(api)!.querySelector('.ag-full-width-row')!.contains(details[0])).toBe(true);

        // a column refresh lays the hidden row out too
        master.setExpanded(false);
        await asyncSetTimeout(0);
        api.setColumnsVisible(['v'], false);
        master.setExpanded(true);
        await asyncSetTimeout(0);
        expect(sectionWidths()).toEqual(['0px', '150px', '0px']);
        expect(details.length).toBe(built);
    });

    test('with keepDetailRows, rows whose id is an object property name are drawn and redrawn', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }],
            rowData: [
                { id: 'constructor', k: 'a' },
                { id: 'toString', k: 'b' },
            ],
            getRowId: (params) => params.data.id,
            masterDetail: true,
            keepDetailRows: true,
        });
        const rowElement = (id: string) => getGridElement(api)!.querySelector(`.ag-row[row-id="${id}"]`);
        await new GridRows(api, 'drawn').check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:constructor k:"a"
            └── master collapsed id:toString k:"b"
        `);
        const drawnRow = rowElement('constructor');

        api.redrawRows({ rowNodes: [api.getRowNode('constructor')!] });
        await asyncSetTimeout(0);
        const redrawnRow = rowElement('constructor');
        expect({ shown: redrawnRow !== null, replaced: redrawnRow !== drawnRow }).toEqual({
            shown: true,
            replaced: true,
        });
    });

    test('a kept detail row whose master row data was replaced reports virtualRowRemoved once the cache drops it', async () => {
        const removedDetails: string[] = [];
        class Detail {
            private readonly eGui = document.createElement('div');
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: 'old' }],
            masterDetail: true,
            isRowMaster: () => true,
            detailCellRenderer: Detail,
            keepDetailRows: true,
            keepDetailRowsCount: 1,
            onVirtualRowRemoved: (event) => {
                if (event.node.detail) {
                    removedDetails.push(event.node.data.k);
                }
            },
        });

        api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await asyncSetTimeout(0);
        api.getDisplayedRowAtIndex(0)!.setExpanded(false);
        await asyncSetTimeout(0);

        // the new master row takes the old one's generated id
        api.setGridOption('rowData', [{ k: 'new' }]);
        api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await asyncSetTimeout(0);
        api.getDisplayedRowAtIndex(0)!.setExpanded(false);
        await asyncSetTimeout(0);

        await waitFor(() => expect(removedDetails).toEqual(['old']));
    });

    test('a kept detail row whose master row data was replaced leaves the new detail grid registered when the cache drops it, until its row is removed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: 'old', kids: [{ c: 1 }] }],
            masterDetail: true,
            isRowMaster: () => true,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'c' }] },
                getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(params.data.kids),
            },
            keepDetailRows: true,
            keepDetailRowsCount: 1,
        });
        const setExpanded = async (expanded: boolean) => {
            api.getDisplayedRowAtIndex(0)!.setExpanded(expanded);
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(expanded ? 2 : 1));
        };
        await setExpanded(true);
        await setExpanded(false);
        // the new master row takes the old one's generated id
        api.setGridOption('rowData', [{ k: 'new', kids: [{ c: 2 }] }]);
        await setExpanded(true);
        await waitFor(() => expect(api.getDetailGridInfo('detail_0')?.id).toBe('detail_0'));
        const detailGridInfo = api.getDetailGridInfo('detail_0');

        // caching the new detail row drops the old one
        await setExpanded(false);
        await setExpanded(true);

        expect(api.getDetailGridInfo('detail_0')).toBe(detailGridInfo);

        api.setGridOption('rowData', []);
        await waitFor(() => expect(api.getDetailGridInfo('detail_0')).toBeUndefined());
    });

    test('redrawing a kept detail row removes it while collapsed and replaces it while shown, and a removed master row is destroyed', async () => {
        let built = 0;
        let destroyed = 0;
        const removed: string[] = [];
        class Detail {
            private readonly eGui = document.createElement('div');
            constructor() {
                ++built;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                return true;
            }
            public destroy(): void {
                ++destroyed;
            }
        }
        const fullWidthRowCount = () => getGridElement(api)!.querySelectorAll('.ag-full-width-row').length;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }],
            rowData: [{ id: '1', k: 'a' }],
            getRowId: (params) => params.data.id,
            masterDetail: true,
            isRowMaster: () => true,
            detailCellRenderer: Detail,
            keepDetailRows: true,
            onVirtualRowRemoved: (event) => removed.push(event.node.detail ? 'detail' : event.node.id!),
        });
        const master = api.getRowNode('1')!;
        master.setExpanded(true);
        await asyncSetTimeout(0);
        const detail = api.getDisplayedRowAtIndex(1)!;
        master.setExpanded(false);
        await asyncSetTimeout(0);

        api.redrawRows({ rowNodes: [detail] });
        await waitFor(() => expect(removed).toEqual(['detail']));
        expect({ fullWidthRows: fullWidthRowCount(), destroyed }).toEqual({ fullWidthRows: 0, destroyed: 1 });

        master.setExpanded(true);
        await asyncSetTimeout(0);
        expect({ fullWidthRows: fullWidthRowCount(), built }).toEqual({ fullWidthRows: 1, built: 2 });

        // shown again from the cache, then redrawn while shown
        master.setExpanded(false);
        await asyncSetTimeout(0);
        master.setExpanded(true);
        await asyncSetTimeout(0);
        expect(built).toBe(2);
        api.redrawRows({ rowNodes: [detail] });
        await waitFor(() => expect(removed).toEqual(['detail', 'detail']));
        expect({ fullWidthRows: fullWidthRowCount(), built }).toEqual({ fullWidthRows: 1, built: 3 });

        api.setGridOption('rowData', [{ id: '2', k: 'b' }]);
        await waitFor(() => expect(removed).toContain('1'));
        expect(getGridElement(api)!.querySelector('.ag-row[row-id="1"]')).toBeNull();
    });

    // The detail sizes itself to its grid: working the row heights out again must not put it back to its placeholder.
    describe('an auto-height detail row', () => {
        const DETAIL_HEIGHT = 150;
        const TALL_CELL_HEIGHT = 60;

        beforeAll(() => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) => {
                if (el.classList.contains('ag-details-row')) {
                    return DETAIL_HEIGHT;
                }
                return el.classList.contains('ag-cell-wrapper') && el.closest('[col-id="tall"]')
                    ? TALL_CELL_HEIGHT
                    : undefined;
            };
        });

        afterAll(() => {
            mockGridLayout.resetOptions();
        });

        const createAutoHeightDetailGrid = async (columnDefs: GridOptions['columnDefs'] = [{ field: 'k' }]) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                masterDetail: true,
                detailRowAutoHeight: true,
                rowData: [{ k: '1', records: [{ x: 'a' }] }],
                detailCellRendererParams: {
                    detailGridOptions: { columnDefs: [{ field: 'x' }] },
                    getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback(params.data.records),
                },
            });
            api.getDisplayedRowAtIndex(0)!.setExpanded(true);
            const detailHeight = () => api.getDisplayedRowAtIndex(1)!.rowHeight!;
            await waitFor(() => expect(detailHeight()).toBeGreaterThanOrEqual(DETAIL_HEIGHT));
            return { api, detailHeight, measured: detailHeight() };
        };

        test.each([
            ['a rowHeight change', (api: GridApi) => api.setGridOption('rowHeight', 30)],
            ['resetRowHeights', (api: GridApi) => api.resetRowHeights()],
        ])('keeps its measured height through %s', async (_name, workHeightsOut) => {
            const { api, detailHeight, measured } = await createAutoHeightDetailGrid();

            workHeightsOut(api);
            await asyncSetTimeout(0);

            expect(detailHeight()).toBe(measured);
        });

        test('keeps its measured height when the last auto-height column of the master grid goes', async () => {
            const { api, detailHeight, measured } = await createAutoHeightDetailGrid([
                { field: 'k' },
                { colId: 'tall', autoHeight: true },
            ]);
            const masterHeight = () => api.getDisplayedRowAtIndex(0)!.rowHeight;
            await waitFor(() => expect(masterHeight()).toBe(TALL_CELL_HEIGHT));

            api.setColumnsVisible(['tall'], false);
            await waitFor(() => expect(masterHeight()).toBe(42));

            expect(detailHeight()).toBe(measured);
        });
    });
});
