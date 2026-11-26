import { waitFor } from '@testing-library/dom';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    getGridHTMLElement,
} from 'ag-test-utils';
import { onTestFinished } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions, IRowNode, ModelUpdatedEvent } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    GridStateModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    forEachColDef,
} from 'ag-grid-community';
import { AdvancedFilterModule, RowGroupingModule } from 'ag-grid-enterprise';

describe('Auto-Generate Column Defs', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AutoGenerateColumnsModule, TextFilterModule, NumberFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(gridOptions: GridOptions): GridApi {
        return gridsManager.createGrid('myGrid', gridOptions);
    }

    describe('basic column generation', () => {
        test('generates columns from initial rowData', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [
                    { name: 'Alice', age: 30, country: 'US' },
                    { name: 'Bob', age: 25, country: 'UK' },
                ],
            });

            await new GridColumns(api, 'auto-generated').checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├── age "Age" width:200
                └── country "Country" width:200
            `);

            await new GridRows(api, 'row data renders').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Alice" age:30 country:"US"
                └── LEAF id:1 name:"Bob" age:25 country:"UK"
            `);
        });

        test('no columns when rowData is null', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: null,
            });

            await new GridColumns(api, 'no data').checkColumns('empty');
        });

        test('no columns when rowData is empty array', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [],
            });

            await new GridColumns(api, 'empty array').checkColumns('empty');
        });
    });

    describe('with an editing module registered', () => {
        const editGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AutoGenerateColumnsModule, TextEditorModule],
        });

        afterEach(() => {
            editGridsManager.reset();
        });

        test('generates columns from initial rowData', async () => {
            const api = await editGridsManager.createGridAndWait('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', age: 30 }],
            });

            await new GridColumns(api, 'auto-generated with editor module').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });
    });

    describe('updating rowData after creation', () => {
        test('setGridOption replaces columns when data shape changes', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                └── a "A" width:200
            `);

            api.setGridOption('rowData', [{ x: 10, y: 20 }]);

            await new GridColumns(api, 'after update').checkColumns(`
                CENTER
                ├── x "X" width:200
                └── y "Y" width:200
            `);
        });

        test('updateGridOptions replaces columns when data shape changes', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }],
            });

            api.updateGridOptions({ rowData: [{ p: 1, q: 2, r: 3 }] });

            await new GridColumns(api, 'after update').checkColumns(`
                CENTER
                ├── p "P" width:200
                ├── q "Q" width:200
                └── r "R" width:200
            `);
        });

        test('setting rowData after initially null generates columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: null,
            });

            await new GridColumns(api, 'before data').checkColumns('empty');

            api.setGridOption('rowData', [{ name: 'Alice', age: 30 }]);

            await new GridColumns(api, 'after data').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
        });
    });

    describe('columns and rows of the rowData call that generates them', () => {
        /** Reads the column ids, each row node's index in `known` (-1 if foreign) and the displayed count. */
        function readGrid(api: GridApi, known: object[]) {
            const rowIndexes: number[] = [];
            api.forEachNode((node) => rowIndexes.push(known.indexOf(node.data)));
            return {
                columnIds: api.getAllGridColumns().map((col) => col.getColId()),
                rowIndexes,
                displayedRowCount: api.getDisplayedRowCount(),
            };
        }

        test('setGridOption rowData on a grid created with empty rowData generates the columns and shows every row', async () => {
            const rows = [
                { id: '1', a: 1, b: 'x' },
                { id: '2', a: 2, b: 'y' },
            ];
            const api = createGrid({ autoGenerateColumnDefs: true, rowData: [] });
            await asyncSetTimeout(0);
            expect(readGrid(api, rows)).toEqual({ columnIds: [], rowIndexes: [], displayedRowCount: 0 });

            api.setGridOption('rowData', rows);

            await waitFor(
                () =>
                    expect(readGrid(api, rows)).toEqual({
                        columnIds: ['id', 'a', 'b'],
                        rowIndexes: [0, 1],
                        displayedRowCount: 2,
                    }),
                { timeout: 1000 }
            );
        });

        test('updateGridOptions rowData with another option on a grid created with empty rowData generates the columns and shows every row', async () => {
            const rows = [
                { id: '1', a: 1, b: 'x' },
                { id: '2', a: 2, b: 'y' },
            ];
            const api = createGrid({ autoGenerateColumnDefs: true, rowData: [] });
            await asyncSetTimeout(0);
            expect(readGrid(api, rows)).toEqual({ columnIds: [], rowIndexes: [], displayedRowCount: 0 });

            api.updateGridOptions({ rowData: rows, suppressMovableColumns: true });

            await waitFor(
                () =>
                    expect(readGrid(api, rows)).toEqual({
                        columnIds: ['id', 'a', 'b'],
                        rowIndexes: [0, 1],
                        displayedRowCount: 2,
                    }),
                { timeout: 1000 }
            );
        });

        test('turning autoGenerateColumnDefs on with new rowData shows only the new rows, with columns from their first row', async () => {
            const rowsA = [
                { id: '1', a: 1, b: 'x' },
                { id: '2', a: 2, b: 'y' },
            ];
            const rowsB = [
                { id: '5', c: 5, b: 'p' },
                { id: '6', c: 6, b: 'q' },
                { id: '7', c: 7, b: 'r' },
            ];
            const api = createGrid({ rowData: rowsA });
            await asyncSetTimeout(0);
            expect(api.getGridOption('rowData')).toBe(rowsA);
            expect(readGrid(api, [...rowsA, ...rowsB]).columnIds).toEqual([]);

            api.updateGridOptions({ autoGenerateColumnDefs: true, rowData: rowsB });

            await waitFor(
                () =>
                    expect(readGrid(api, [...rowsA, ...rowsB])).toEqual({
                        columnIds: ['id', 'c', 'b'],
                        rowIndexes: [2, 3, 4],
                        displayedRowCount: 3,
                    }),
                { timeout: 1000 }
            );
        });

        test('rowData with a column default in one call builds the generated columns once and keeps the initial state, in either key order', async () => {
            const stateGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, AutoGenerateColumnsModule, GridStateModule],
            });
            onTestFinished(() => stateGridsManager.reset());
            const rows = [
                { id: '1', c: 1, b: 'x' },
                { id: '2', c: 2, b: 'y' },
                { id: '3', c: 3, b: 'z' },
            ];
            const defaultColDef = { width: 150 };

            for (const options of [
                { defaultColDef, rowData: rows },
                { rowData: rows, defaultColDef },
            ]) {
                const api = stateGridsManager.createGrid('myGrid', {
                    autoGenerateColumnDefs: true,
                    rowData: [],
                    initialState: { columnSizing: { columnSizingModel: [{ colId: 'c', width: 222 }] } },
                });
                await asyncSetTimeout(0);
                expect(api.getColumnState()).toEqual([]);

                let newColumnsLoaded = 0;
                api.addEventListener('newColumnsLoaded', () => ++newColumnsLoaded);

                api.updateGridOptions(options);

                const read = () => ({
                    widths: api.getColumnState().map((col) => ({ colId: col.colId, width: col.width })),
                    displayedRowCount: api.getDisplayedRowCount(),
                    newColumnsLoaded,
                });
                const expected = {
                    widths: [
                        { colId: 'id', width: 150 },
                        { colId: 'c', width: 222 },
                        { colId: 'b', width: 150 },
                    ],
                    displayedRowCount: 3,
                    newColumnsLoaded: 1,
                };
                await waitFor(() => expect(read()).toEqual(expected), { timeout: 1000 });
                await asyncSetTimeout(0);
                expect(read()).toEqual(expected);

                stateGridsManager.reset();
            }
        });

        test('an option processAutoGeneratedColumnDefs sets is applied with the call that generates the columns', async () => {
            const advancedFilterGridsManager = new TestGridsManager({
                modules: [
                    ClientSideRowModelModule,
                    AutoGenerateColumnsModule,
                    TextFilterModule,
                    NumberFilterModule,
                    AdvancedFilterModule,
                ],
            });
            onTestFinished(() => advancedFilterGridsManager.reset());

            const rows = [
                { id: '7', a: 1, b: 'x' },
                { id: '8', a: 2, b: 'y' },
            ];
            const initialRows = [{ id: '1', a: 0, b: 'w' }];

            for (const initialOptions of [{ rowData: initialRows }, {}]) {
                const api = advancedFilterGridsManager.createGrid('myGrid', {
                    autoGenerateColumnDefs: true,
                    ...initialOptions,
                    processAutoGeneratedColumnDefs: (params) => {
                        if (params.rowData.length === 2) {
                            params.api.setGridOption('enableAdvancedFilter', true);
                        }
                        return params.columnDefs;
                    },
                });
                await asyncSetTimeout(0);
                expect(api.getGridOption('enableAdvancedFilter')).toBe(false);

                api.setGridOption('rowData', rows);

                const read = () => ({
                    advancedFilterHeaders:
                        getGridHTMLElement(api)?.querySelectorAll('.ag-advanced-filter-header').length,
                    enableAdvancedFilter: api.getGridOption('enableAdvancedFilter'),
                    columnIds: api.getColumnState().map((col) => col.colId),
                });
                await waitFor(
                    () =>
                        expect(read()).toEqual({
                            advancedFilterHeaders: 1,
                            enableAdvancedFilter: true,
                            columnIds: ['id', 'a', 'b'],
                        }),
                    { timeout: 1000 }
                );

                advancedFilterGridsManager.reset();
            }
        });

        test('a processAutoGeneratedColumnDefs returning the same definitions leaves a column option set with rowData reported as made by the api', async () => {
            const cached: ColDef[] = [{ field: 'id' }, { field: 'a' }, { field: 'b' }];
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ id: '1', a: 0, b: 'w' }],
                getRowId: (params) => params.data.id,
                processAutoGeneratedColumnDefs: () => cached,
            });
            await asyncSetTimeout(0);

            const events: string[] = [];
            api.addEventListener('newColumnsLoaded', (event) => events.push(`${event.type}:${event.source}`));
            api.addEventListener('columnResized', (event) => events.push(`${event.type}:${event.source}`));

            api.updateGridOptions({
                rowData: [
                    { id: '7', a: 1, b: 'x' },
                    { id: '8', a: 2, b: 'y' },
                ],
                defaultColDef: { width: 150 },
            });

            const read = () => {
                const rowIds: (string | undefined)[] = [];
                api.forEachNode((node) => rowIds.push(node.id));
                return {
                    events: [...events].sort(),
                    widths: api.getColumnState().map((col) => ({ colId: col.colId, width: col.width })),
                    rowIds,
                };
            };
            await waitFor(
                () =>
                    expect(read()).toEqual({
                        events: ['columnResized:api', 'newColumnsLoaded:api'],
                        widths: [
                            { colId: 'id', width: 150 },
                            { colId: 'a', width: 150 },
                            { colId: 'b', width: 150 },
                        ],
                        rowIds: ['7', '8'],
                    }),
                { timeout: 1000 }
            );
        });

        test('rowData set on a grouped grid whose columns were generated updates the groups in place', async () => {
            const groupingGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, AutoGenerateColumnsModule, RowGroupingModule],
            });
            onTestFinished(() => groupingGridsManager.reset());

            const api = groupingGridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: [
                    { id: '5', g: 'x', a: 1 },
                    { id: '4', g: 'z', a: 2 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
                processAutoGeneratedColumnDefs: (params) =>
                    params.columnDefs.map((def) =>
                        'field' in def && def.field === 'g' ? { ...def, rowGroup: true } : def
                    ),
            });
            await asyncSetTimeout(0);

            const groupsBefore: IRowNode[] = [];
            api.forEachNode((node) => node.group && groupsBefore.push(node));

            api.setGridOption('rowData', [
                { id: '4', g: 'z', a: 3 },
                { id: '5', g: 'x', a: 4 },
            ]);

            const groupsAfter: IRowNode[] = [];
            const rows: (string | undefined)[] = [];
            api.forEachNode((node) => {
                rows.push(node.group ? `G:${node.key}` : node.id);
                if (node.group) {
                    groupsAfter.push(node);
                }
            });
            expect({
                rows,
                sameGroups: groupsAfter.map((node, i) => node === groupsBefore[i]),
                data: { 5: api.getRowNode('5')?.data.a, 4: api.getRowNode('4')?.data.a },
            }).toEqual({
                rows: ['G:x', '5', 'G:z', '4'],
                sameGroups: [true, true],
                data: { 5: 4, 4: 3 },
            });
        });

        test('getGridOption columnDefs returns the generated definitions after each rowData change', async () => {
            const fieldsOf = (api: GridApi) =>
                api.getGridOption('columnDefs')?.map((def) => ('field' in def ? def.field : undefined));

            const api = createGrid({ autoGenerateColumnDefs: true });
            await asyncSetTimeout(0);
            expect(api.getGridOption('columnDefs')).toBeUndefined();

            api.setGridOption('rowData', [{ id: '1', a: 1 }]);
            await waitFor(() => expect(fieldsOf(api)).toEqual(['id', 'a']), { timeout: 1000 });

            api.setGridOption('rowData', [{ x: 1, y: 2 }]);
            await waitFor(() => expect(fieldsOf(api)).toEqual(['x', 'y']), { timeout: 1000 });
        });
    });

    describe('transactions do not regenerate columns', () => {
        test('applyTransaction with new keys does not add columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                getRowId: (params) => String(params.data.a),
            });

            await new GridColumns(api, 'initial').checkColumns('empty');

            applyTransactionChecked(api, { add: [{ a: 2, b: 3 }] });

            await new GridColumns(api, 'after transaction').checkColumns('empty');
        });

        test('no initial rowData and first data via transaction does not generate columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                columnDefs: [{ field: 'a' }],
                rowData: [],
            });

            await new GridColumns(api, 'before transaction').checkColumns(`
                CENTER
                └── a "A" width:200
            `);

            applyTransactionChecked(api, { add: [{ a: 1, b: 2, c: 3 }] });

            await new GridColumns(api, 'after transaction').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });
    });

    describe('feature flag behaviour', () => {
        test('does not generate columns when autoGenerateColumnDefs is false', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: false,
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'flag off').checkColumns('empty');
        });

        test('toggling true to false preserves existing columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'before toggle').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);

            api.setGridOption('autoGenerateColumnDefs', false);

            await new GridColumns(api, 'after toggle off').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });

        test('toggling false to true generates columns when rowData exists', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: false,
                rowData: [{ x: 1, y: 2 }],
            });

            await new GridColumns(api, 'flag off').checkColumns('empty');

            api.setGridOption('autoGenerateColumnDefs', true);

            await new GridColumns(api, 'after toggle on').checkColumns(`
                CENTER
                ├── x "X" width:200
                └── y "Y" width:200
            `);
        });

        test('auto-generation overwrites explicit columnDefs when flag is on', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                columnDefs: [{ field: 'custom', headerName: 'Custom Column' }],
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'auto-gen wins').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });
    });

    describe('processAutoGeneratedColumnDefs callback', () => {
        test('callback can modify column definitions', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', age: 30 }],
                processAutoGeneratedColumnDefs: (params) => {
                    return params.columnDefs.map((colDef) => ({
                        ...colDef,
                        filter: 'agTextColumnFilter',
                    }));
                },
            });

            await new GridColumns(api, 'modified').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);

            expect(api.getColumn('name')?.getColDef().filter).toBe('agTextColumnFilter');
            expect(api.getColumn('age')?.getColDef().filter).toBe('agTextColumnFilter');
        });

        test('callback can reorder columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
                processAutoGeneratedColumnDefs: (params) => {
                    return [...params.columnDefs].reverse();
                },
            });

            await new GridColumns(api, 'reversed').checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── b "B" width:200
                └── a "A" width:200
            `);
        });

        test('callback can filter out columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
                processAutoGeneratedColumnDefs: (params) => {
                    return params.columnDefs.filter((colDef) => !('children' in colDef) && colDef.field !== 'b');
                },
            });

            await new GridColumns(api, 'filtered').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── c "C" width:200
            `);
        });

        test('callback can add extra columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
                processAutoGeneratedColumnDefs: (params) => {
                    return [...params.columnDefs, { field: 'extra', headerName: 'Extra' }];
                },
            });

            await new GridColumns(api, 'with extra').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── extra "Extra" width:200
            `);
        });

        test('callback returning a non-array value uses original defs', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
                processAutoGeneratedColumnDefs: () => {
                    return 'not-an-array' as any;
                },
            });

            await new GridColumns(api, 'fallback to generated').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });

        test('callback omitting return applies in-place mutations', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
                processAutoGeneratedColumnDefs: (params) => {
                    forEachColDef(params.columnDefs, (colDef) => {
                        colDef.flex = 1;
                    });
                    // no return — in-place mutation
                },
            });

            await new GridColumns(api, 'mutations applied').checkColumns(`
                CENTER
                ├── a "A" width:500 flex:1
                └── b "B" width:500 flex:1
            `);

            expect(api.getColumn('a')?.getColDef().flex).toBe(1);
        });

        test('callback receives correct params', () => {
            const rowData = [{ name: 'Alice', age: 30 }];
            let receivedParams: { columnDefs: (ColDef | ColGroupDef)[]; rowData: any[] } | undefined;

            createGrid({
                autoGenerateColumnDefs: true,
                rowData,
                processAutoGeneratedColumnDefs: (params) => {
                    receivedParams = params;
                    return params.columnDefs;
                },
            });

            expect(receivedParams).toBeDefined();
            expect(receivedParams!.columnDefs).toEqual([{ field: 'name' }, { field: 'age' }]);
            expect(receivedParams!.rowData).toBe(rowData);
        });
    });

    describe('forEachColDef', () => {
        test('visits all leaf columns including those nested in groups', () => {
            const visited: string[] = [];
            const columnDefs: (ColDef | ColGroupDef)[] = [
                { field: 'name' },
                {
                    headerName: 'Address',
                    children: [{ field: 'address.city' }, { field: 'address.country' }],
                },
                { field: 'score' },
            ];

            forEachColDef(columnDefs, (colDef) => {
                visited.push(colDef.field!);
            });

            expect(visited).toEqual(['name', 'address.city', 'address.country', 'score']);
        });

        test('can mutate leaf column properties without flattening groups', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', address: { city: 'London', country: 'UK' }, score: 100 }],
                processAutoGeneratedColumnDefs: ({ columnDefs }) => {
                    forEachColDef(columnDefs, (colDef) => {
                        colDef.filter = 'agTextColumnFilter';
                    });
                    return columnDefs;
                },
            });

            await new GridColumns(api, 'groups preserved').checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├─┬ "Address" GROUP
                │ ├── address.city "City" width:200
                │ └── address.country "Country" width:200
                └── score "Score" width:200
            `);

            expect(api.getColumn('name')?.getColDef().filter).toBe('agTextColumnFilter');
            expect(api.getColumn('address.city')?.getColDef().filter).toBe('agTextColumnFilter');
            expect(api.getColumn('address.country')?.getColDef().filter).toBe('agTextColumnFilter');
            expect(api.getColumn('score')?.getColDef().filter).toBe('agTextColumnFilter');
        });
    });

    describe('column regeneration on data shape change', () => {
        test('same keys preserves columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            api.setGridOption('rowData', [{ a: 10, b: 20 }]);

            await new GridColumns(api, 'same shape').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });

        test('superset of keys adds new columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }],
            });

            api.setGridOption('rowData', [{ a: 1, b: 2 }]);

            await new GridColumns(api, 'superset').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });

        test('subset of keys removes columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            api.setGridOption('rowData', [{ a: 1 }]);

            await new GridColumns(api, 'subset').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });

        test('removes column while keeping others', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);

            api.setGridOption('rowData', [{ a: 1, c: 3 }]);

            await new GridColumns(api, 'removed b').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── c "C" width:200
            `);
        });

        test('column order follows new rowData key order by default', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);

            api.setGridOption('rowData', [{ c: 3, a: 1 }]);

            await new GridColumns(api, 'new key order').checkColumns(`
                CENTER
                ├── c "C" width:200
                └── a "A" width:200
            `);
        });

        test('maintainColumnOrder preserves existing column positions', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                maintainColumnOrder: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);

            api.setGridOption('rowData', [{ c: 3, a: 1 }]);

            await new GridColumns(api, 'order preserved').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── c "C" width:200
            `);
        });
    });

    describe('column state preservation across rowData updates', () => {
        test('sort state is preserved for matching columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [
                    { name: 'Bob', age: 25 },
                    { name: 'Alice', age: 30 },
                ],
            });

            api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });

            await new GridColumns(api, 'sorted').checkColumns(`
                CENTER
                ├── name "Name" width:200 sort:asc
                └── age "Age" width:200
            `);

            api.setGridOption('rowData', [
                { name: 'Charlie', age: 35 },
                { name: 'Diana', age: 28 },
            ]);

            await new GridColumns(api, 'sort preserved').checkColumns(`
                CENTER
                ├── name "Name" width:200 sort:asc
                └── age "Age" width:200
            `);
        });

        test('user-hidden column remains hidden after rowData update', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            api.setColumnsVisible(['b'], false);

            await new GridColumns(api, 'b hidden').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── c "C" width:200
            `);

            api.setGridOption('rowData', [{ a: 10, b: 20, c: 30 }]);

            await new GridColumns(api, 'b still hidden').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── c "C" width:200
            `);
        });

        test('user-reordered columns preserved with maintainColumnOrder', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                maintainColumnOrder: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            api.moveColumns(['c'], 0);

            await new GridColumns(api, 'reordered').checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── a "A" width:200
                └── b "B" width:200
            `);

            api.setGridOption('rowData', [{ a: 10, b: 20, c: 30 }]);

            await new GridColumns(api, 'order preserved').checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── a "A" width:200
                └── b "B" width:200
            `);
        });

        test('user-reordered columns not preserved without maintainColumnOrder', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            api.moveColumns(['c'], 0);

            await new GridColumns(api, 'reordered').checkColumns(`
                CENTER
                ├── c "C" width:200
                ├── a "A" width:200
                └── b "B" width:200
            `);

            api.setGridOption('rowData', [{ a: 10, b: 20, c: 30 }]);

            await new GridColumns(api, 'order reset').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);
        });
    });

    describe('clearing data', () => {
        test('setting rowData to null clears columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'before clear').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);

            api.setGridOption('rowData', null);

            await new GridColumns(api, 'after null').checkColumns('empty');
        });

        test('setting rowData to empty array clears columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            api.setGridOption('rowData', []);

            await new GridColumns(api, 'after empty').checkColumns('empty');
        });

        test('explicit columnDefs clear removes columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            api.setGridOption('columnDefs', []);

            await new GridColumns(api, 'after clear').checkColumns('empty');
        });

        test('setting rowData to all-null rows clears columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1, b: 2 }],
            });

            await new GridColumns(api, 'before clear').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);

            api.setGridOption('rowData', [null, null] as any[]);

            await new GridColumns(api, 'after all-null rows').checkColumns('empty');
        });
    });

    describe('edge cases', () => {
        test('nested objects produce column groups with dot-notation fields', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ user: { name: 'Alice', age: 30 }, score: 100 }],
            });

            await new GridColumns(api, 'nested groups').checkColumns(`
                CENTER
                ├─┬ "User" GROUP
                │ ├── user.name "Name" width:200
                │ └── user.age "Age" width:200
                └── score "Score" width:200
            `);

            await new GridRows(api, 'nested data renders').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 user.name:"Alice" user.age:30 score:100
            `);
        });

        test('deeply nested objects produce nested column groups', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ address: { street: { name: 'Main St', number: 1 }, city: 'London' } }],
            });

            await new GridColumns(api, 'deep nesting').checkColumns(`
                CENTER
                └─┬ "Address" GROUP
                  ├─┬ "Street" GROUP
                  │ ├── address.street.name "Name" width:200
                  │ └── address.street.number "Number" width:200
                  └── address.city "City" width:200
            `);

            await new GridRows(api, 'deep nested data renders').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 address.street.name:"Main St" address.street.number:1 address.city:"London"
            `);
        });

        test('array values are included by default', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', tags: ['admin', 'user'], score: 100 }],
            });

            await new GridColumns(api, 'arrays included').checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├── tags "Tags" width:200
                └── score "Score" width:200
            `);

            await new GridRows(api, 'array data renders as joined string').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" tags:"admin, user" score:100
            `);
        });

        test('function values are skipped', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', greet: () => 'hello', score: 100 }],
            });

            await new GridColumns(api, 'functions skipped').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── score "Score" width:200
            `);
        });

        test('Symbol-keyed and non-enumerable properties are ignored', async () => {
            const row: Record<string, unknown> = { name: 'Alice', score: 100 };
            Object.defineProperty(row, 'hidden', { value: 'secret', enumerable: false });
            (row as any)[Symbol('id')] = 42;

            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [row],
            });

            await new GridColumns(api, 'only enumerable string keys').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── score "Score" width:200
            `);
        });

        test('Date values produce leaf columns and render correctly', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', dob: new Date(1990, 0, 1) }],
            });

            await new GridColumns(api, 'dates as leaves').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── dob "Dob" width:200
            `);

            await new GridRows(api, 'date row data').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" dob:"1990-01-01"
            `);
        });

        test('null and undefined values produce leaf columns', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ name: 'Alice', middle: null, suffix: undefined }],
            });

            await new GridColumns(api, 'null/undefined').checkColumns(`
                CENTER
                ├── name "Name" width:200
                ├── middle "Middle" width:200
                └── suffix "Suffix" width:200
            `);
        });

        test('skips null and undefined rows to find first object', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [null, undefined, { name: 'Alice', age: 30 }] as any[],
            });

            await new GridColumns(api, 'skipped nulls').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);

            await new GridRows(api, 'valid row rendered').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"Alice" age:30
            `);
        });

        test('no columns when all rows are null or undefined', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [null, undefined, null] as any[],
            });

            await new GridColumns(api, 'all nulls').checkColumns('empty');
        });

        test('only first row keys are used', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }, { a: 2, b: 3 }],
            });

            await new GridColumns(api, 'first row only').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });

        test('single row with single key', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ x: 1 }],
            });

            await new GridColumns(api, 'single').checkColumns(`
                CENTER
                └── x "X" width:200
            `);
        });

        test('empty nested objects do not produce empty column groups with group', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: { objectValues: 'group' },
                rowData: [{ name: 'Alice', address: {}, score: 100 }],
            });

            await new GridColumns(api, 'group empty').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── score "Score" width:200
            `);
        });

        test('empty nested objects are skipped with objectValues skip', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: { objectValues: 'skip' },
                rowData: [{ name: 'Alice', address: {}, score: 100 }],
            });

            await new GridColumns(api, 'skip empty').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── score "Score" width:200
            `);
        });

        test('literal dotted keys render blank without suppressFieldDotNotation', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ 'user.name': 'Alice', score: 100 }],
            });

            await new GridColumns(api, 'dotted key').checkColumns(`
                CENTER
                ├── user.name "User Name" width:200
                └── score "Score" width:200
            `);

            await new GridRows(api, 'dotted key renders blank').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 score:100
            `);
        });

        test('literal dotted keys render correctly with suppressFieldDotNotation', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                suppressFieldDotNotation: true,
                rowData: [{ 'user.name': 'Alice', score: 100 }],
            });

            await new GridColumns(api, 'dotted key suppressed').checkColumns(`
                CENTER
                ├── user.name "User Name" width:200
                └── score "Score" width:200
            `);

            await new GridRows(api, 'dotted key renders value').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 user.name:"Alice" score:100
            `);
        });

        test('handles many keys', async () => {
            const row: Record<string, number> = {};
            for (let i = 0; i < 50; ++i) {
                row[`col${i}`] = i;
            }
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [row],
            });

            const columns = api.getColumns();
            expect(columns?.length).toBe(50);
        });
    });

    describe('property ordering', () => {
        test('rowData change regenerates columns even after explicit columnDefs were set', async () => {
            const api = createGrid({
                autoGenerateColumnDefs: true,
                rowData: [{ a: 1 }],
            });

            api.setGridOption('columnDefs', [{ field: 'manual' }]);

            await new GridColumns(api, 'user override').checkColumns(`
                CENTER
                └── manual "Manual" width:200
            `);

            api.setGridOption('rowData', [{ x: 1, y: 2 }]);

            await new GridColumns(api, 'regenerated').checkColumns(`
                CENTER
                ├── x "X" width:200
                └── y "Y" width:200
            `);
        });
    });

    describe('events raised by one rowData change', () => {
        const groupingGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, AutoGenerateColumnsModule, RowGroupingModule],
        });

        afterEach(() => {
            groupingGridsManager.reset();
        });

        const rowsA = [
            { id: '1', a: 1, b: 'x' },
            { id: '2', a: 2, b: 'y' },
        ];
        const rowsB = [
            { id: '1', c: 5, b: 'x' },
            { id: '3', c: 6, b: 'z' },
        ];

        /** Runs `action`, then reads the events it raised, the column ids and the row data. */
        async function recordCall(api: GridApi, action: () => void) {
            // events of the grid's creation reach api listeners a turn late: flush them before listening
            await asyncSetTimeout(0);

            const events: string[] = [];
            api.addEventListener('newColumnsLoaded', () => events.push('newColumnsLoaded'));
            api.addEventListener('rowDataUpdated', () => events.push('rowDataUpdated'));
            api.addEventListener('modelUpdated', (event: ModelUpdatedEvent) =>
                events.push(`modelUpdated:newData=${event.newData},keep=${event.keepRenderedRows}`)
            );

            action();

            await waitFor(() => expect(events.some((e) => e.startsWith('modelUpdated'))).toBe(true), {
                timeout: 1000,
            });
            await asyncSetTimeout(0);

            const rows: unknown[] = [];
            api.forEachNode((node) => rows.push(node.data));
            return { events, columnIds: api.getAllGridColumns().map((col) => col.getColId()), rows };
        }

        const loadedOnce = ['newColumnsLoaded', 'rowDataUpdated', 'modelUpdated:newData=true,keep=false'];

        test('a grid created with rowData loads its generated columns and rows once', async () => {
            const events: string[] = [];
            const api = groupingGridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: rowsA,
                onNewColumnsLoaded: (event) => events.push(`newColumnsLoaded:${event.source}`),
                onRowDataUpdated: () => events.push('rowDataUpdated'),
                onModelUpdated: (event) => events.push(`modelUpdated:newData=${event.newData}`),
            });
            await waitFor(() => expect(events.some((e) => e.startsWith('modelUpdated'))).toBe(true), {
                timeout: 1000,
            });
            await asyncSetTimeout(0);

            expect({ events, columnIds: api.getAllGridColumns().map((col) => col.getColId()) }).toEqual({
                events: ['newColumnsLoaded:gridInitializing', 'rowDataUpdated', 'modelUpdated:newData=true'],
                columnIds: ['id', 'a', 'b'],
            });
        });

        test('setting rowData on a grid created without rowData, then again with other keys, loads columns and rows once each time', async () => {
            const api = groupingGridsManager.createGrid('myGrid', { autoGenerateColumnDefs: true });

            const first = await recordCall(api, () => api.setGridOption('rowData', rowsA));
            expect(first).toEqual({ events: loadedOnce, columnIds: ['id', 'a', 'b'], rows: rowsA });

            const second = await recordCall(api, () => api.setGridOption('rowData', rowsB));
            expect(second).toEqual({ events: loadedOnce, columnIds: ['id', 'c', 'b'], rows: rowsB });
        });

        test.each([
            ['groupDisplayType', { groupDisplayType: 'groupRows' }],
            ['groupTotalRow', { groupTotalRow: 'bottom' }],
        ] as const)(
            'updateGridOptions changing rowData together with %s gives one load whatever the key order',
            async (_name, other) => {
                const results: Awaited<ReturnType<typeof recordCall>>[] = [];
                for (const options of [
                    { rowData: rowsB, ...other },
                    { ...other, rowData: rowsB },
                ]) {
                    const api = groupingGridsManager.createGrid('myGrid', {
                        autoGenerateColumnDefs: true,
                        rowData: rowsA,
                    });
                    results.push(await recordCall(api, () => api.updateGridOptions(options)));
                    groupingGridsManager.reset();
                }

                const expected = { events: loadedOnce, columnIds: ['id', 'c', 'b'], rows: rowsB };
                expect(results).toEqual([expected, expected]);
            }
        );

        test('with getRowId set, changing rowData keeps the rendered rows', async () => {
            const api = groupingGridsManager.createGrid('myGrid', {
                autoGenerateColumnDefs: true,
                rowData: rowsA,
                getRowId: (params) => params.data.id,
            });

            const result = await recordCall(api, () => api.setGridOption('rowData', rowsB));
            expect(result).toEqual({
                events: ['newColumnsLoaded', 'rowDataUpdated', 'modelUpdated:newData=false,keep=true'],
                columnIds: ['id', 'c', 'b'],
                rows: rowsB,
            });
        });
    });

    describe('config object', () => {
        describe('objectValues', () => {
            test('objectValues: group (default) creates column groups', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { objectValues: 'group' },
                    rowData: [{ name: 'Alice', address: { city: 'London', country: 'UK' } }],
                });

                await new GridColumns(api, 'group').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └─┬ "Address" GROUP
                      ├── address.city "City" width:200
                      └── address.country "Country" width:200
                `);

                await new GridRows(api, 'group data renders').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice" address.city:"London" address.country:"UK"
                `);
            });

            test('objectValues: flatten creates flat leaf columns with dotted field paths', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { objectValues: 'flatten' },
                    rowData: [{ name: 'Alice', address: { city: 'London', country: 'UK' } }],
                });

                await new GridColumns(api, 'flatten').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── address.city "City" width:200
                    └── address.country "Country" width:200
                `);

                await new GridRows(api, 'flatten data renders').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice" address.city:"London" address.country:"UK"
                `);
            });

            test('objectValues: skip ignores object values', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { objectValues: 'skip' },
                    rowData: [{ name: 'Alice', address: { city: 'London' }, score: 100 }],
                });

                await new GridColumns(api, 'skip objects').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └── score "Score" width:200
                `);
            });
        });

        describe('arrayValues', () => {
            test('arrayValues: primitives (default) creates a leaf column for primitive arrays', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { arrayValues: 'primitives' },
                    rowData: [{ name: 'Alice', tags: ['admin', 'user'], scores: [{ value: 90 }], score: 100 }],
                });

                await new GridColumns(api, 'primitives arrays').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── tags "Tags" width:200
                    └── score "Score" width:200
                `);

                await new GridRows(api, 'primitive array data renders').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice" tags:"admin, user" score:100
                `);
            });

            test('arrayValues: primitives skips empty arrays', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { arrayValues: 'primitives' },
                    rowData: [{ name: 'Alice', tags: [], score: 100 }],
                });

                await new GridColumns(api, 'primitives empty array').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └── score "Score" width:200
                `);
            });

            test('arrayValues: include creates a leaf column for all arrays', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { arrayValues: 'include' },
                    rowData: [{ name: 'Alice', tags: ['admin', 'user'], score: 100 }],
                });

                await new GridColumns(api, 'include arrays').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── tags "Tags" width:200
                    └── score "Score" width:200
                `);

                await new GridRows(api, 'array data renders').check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 name:"Alice" tags:"admin, user" score:100
                `);
            });

            test('arrayValues: skip ignores arrays', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { arrayValues: 'skip' },
                    rowData: [{ name: 'Alice', tags: ['admin', 'user'], score: 100 }],
                });

                await new GridColumns(api, 'skip arrays').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └── score "Score" width:200
                `);
            });
        });

        describe('nullishValues', () => {
            test('nullishValues: include (default) creates columns for null/undefined', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { nullishValues: 'include' },
                    rowData: [{ name: 'Alice', middle: null, suffix: undefined, age: 30 }],
                });

                await new GridColumns(api, 'include nulls').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── middle "Middle" width:200
                    ├── suffix "Suffix" width:200
                    └── age "Age" width:200
                `);
            });

            test('nullishValues: skip ignores null and undefined values', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { nullishValues: 'skip' },
                    rowData: [{ name: 'Alice', middle: null, suffix: undefined, age: 30 }],
                });

                await new GridColumns(api, 'skip nulls').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    └── age "Age" width:200
                `);
            });
        });

        describe('combined config', () => {
            test('config object with all options set', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: { objectValues: 'skip', arrayValues: 'include', nullishValues: 'skip' },
                    rowData: [
                        { name: 'Alice', address: { city: 'London' }, tags: ['admin'], middle: null, score: 100 },
                    ],
                });

                await new GridColumns(api, 'combined config').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├── tags "Tags" width:200
                    └── score "Score" width:200
                `);
            });

            test('empty config object uses all defaults', async () => {
                const api = createGrid({
                    autoGenerateColumnDefs: {},
                    rowData: [{ name: 'Alice', address: { city: 'London' }, tags: ['admin'], middle: null }],
                });

                await new GridColumns(api, 'empty config').checkColumns(`
                    CENTER
                    ├── name "Name" width:200
                    ├─┬ "Address" GROUP
                    │ └── address.city "City" width:200
                    ├── tags "Tags" width:200
                    └── middle "Middle" width:200
                `);
            });
        });
    });
});
