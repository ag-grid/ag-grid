import type { GridOptions, IRowNode, RowNode, RowPinnedType } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, PinnedRowModule, UndoRedoEditModule } from 'ag-grid-community';
import { PivotModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { EDIT_MODES, cascadeGroupRowValueSetter, editCell } from './group-edit-test-utils';

interface PivotRowData {
    id: string;
    region: string;
    country: string;
    year: number;
    sales: number;
}

/**
 * Tests for pinned pivot rows and groups with bidirectional aggregation sync.
 * Verifies that editing values in either pinned rows or source pivot/group rows
 * updates aggregations in both locations.
 */
describe('editing with pinned pivot rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            RowGroupingEditModule,
            NumberEditorModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            UndoRedoEditModule,
            PinnedRowModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createPivotRowData(): PivotRowData[] {
        return [
            { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
            { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
            { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
            { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
            { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
            { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
            { id: '7', region: 'Americas', country: 'Canada', year: 2020, sales: 800 },
            { id: '8', region: 'Americas', country: 'Canada', year: 2021, sales: 900 },
        ];
    }

    const createGridOptions = (
        pinCondition: (node: IRowNode<PivotRowData>) => RowPinnedType
    ): GridOptions<PivotRowData> => ({
        defaultColDef: {
            cellEditor: 'agTextCellEditor',
        },
        undoRedoCellEditing: true,
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', pivot: true, hide: true },
            {
                field: 'sales',
                aggFunc: 'sum',
                hide: true,
                editable: true,
                groupRowEditable: true,
                groupRowValueSetter: cascadeGroupRowValueSetter,
            },
        ],
        pivotMode: true,
        groupDefaultExpanded: -1,
        getRowId: ({ data }) => data.id,
        rowData: createPivotRowData(),
        enableRowPinning: true,
        isRowPinned: (node) => pinCondition(node),
    });

    const gridRowsOptions: GridRowsOptions = {
        forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
        printHiddenRows: false,
    };

    /** Helper to find a pivot column by year */
    const findPivotColumn = (api: ReturnType<typeof gridsManager.createGrid>, year: number) => {
        const pivotColumns = api.getPivotResultColumns();
        return pivotColumns?.find((col) => col.getColId().includes(`${year}_sales`));
    };

    describe('pinned leaf group with pivot - single level grouping', () => {
        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing source pivot group row updates pinned sibling aggregation', async () => {
                const api = await gridsManager.createGridAndWait('pivot-pinned-source-edit', {
                    ...createGridOptions((node) => (node.group && node.key === 'France' ? 'top' : null)),
                });

                const pivotCol = findPivotColumn(api, 2020);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                // Edit the SOURCE group row (not pinned)
                const franceNode = api.getRowNode('row-group-country-France');
                expect(franceNode).toBeDefined();

                if (editMode === 'ui') {
                    // Start editing and capture mid-edit state before committing
                    api.startEditingCell({
                        rowIndex: franceNode!.rowIndex!,
                        colKey: pivotColId,
                    });
                    await asyncSetTimeout(0);

                    await new GridRows(api, 'during edit', gridRowsOptions).check(`
                        PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                        ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                        ├── LEAF_GROUP collapsed 🖍️ id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                        ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                        ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                        └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    `);

                    api.stopEditing(true);
                    await asyncSetTimeout(0);

                    await editCell(api, franceNode!, pivotColId, '2000');
                } else {
                    franceNode!.setDataValue(pivotColId, 2000, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Both source and pinned should be updated
                const pinnedFrance = api.getPinnedTopRow(0) as RowNode;
                expect(franceNode?.aggData?.[pivotColId]).toBe(2000);
                expect(pinnedFrance?.aggData?.[pivotColId]).toBe(2000);

                await new GridRows(api, 'after source edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6300 pivot_year_2021_sales:6100
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
                `);
            });

            test('editing pinned pivot group row updates source aggregation', async () => {
                const api = await gridsManager.createGridAndWait('pivot-pinned-row-edit', {
                    ...createGridOptions((node) => (node.group && node.key === 'Germany' ? 'bottom' : null)),
                });

                const pivotCol = findPivotColumn(api, 2021);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    PINNED_BOTTOM id:b-bottom-row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                `);

                // Edit the PINNED group row
                const pinnedGermany = api.getPinnedBottomRow(0) as RowNode;
                expect(pinnedGermany).toBeDefined();

                if (editMode === 'ui') {
                    await editCell(api, pinnedGermany!, pivotColId, '3600');
                } else {
                    pinnedGermany!.setDataValue(pivotColId, 3600, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Both pinned and source should be updated
                const germanyNode = api.getRowNode('row-group-country-Germany');
                expect(pinnedGermany?.aggData?.[pivotColId]).toBe(3600);
                expect(germanyNode?.aggData?.[pivotColId]).toBe(3600);

                await new GridRows(api, 'after pinned edit', gridRowsOptions).check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:7900
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:3600
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    PINNED_BOTTOM id:b-bottom-row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:3600
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
                `);
            });

            test('multiple pinned pivot groups stay in sync', async () => {
                const api = await gridsManager.createGridAndWait('pivot-multiple-pinned', {
                    ...createGridOptions((node) => {
                        if (!node.group) {
                            return null;
                        }
                        if (node.key === 'France') {
                            return 'top';
                        }
                        if (node.key === 'USA') {
                            return 'bottom';
                        }
                        return null;
                    }),
                });

                const pivotCol2020 = findPivotColumn(api, 2020);
                const pivotCol2021 = findPivotColumn(api, 2021);

                await new GridRows(api, 'before edits', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    PINNED_BOTTOM id:b-bottom-row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                `);

                // Edit pinned top (France) via source
                const franceNode = api.getRowNode('row-group-country-France');
                if (editMode === 'ui') {
                    await editCell(api, franceNode!, pivotCol2020!.getColId(), '1500');
                } else {
                    franceNode!.setDataValue(pivotCol2020!.getColId(), 1500, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Edit pinned bottom (USA) via pinned row
                const pinnedUSA = api.getPinnedBottomRow(0) as RowNode;
                if (editMode === 'ui') {
                    await editCell(api, pinnedUSA!, pivotCol2021!.getColId(), '4400');
                } else {
                    pinnedUSA!.setDataValue(pivotCol2021!.getColId(), 4400, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Verify both pinned rows and sources are in sync
                const pinnedFrance = api.getPinnedTopRow(0) as RowNode;
                const usaNode = api.getRowNode('row-group-country-USA');

                expect(franceNode?.aggData?.[pivotCol2020!.getColId()]).toBe(1500);
                expect(pinnedFrance?.aggData?.[pivotCol2020!.getColId()]).toBe(1500);
                expect(usaNode?.aggData?.[pivotCol2021!.getColId()]).toBe(4400);
                expect(pinnedUSA?.aggData?.[pivotCol2021!.getColId()]).toBe(4400);

                await new GridRows(api, 'after edits', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5800 pivot_year_2021_sales:8300
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:4400
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    PINNED_BOTTOM id:b-bottom-row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:4400
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
                `);
            });
        });
    });

    describe('pinned filler group with pivot - multi-level grouping', () => {
        const createMultiLevelGridOptions = (
            pinCondition: (node: IRowNode<PivotRowData>) => RowPinnedType
        ): GridOptions<PivotRowData> => ({
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    hide: true,
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: createPivotRowData(),
            enableRowPinning: true,
            isRowPinned: (node) => pinCondition(node),
        });

        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing source filler group updates pinned sibling aggregation', async () => {
                const api = await gridsManager.createGridAndWait('pivot-pinned-filler-source', {
                    ...createMultiLevelGridOptions((node) =>
                        node.group && node.key === 'Europe' && node.level === 0 ? 'top' : null
                    ),
                });

                const pivotCol = findPivotColumn(api, 2020);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                // Edit the SOURCE filler group
                const europeNode = api.getRowNode('row-group-region-Europe');
                expect(europeNode).toBeDefined();

                if (editMode === 'ui') {
                    await editCell(api, europeNode!, pivotColId, '5000');
                } else {
                    europeNode!.setDataValue(pivotColId, 5000, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Both source and pinned filler should be updated
                const pinnedEurope = api.getPinnedTopRow(0) as RowNode;
                expect(europeNode?.aggData?.[pivotColId]).toBe(5000);
                expect(pinnedEurope?.aggData?.[pivotColId]).toBe(5000);

                await new GridRows(api, 'after source filler edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:5000 pivot_year_2021_sales:3000
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:7800 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:5000 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2500 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:2500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);
            });

            test('editing pinned filler group updates source and cascades to children', async () => {
                const api = await gridsManager.createGridAndWait('pivot-pinned-filler-edit', {
                    ...createMultiLevelGridOptions((node) =>
                        node.group && node.key === 'Americas' && node.level === 0 ? 'bottom' : null
                    ),
                });

                const pivotCol = findPivotColumn(api, 2021);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                    PINNED_BOTTOM id:b-bottom-row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                `);

                // Edit the PINNED filler group
                const pinnedAmericas = api.getPinnedBottomRow(0) as RowNode;
                expect(pinnedAmericas).toBeDefined();

                if (editMode === 'ui') {
                    await editCell(api, pinnedAmericas!, pivotColId, '6200');
                } else {
                    pinnedAmericas!.setDataValue(pivotColId, 6200, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Both pinned and source filler should be updated, children should have cascaded values
                const americasNode = api.getRowNode('row-group-region-Americas');
                expect(pinnedAmericas?.aggData?.[pivotColId]).toBe(6200);
                expect(americasNode?.aggData?.[pivotColId]).toBe(6200);

                // Children should have cascaded (6200 / 2 = 3100 each)
                const usaNode = api.getRowNode('row-group-region-Americas-country-USA');
                const canadaNode = api.getRowNode('row-group-region-Americas-country-Canada');
                expect(usaNode?.aggData?.[pivotColId]).toBe(3100);
                expect(canadaNode?.aggData?.[pivotColId]).toBe(3100);

                await new GridRows(api, 'after pinned filler edit', gridRowsOptions).check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:9200
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:6200
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:3100
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:3100
                    PINNED_BOTTOM id:b-bottom-row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:6200
                `);
            });

            test('editing nested leaf group updates parent filler and pinned filler', async () => {
                const api = await gridsManager.createGridAndWait('pivot-pinned-nested-leaf', {
                    ...createMultiLevelGridOptions((node) =>
                        node.group && node.key === 'Europe' && node.level === 0 ? 'top' : null
                    ),
                });

                const pivotCol = findPivotColumn(api, 2021);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                // Edit the nested leaf group (France under Europe)
                const franceNode = api.getRowNode('row-group-region-Europe-country-France');
                expect(franceNode).toBeDefined();

                if (editMode === 'ui') {
                    await editCell(api, franceNode!, pivotColId, '2400');
                } else {
                    franceNode!.setDataValue(pivotColId, 2400, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Parent filler and pinned filler should both be updated
                const europeNode = api.getRowNode('row-group-region-Europe');
                const pinnedEurope = api.getPinnedTopRow(0) as RowNode;
                expect(franceNode?.aggData?.[pivotColId]).toBe(2400);
                expect(europeNode?.aggData?.[pivotColId]).toBe(4200); // 2400 + 1800 (Germany unchanged)
                expect(pinnedEurope?.aggData?.[pivotColId]).toBe(4200);

                await new GridRows(api, 'after nested leaf edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:4200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:7300
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:4200
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:2400
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);
            });
        });
    });

    describe('pinned leaf group and filler group together', () => {
        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            test('editing nested leaf with both parent and sibling pinned', async () => {
                const api = await gridsManager.createGridAndWait('pivot-complex-pinned', {
                    ...createGridOptions(() => null), // Will set custom
                    columnDefs: [
                        { field: 'region', rowGroup: true, hide: true },
                        { field: 'country', rowGroup: true, hide: true },
                        { field: 'year', pivot: true, hide: true },
                        {
                            field: 'sales',
                            aggFunc: 'sum',
                            hide: true,
                            editable: true,
                            groupRowEditable: true,
                            groupRowValueSetter: cascadeGroupRowValueSetter,
                        },
                    ],
                    isRowPinned: (node) => {
                        if (!node.group) {
                            return null;
                        }
                        // Pin Europe (filler) to top
                        if (node.key === 'Europe' && node.level === 0) {
                            return 'top';
                        }
                        // Pin France (leaf under Europe) also to top
                        if (node.key === 'France') {
                            return 'top';
                        }
                        return null;
                    },
                });

                const pivotCol = findPivotColumn(api, 2020);
                const pivotColId = pivotCol!.getColId();

                await new GridRows(api, 'before edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    PINNED_TOP id:t-top-row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                // Edit the pinned France leaf group
                const pinnedFrance = api.getPinnedTopRow(1) as RowNode;
                expect(pinnedFrance?.key).toBe('France');

                if (editMode === 'ui') {
                    await editCell(api, pinnedFrance!, pivotColId, '2000');
                } else {
                    pinnedFrance!.setDataValue(pivotColId, 2000, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Both pinned France and source should be updated
                // Pinned Europe should also reflect the updated aggregation
                const franceNode = api.getRowNode('row-group-region-Europe-country-France');
                const europeNode = api.getRowNode('row-group-region-Europe');
                const pinnedEurope = api.getPinnedTopRow(0) as RowNode;

                expect(pinnedFrance?.aggData?.[pivotColId]).toBe(2000);
                expect(franceNode?.aggData?.[pivotColId]).toBe(2000);
                expect(europeNode?.aggData?.[pivotColId]).toBe(3500); // 2000 + 1500 (Germany)
                expect(pinnedEurope?.aggData?.[pivotColId]).toBe(3500);

                await new GridRows(api, 'after pinned leaf edit', gridRowsOptions).check(`
                    PINNED_TOP id:t-top-row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:3500 pivot_year_2021_sales:3000
                    PINNED_TOP id:t-top-row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6300 pivot_year_2021_sales:6100
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:3500 pivot_year_2021_sales:3000
                    │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                    │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                    · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);
            });
        });
    });
});
