import { GridColumns, GridRows } from '../../test-utils';
import {
    EDIT_MODES,
    asyncSetTimeout,
    cascadeGroupRowValueSetter,
    editCell,
    gridsManager,
} from './group-edit-test-utils';

afterEach(() => {
    gridsManager.reset();
});

// Tests that cell editing propagates aggregation correctly through ChangeDetectionService,
// exercising both ChangedCellsPath (aggregateOnlyChangedColumns=true) and ChangedRowsPath (false).

describe.each([true, false])(
    'cell edit aggregation with aggregateOnlyChangedColumns=%s',
    (aggregateOnlyChangedColumns) => {
        describe.each(EDIT_MODES)('edit mode: %s', (editMode) => {
            const baselineSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" amount:180 score:360
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" amount:60 score:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30 score:60
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" amount:120 score:240
            │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:50 score:100
            │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
            └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" amount:100 score:200
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" amount:100 score:200
            · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
            · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
        `;

            function createGridOptions() {
                return {
                    defaultColDef: { cellEditor: 'agTextCellEditor' },
                    columnDefs: [
                        { field: 'region', rowGroup: true, hide: true },
                        { field: 'country', rowGroup: true, hide: true },
                        {
                            colId: 'amount',
                            field: 'amount',
                            aggFunc: 'sum',
                            editable: true,
                        },
                        {
                            colId: 'score',
                            field: 'score',
                            aggFunc: 'sum',
                            editable: true,
                        },
                    ],
                    rowData: createMultiColumnRowData(),
                    groupDefaultExpanded: -1,
                    getRowId: (params: { data: { id: string } }) => params.data.id,
                    aggregateOnlyChangedColumns,
                };
            }

            test('single leaf cell edit updates parent aggregations', async () => {
                const api = await gridsManager.createGridAndWait('agg-changed-cols-leaf', createGridOptions());
                await new GridRows(api, 'baseline').check(baselineSnapshot);

                const parisNode = api.getRowNode('fr-paris')!;

                if (editMode === 'ui') {
                    await editCell(api, parisNode, 'amount', '50');
                } else {
                    parisNode.setDataValue('amount', 50, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // amount changed: 30 -> 50, so France = 80, Europe = 200
                // score should remain unchanged
                await new GridRows(api, 'after leaf edit').check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" amount:200 score:360
                    │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" amount:80 score:120
                    │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50 score:60
                    │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
                    │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" amount:120 score:240
                    │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:50 score:100
                    │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" amount:100 score:200
                    · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" amount:100 score:200
                    · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
                    · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── amount "Amount" width:200 aggFunc:sum editable
                    └── score "Score" width:200 aggFunc:sum editable
                `);
            });

            test('sequential edits on different columns propagate correctly', async () => {
                const api = await gridsManager.createGridAndWait('agg-changed-cols-multi', createGridOptions());
                await new GridRows(api, 'baseline').check(baselineSnapshot);

                const berlinNode = api.getRowNode('de-berlin')!;

                // Edit amount: 50 -> 10
                if (editMode === 'ui') {
                    await editCell(api, berlinNode, 'amount', '10');
                } else {
                    berlinNode.setDataValue('amount', 10, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Germany amount: 10 + 70 = 80, Europe amount: 60 + 80 = 140
                await new GridRows(api, 'after amount edit').check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" amount:140 score:360
                    │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" amount:60 score:120
                    │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30 score:60
                    │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
                    │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" amount:80 score:240
                    │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:10 score:100
                    │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" amount:100 score:200
                    · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" amount:100 score:200
                    · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
                    · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
                `);

                // Now edit score on same row: 100 -> 200
                if (editMode === 'ui') {
                    await editCell(api, berlinNode, 'score', '200');
                } else {
                    berlinNode.setDataValue('score', 200, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Germany score: 200 + 140 = 340, Europe score: 120 + 340 = 460
                await new GridRows(api, 'after score edit').check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" amount:140 score:460
                    │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" amount:60 score:120
                    │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30 score:60
                    │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
                    │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" amount:80 score:340
                    │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:10 score:200
                    │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" amount:100 score:200
                    · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" amount:100 score:200
                    · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
                    · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
                `);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── amount "Amount" width:200 aggFunc:sum editable
                    └── score "Score" width:200 aggFunc:sum editable
                `);
            });

            test('editing different rows in sequence updates aggregations independently', async () => {
                const api = await gridsManager.createGridAndWait('agg-changed-cols-diff-rows', createGridOptions());
                await new GridRows(api, 'baseline').check(baselineSnapshot);

                // Edit paris amount: 30 -> 100
                const parisNode = api.getRowNode('fr-paris')!;
                if (editMode === 'ui') {
                    await editCell(api, parisNode, 'amount', '100');
                } else {
                    parisNode.setDataValue('amount', 100, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // Edit nyc amount: 60 -> 200
                const nycNode = api.getRowNode('us-nyc')!;
                if (editMode === 'ui') {
                    await editCell(api, nycNode, 'amount', '200');
                } else {
                    nycNode.setDataValue('amount', 200, 'ui');
                    await asyncSetTimeout(0);
                }
                await asyncSetTimeout(0);

                // France amount: 100 + 30 = 130, Europe: 130 + 120 = 250
                // USA amount: 200 + 40 = 240, Americas: 240
                // Scores unchanged
                await new GridRows(api, 'after edits to different groups').check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" amount:250 score:360
                    │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" amount:130 score:120
                    │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:100 score:60
                    │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
                    │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" amount:120 score:240
                    │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:50 score:100
                    │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
                    └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" amount:240 score:200
                    · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" amount:240 score:200
                    · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:200 score:120
                    · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
                `);
            });
        });
    }
);

