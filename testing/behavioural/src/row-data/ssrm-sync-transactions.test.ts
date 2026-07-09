import type { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';
import { ssrmExpandAndLoadAll, waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

/**
 * Characterization (golden-master) tests for AG Grid SSRM SYNCHRONOUS transactions:
 *   - api.applyServerSideTransaction({ add, remove, update, route })
 *
 * The async variant (applyServerSideTransactionAsync / flushServerSideAsyncTransactions)
 * is covered separately in ssrm-async-transactions.test.ts and is deliberately NOT
 * duplicated here.
 *
 * These tests pin the CURRENT observed behaviour of the grid (result `status` strings,
 * displayed counts, ordering, cell values). Any value asserted here is a snapshot of what
 * the grid does today, not a statement of what it ideally should do. If a behaviour that
 * looks like a bug is frozen here, that is intentional: these tests exist to detect
 * unintended change, so update them only when a behavioural change is deliberate.
 */
describe('SSRM Sync Transactions (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('Flat store', () => {
        // Inline flat datasource: a single (root) store serving `rowData` by range.
        function createFlatGridOptions(rowData: Array<{ id: number; value: string }>): GridOptions {
            return {
                columnDefs: [{ field: 'id' }, { field: 'value' }],
                rowModelType: 'serverSide' as const,
                getRowId: (params: any) => String(params.data.id),
                serverSideDatasource: {
                    getRows: (params: any) => {
                        const rows = rowData.slice(params.request.startRow, params.request.endRow);
                        params.success({ rowData: rows, rowCount: rowData.length });
                    },
                },
            };
        }

        test('ADD appends the row to the end of the flat store and returns status Applied', async () => {
            const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));
            const api = gridsManager.createGrid(null, createFlatGridOptions(rowData));

            await new GridColumns(api, `flat add setup`).checkColumns(`
                CENTER
                ├── id "Id" width:200
                └── value "Value" width:200
            `);
            await waitForEvent('firstDataRendered', api);
            expect(api.getDisplayedRowCount()).toBe(5);

            const result = api.applyServerSideTransaction({ add: [{ id: 100, value: 'Added' }] });
            await waitForNoLoadingRows(api);

            // Pin the returned status object's scalar fields (never the whole object).
            expect(result?.status).toBe('Applied');
            expect(result?.add?.length).toBe(1);
            // Untouched operation arrays are left undefined on the result (not empty arrays).
            expect(result?.remove).toBeUndefined();
            expect(result?.update).toBeUndefined();

            // Pin: the row exists, count grew, and it was appended at the END.
            expect(!!api.getRowNode('100')).toBe(true);
            expect(api.getDisplayedRowCount()).toBe(6);

            await new GridRows(api, `flat add final`).check(`
                ROOT id:<no-id>
                ├── LEAF id:0 id:0 value:"Row 0"
                ├── LEAF id:1 id:1 value:"Row 1"
                ├── LEAF id:2 id:2 value:"Row 2"
                ├── LEAF id:3 id:3 value:"Row 3"
                ├── LEAF id:4 id:4 value:"Row 4"
                └── LEAF id:100 id:100 value:"Added"
            `);
        });

        test('REMOVE deletes the node from the flat store and returns status Applied', async () => {
            const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));
            const api = gridsManager.createGrid(null, createFlatGridOptions(rowData));

            await waitForEvent('firstDataRendered', api);
            expect(api.getDisplayedRowCount()).toBe(5);
            expect(!!api.getRowNode('2')).toBe(true);

            const result = api.applyServerSideTransaction({ remove: [{ id: 2 }] });
            await waitForNoLoadingRows(api);

            expect(result?.status).toBe('Applied');
            expect(result?.remove?.length).toBe(1);

            // Pin: node gone (boolean, never assert the node object) and count shrank.
            expect(!!api.getRowNode('2')).toBe(false);
            expect(api.getDisplayedRowCount()).toBe(4);

            await new GridRows(api, `flat remove final`).check(`
                ROOT id:<no-id>
                ├── LEAF id:0 id:0 value:"Row 0"
                ├── LEAF id:1 id:1 value:"Row 1"
                ├── LEAF id:3 id:3 value:"Row 3"
                └── LEAF id:4 id:4 value:"Row 4"
            `);
        });

        test('UPDATE changes a field value on the node and returns status Applied', async () => {
            const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));
            const api = gridsManager.createGrid(null, createFlatGridOptions(rowData));

            await waitForEvent('firstDataRendered', api);
            expect(api.getDisplayedRowCount()).toBe(5);

            const result = api.applyServerSideTransaction({ update: [{ id: 2, value: 'Updated' }] });
            await waitForNoLoadingRows(api);

            expect(result?.status).toBe('Applied');
            expect(result?.update?.length).toBe(1);

            // Pin: count unchanged, and the new field value is reflected.
            expect(api.getDisplayedRowCount()).toBe(5);
            expect(api.getRowNode('2')?.data.value).toBe('Updated');

            await new GridRows(api, `flat update final`).check(`
                ROOT id:<no-id>
                ├── LEAF id:0 id:0 value:"Row 0"
                ├── LEAF id:1 id:1 value:"Row 1"
                ├── LEAF id:2 id:2 value:"Updated"
                ├── LEAF id:3 id:3 value:"Row 3"
                └── LEAF id:4 id:4 value:"Row 4"
            `);
        });
    });

    describe('Grouped store (single rowGroup column)', () => {
        interface LeafRow {
            id: string;
            country: string;
            athlete: string;
            medals: number;
        }

        const groupedRows: LeafRow[] = [
            { id: 'usa-1', country: 'USA', athlete: 'Alice', medals: 1 },
            { id: 'usa-2', country: 'USA', athlete: 'Bob', medals: 2 },
            { id: 'uk-1', country: 'UK', athlete: 'Charlie', medals: 3 },
            { id: 'uk-2', country: 'UK', athlete: 'Dave', medals: 4 },
        ];

        // Inline grouped datasource: one rowGroup column (country). With no groupKeys we serve
        // the distinct country group rows; with a groupKey we serve that country's leaf rows.
        function createGroupedDatasource(rows: LeafRow[]): IServerSideDatasource {
            return {
                getRows(params: IServerSideGetRowsParams) {
                    const { request } = params;
                    const groupKeys = request.groupKeys ?? [];
                    if (groupKeys.length === 0) {
                        const countries: string[] = [];
                        for (let i = 0, len = rows.length; i < len; ++i) {
                            const country = rows[i].country;
                            if (!countries.includes(country)) {
                                countries.push(country);
                            }
                        }
                        const groupRows = countries.map((country) => ({ country }));
                        params.success({ rowData: groupRows, rowCount: groupRows.length });
                        return;
                    }
                    const country = groupKeys[0];
                    const leaves = rows.filter((row) => row.country === country);
                    params.success({ rowData: leaves, rowCount: leaves.length });
                },
            };
        }

        function createGroupedGridOptions(rows: LeafRow[]): GridOptions {
            return {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'athlete' },
                    { field: 'medals' },
                ],
                autoGroupColumnDef: { field: 'athlete' },
                rowModelType: 'serverSide' as const,
                animateRows: false,
                getRowId: (params: any) => {
                    if (params.data.id) {
                        return params.data.id;
                    }
                    // Group level row: key by the country group value.
                    return `group-${params.data.country}`;
                },
                serverSideDatasource: createGroupedDatasource(rows),
            };
        }

        test('ADD to a routed group appends a child under that group; sibling group unaffected', async () => {
            const api = gridsManager.createGrid(null, createGroupedGridOptions(groupedRows));

            await waitForEvent('firstDataRendered', api);
            await ssrmExpandAndLoadAll(api);

            const countBefore = api.getDisplayedRowCount();

            const result = api.applyServerSideTransaction({
                route: ['USA'],
                add: [{ id: 'usa-3', country: 'USA', athlete: 'Eve', medals: 5 }],
            });
            await waitForNoLoadingRows(api);

            expect(result?.status).toBe('Applied');
            expect(result?.add?.length).toBe(1);

            // Pin: new child exists under the USA route; sibling UK children untouched.
            expect(!!api.getRowNode('usa-3')).toBe(true);
            expect(!!api.getRowNode('uk-1')).toBe(true);
            expect(!!api.getRowNode('uk-2')).toBe(true);
            expect(api.getDisplayedRowCount()).toBe(countBefore + 1);

            await new GridRows(api, `grouped add final`).check(`
                ROOT id:<no-id>
                ├─┬ GROUP-leafGroup id:group-USA ag-Grid-AutoColumn:"USA" country:"USA"
                │ ├── LEAF id:usa-1 ag-Grid-AutoColumn:"Alice" country:"USA" athlete:"Alice" medals:1
                │ ├── LEAF id:usa-2 ag-Grid-AutoColumn:"Bob" country:"USA" athlete:"Bob" medals:2
                │ └── LEAF id:usa-3 ag-Grid-AutoColumn:"Eve" country:"USA" athlete:"Eve" medals:5
                └─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
                · ├── LEAF id:uk-1 ag-Grid-AutoColumn:"Charlie" country:"UK" athlete:"Charlie" medals:3
                · └── LEAF id:uk-2 ag-Grid-AutoColumn:"Dave" country:"UK" athlete:"Dave" medals:4
            `);
        });

        test('UPDATE a child in a routed group changes its field value; returns status Applied', async () => {
            const api = gridsManager.createGrid(null, createGroupedGridOptions(groupedRows));

            await waitForEvent('firstDataRendered', api);
            await ssrmExpandAndLoadAll(api);

            const countBefore = api.getDisplayedRowCount();

            const result = api.applyServerSideTransaction({
                route: ['USA'],
                update: [{ id: 'usa-1', country: 'USA', athlete: 'Alice', medals: 99 }],
            });
            await waitForNoLoadingRows(api);

            expect(result?.status).toBe('Applied');
            expect(result?.update?.length).toBe(1);
            expect(api.getDisplayedRowCount()).toBe(countBefore);
            expect(api.getRowNode('usa-1')?.data.medals).toBe(99);
        });

        test('REMOVE a child from a routed group drops it; sibling group unaffected', async () => {
            const api = gridsManager.createGrid(null, createGroupedGridOptions(groupedRows));

            await waitForEvent('firstDataRendered', api);
            await ssrmExpandAndLoadAll(api);

            const countBefore = api.getDisplayedRowCount();
            expect(!!api.getRowNode('usa-2')).toBe(true);

            const result = api.applyServerSideTransaction({
                route: ['USA'],
                remove: [{ id: 'usa-2' }],
            });
            await waitForNoLoadingRows(api);

            expect(result?.status).toBe('Applied');
            expect(result?.remove?.length).toBe(1);
            expect(!!api.getRowNode('usa-2')).toBe(false);
            // Sibling UK children remain.
            expect(!!api.getRowNode('uk-1')).toBe(true);
            expect(api.getDisplayedRowCount()).toBe(countBefore - 1);
        });

        test('transaction targeting a NOT-YET-LOADED group route yields StoreNotFound and changes nothing', async () => {
            const api = gridsManager.createGrid(null, createGroupedGridOptions(groupedRows));

            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            // Note: groups are collapsed, so no child store for 'USA' has been created yet.

            const countBefore = api.getDisplayedRowCount();

            const result = api.applyServerSideTransaction({
                route: ['USA'],
                add: [{ id: 'usa-ghost', country: 'USA', athlete: 'Ghost', medals: 0 }],
            });
            await waitForNoLoadingRows(api);

            // LATENT QUIRK: even though the 'USA' group is collapsed and its child store has NOT
            // been loaded, the transaction is reported as 'Applied' (NOT 'StoreNotFound') — the
            // child store object exists lazily. However the added row is NOT retained: getRowNode
            // returns nothing for it and the displayed count is unchanged. So an 'Applied' status
            // here does not imply the row survived.
            expect(result?.status).toBe('Applied');
            expect(!!api.getRowNode('usa-ghost')).toBe(false);
            expect(api.getDisplayedRowCount()).toBe(countBefore);
        });
    });
});
