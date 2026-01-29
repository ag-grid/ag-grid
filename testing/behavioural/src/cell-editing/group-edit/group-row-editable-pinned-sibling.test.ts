import type { GridOptions, RowNode, ValueSetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, UndoRedoEditModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { EDIT_MODES, editCell } from './group-edit-test-utils';

/**
 * Tests for editing cells in manually pinned rows (pinnedSibling).
 * When a row is manually pinned, it creates a pinned copy that shares data with the source row.
 * Edits to either the pinned or source row should update both.
 */
describe('editing with pinned sibling rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, UndoRedoEditModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createRowData() {
        return [
            { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
            { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
            { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
            { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
            { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
            { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
        ];
    }

    describe('manual row pinning with non-pivot mode', () => {
        function createSimpleGridOptions(overrides: Partial<GridOptions> = {}): GridOptions {
            return {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                    editable: true,
                },
                undoRedoCellEditing: true,
                columnDefs: [{ field: 'country' }, { field: 'year' }, { field: 'sales' }, { field: 'region' }],
                getRowId: ({ data }) => data.id,
                rowData: createRowData(),
                ...overrides,
            };
        }

        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing pinned row updates source row data in simple grid', async () => {
                const valueSetterCalls: ValueSetterParams[] = [];
                const gridOptions = createSimpleGridOptions({
                    enableRowPinning: true,
                    isRowPinned: (params) => {
                        return params.data?.id === '1' ? 'top' : null;
                    },
                    defaultColDef: {
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                        valueSetter: (params: ValueSetterParams) => {
                            valueSetterCalls.push(params);
                            if (params.colDef.field && params.data) {
                                (params.data as Record<string, unknown>)[params.colDef.field] = params.newValue;
                            }
                            return true;
                        },
                    },
                });

                const api = await gridsManager.createGridAndWait('pinned-simple-edit', gridOptions);

                const pinnedRow = api.getPinnedTopRow(0) as RowNode;
                const sourceRow = api.getRowNode('1') as RowNode;

                // Check that pinnedSibling relationship exists
                expect(pinnedRow).toBeDefined();
                expect(sourceRow).toBeDefined();
                expect(pinnedRow.pinnedSibling).toBe(sourceRow);
                expect(sourceRow.pinnedSibling).toBe(pinnedRow);
                expect(pinnedRow.data).toBe(sourceRow.data);

                // Verify initial state
                let gridRows = new GridRows(api, 'before edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-1 country:"France" year:2020 sales:1000 region:"Europe"
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:1000 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                `);

                // Edit the pinned row
                if (editMode === 'ui') {
                    await editCell(api, pinnedRow, 'sales', '9999');
                } else {
                    pinnedRow.setDataValue('sales', 9999, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                // Both should have the updated value
                expect(pinnedRow.data?.sales).toBe(9999);
                expect(sourceRow.data?.sales).toBe(9999);

                // Verify grid state - both pinned and source row should show updated value
                gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    PINNED_TOP id:t-top-1 country:"France" year:2020 sales:9999 region:"Europe"
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:9999 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                `);

                // valueSetter should have been called once (for the pinned row edit)
                expect(valueSetterCalls.length).toBe(1);
            });

            test('editing source row updates pinned sibling in simple grid', async () => {
                const gridOptions = createSimpleGridOptions({
                    enableRowPinning: true,
                    isRowPinned: (params) => {
                        return params.data?.id === '1' ? 'bottom' : null;
                    },
                });

                const api = await gridsManager.createGridAndWait('source-simple-edit', gridOptions);

                const sourceRow = api.getRowNode('1') as RowNode;
                const pinnedRow = api.getPinnedBottomRow(0) as RowNode;

                // Check pinnedSibling relationship
                expect(sourceRow).toBeDefined();
                expect(pinnedRow).toBeDefined();
                expect(sourceRow.pinnedSibling).toBe(pinnedRow);
                expect(pinnedRow.pinnedSibling).toBe(sourceRow);

                // Edit the source row
                if (editMode === 'ui') {
                    await editCell(api, sourceRow, 'sales', '1111');
                } else {
                    sourceRow.setDataValue('sales', 1111, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(50);

                expect(sourceRow.data?.sales).toBe(1111);
                expect(pinnedRow.data?.sales).toBe(1111);

                // Verify grid state - both source and pinned row should show updated value
                const gridRows = new GridRows(api, 'after edit');
                await gridRows.check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 country:"France" year:2020 sales:1111 region:"Europe"
                    ├── LEAF id:2 country:"France" year:2021 sales:1200 region:"Europe"
                    ├── LEAF id:3 country:"Germany" year:2020 sales:1500 region:"Europe"
                    ├── LEAF id:4 country:"Germany" year:2021 sales:1800 region:"Europe"
                    ├── LEAF id:5 country:"USA" year:2020 sales:2000 region:"Americas"
                    └── LEAF id:6 country:"USA" year:2021 sales:2200 region:"Americas"
                    PINNED_BOTTOM id:b-bottom-1 country:"France" year:2020 sales:1111 region:"Europe"
                `);
            });
        });
    });
});