describe.each(EDIT_MODES)('cascading group edit with aggregateOnlyChangedColumns (%s)', (editMode) => {
    test.each([true, false])('aggregateOnlyChangedColumns=%s', async (aggregateOnlyChangedColumns) => {
        const api = await gridsManager.createGridAndWait('agg-changed-cols-cascade', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
                {
                    colId: 'score',
                    field: 'score',
                    aggFunc: 'sum',
                    editable: true,
                },
            ],
            rowData: createMultiColumnRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params: { data: { id: string } }) => params.data.id,
            aggregateOnlyChangedColumns,
        });

        const baselineSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:180 score:360
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60 score:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30 score:60
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30 score:60
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120 score:240
            │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:50 score:100
            │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:70 score:140
            └─┬ filler id:row-group-region-Americas amount:100 score:200
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100 score:200
            · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
            · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
        `;

        await new GridRows(api, 'baseline').check(baselineSnapshot);

        // Cascade edit on the Europe filler group: amount 180 -> 360
        // Europe has France(2 leaves) + Germany(2 leaves)
        // cascadeGroupRowValueSetter distributes: 360/2 = 180 per country, 180/2 = 90 per leaf
        const europeNode = api.getRowNode('row-group-region-Europe')!;
        if (editMode === 'ui') {
            await editCell(api, europeNode, 'amount', '360');
        } else {
            europeNode.setDataValue('amount', 360, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        // Europe amount: 360, scores unchanged
        await new GridRows(api, 'after cascade edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:360 score:360
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:180 score:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:90 score:60
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:90 score:60
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:180 score:240
            │ · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:90 score:100
            │ · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:90 score:140
            └─┬ filler id:row-group-region-Americas amount:100 score:200
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100 score:200
            · · ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:60 score:120
            · · └── LEAF id:us-la region:"Americas" country:"USA" amount:40 score:80
        `);
    });
});

/** Row data with two value columns for testing column-level change tracking */
function createMultiColumnRowData() {
    return [
        { id: 'fr-paris', region: 'Europe', country: 'France', amount: 30, score: 60 },
        { id: 'fr-lyon', region: 'Europe', country: 'France', amount: 30, score: 60 },
        { id: 'de-berlin', region: 'Europe', country: 'Germany', amount: 50, score: 100 },
        { id: 'de-hamburg', region: 'Europe', country: 'Germany', amount: 70, score: 140 },
        { id: 'us-nyc', region: 'Americas', country: 'USA', amount: 60, score: 120 },
        { id: 'us-la', region: 'Americas', country: 'USA', amount: 40, score: 80 },
    ];
}
