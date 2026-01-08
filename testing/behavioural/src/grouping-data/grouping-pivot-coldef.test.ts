import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('pivot mode column definitions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pivot result column definitions remain consistent after setGridOption', async () => {
        const columnDefs = cachedJSONObjects.array([
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum' },
        ]);

        const rowData = cachedJSONObjects.array([
            { country: 'USA', sport: 'Gymnastics', year: 2020, gold: 5 },
            { country: 'USA', sport: 'Gymnastics', year: 2021, gold: 3 },
            { country: 'USA', sport: 'Swimming', year: 2020, gold: 8 },
            { country: 'China', sport: 'Gymnastics', year: 2020, gold: 4 },
        ]);

        const gridOptions: GridOptions = {
            columnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: ({ data }) => `${data.country}-${data.sport}-${data.year}`,
            processPivotResultColDef: (colDef) => {
                colDef.context = 'hello';
            },
        };

        const api = gridsManager.createGrid('pivotColDefTest', gridOptions);

        // Snapshot before setGridOption
        let gridRows = new GridRows(api, 'before setGridOption');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:9 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:12 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:5 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            │ ├── LEAF hidden id:USA-Gymnastics-2020
            │ ├── LEAF hidden id:USA-Gymnastics-2021
            │ └── LEAF hidden id:USA-Swimming-2020
            └─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:4 pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2020_gold:null pivot_sport-year_Swimming_gold:null
            · └── LEAF hidden id:China-Gymnastics-2020
        `);

        const instanceIdMap = new Map<object, number>();
        const getInstanceId = (obj: unknown) => {
            if (obj == null) {
                return obj;
            }
            if (!instanceIdMap.has(obj)) {
                instanceIdMap.set(obj, instanceIdMap.size + 1);
            }
            return instanceIdMap.get(obj)!;
        };

        const captureColDefState = (col: any) => ({
            field: col.getColDef().field,
            colId: col.getColId(),
            instance: getInstanceId(col.getColDef()),
            context: getInstanceId(col.getColDef().context),
            valueGetter: getInstanceId(col.getColDef().valueGetter),
            valueSetter: getInstanceId(col.getColDef().valueSetter),
        });

        // Get pivot result columns before setGridOption
        const pivotColsBefore = api.getPivotResultColumns() || [];
        const colDefsBefore = pivotColsBefore!.map(captureColDefState);

        // Re-apply the same columnDefs via setGridOption
        api.setGridOption('columnDefs', columnDefs);

        // Snapshot after setGridOption
        gridRows = new GridRows(api, 'after setGridOption (no real changes)');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:9 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:12 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:5 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            │ ├── LEAF hidden id:USA-Gymnastics-2020
            │ ├── LEAF hidden id:USA-Gymnastics-2021
            │ └── LEAF hidden id:USA-Swimming-2020
            └─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:4 pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2020_gold:null pivot_sport-year_Swimming_gold:null
            · └── LEAF hidden id:China-Gymnastics-2020
        `);

        // Get pivot result columns after setGridOption
        const pivotColsAfter = api.getPivotResultColumns() || [];
        const colDefsAfter = pivotColsAfter.map(captureColDefState);

        // Verify that the column definitions and IDs remain the same
        expect(colDefsAfter).toEqual(colDefsBefore);

        // Now test with an actual change: update the aggregation function to 'count'
        const updatedColumnDefs = cachedJSONObjects.array([
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'count' },
        ]);

        api.setGridOption('columnDefs', updatedColumnDefs);

        // Snapshot after aggFunc change
        gridRows = new GridRows(api, 'after aggFunc change to count');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:{"value":2} pivot_sport-year_Gymnastics-2021_gold:{"value":1} pivot_sport-year_Gymnastics_gold:{"value":3} pivot_sport-year_Swimming-2020_gold:{"value":1} pivot_sport-year_Swimming_gold:{"value":1}
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:{"value":1} pivot_sport-year_Gymnastics-2021_gold:{"value":1} pivot_sport-year_Gymnastics_gold:{"value":2} pivot_sport-year_Swimming-2020_gold:{"value":1} pivot_sport-year_Swimming_gold:{"value":1}
            │ ├── LEAF hidden id:USA-Gymnastics-2020
            │ ├── LEAF hidden id:USA-Gymnastics-2021
            │ └── LEAF hidden id:USA-Swimming-2020
            └─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:{"value":1} pivot_sport-year_Gymnastics-2021_gold:{"value":0} pivot_sport-year_Gymnastics_gold:{"value":1} pivot_sport-year_Swimming-2020_gold:{"value":0} pivot_sport-year_Swimming_gold:{"value":0}
            · └── LEAF hidden id:China-Gymnastics-2020
        `);

        // Verify that aggFunc was updated in the pivot columns
        const pivotColsWithNewAgg = api.getPivotResultColumns() || [];
        const dataWithNewAgg = pivotColsWithNewAgg.map((col) => {
            const colDef = col.getColDef();
            return {
                colId: col.getColId(),
                aggFunc: colDef.aggFunc || (colDef.pivotValueColumn ? colDef.pivotValueColumn.getAggFunc() : undefined),
            };
        });

        // Verify that colIds remain the same but aggFuncs were updated
        expect(dataWithNewAgg.map((d) => d.colId)).toEqual(colDefsBefore.map((d) => d.colId));
        // Verify that all aggFuncs changed from 'sum' to 'count'
        expect(dataWithNewAgg.every((d) => d.aggFunc === 'count')).toBe(true);
    });

    test('pivot result column IDs and instances are recreated when pivot keys change', async () => {
        const columnDefs = cachedJSONObjects.array([
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year' },
            { field: 'gold', aggFunc: 'sum' },
        ]);

        const rowData = cachedJSONObjects.array([
            { country: 'USA', sport: 'Gymnastics', year: 2020, gold: 5 },
            { country: 'USA', sport: 'Gymnastics', year: 2021, gold: 3 },
            { country: 'USA', sport: 'Swimming', year: 2020, gold: 8 },
            { country: 'China', sport: 'Gymnastics', year: 2020, gold: 4 },
        ]);

        const api = gridsManager.createGrid('pivotColIdUpdate', {
            columnDefs,
            pivotMode: true,
            rowData,
        });

        let gridRows = new GridRows(api, 'initial single pivot');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Gymnastics_gold:12 pivot_sport_Swimming_gold:8
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport_Gymnastics_gold:8 pivot_sport_Swimming_gold:8
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            └─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport_Gymnastics_gold:4 pivot_sport_Swimming_gold:null
            · └── LEAF hidden id:3
        `);

        const getPivotResultColByKeys = (keys: string[]) =>
            (api.getPivotResultColumns() || []).find((col) => {
                const pivotKeys = col.getColDef().pivotKeys ?? [];
                return pivotKeys.length === keys.length && pivotKeys.every((key, idx) => key === keys[idx]);
            });

        const originalGymCol = getPivotResultColByKeys(['Gymnastics']);
        expect(originalGymCol).toBeDefined();
        expect(originalGymCol!.getColId()).toBe('pivot_sport_Gymnastics_gold');
        const originalValueColumn = originalGymCol!.getColDef().pivotValueColumn;
        expect(originalValueColumn).toBeDefined();
        const expectedValueColId = originalValueColumn!.getColId();
        const expectValueColumnConsistency = (col: any) => {
            const colValue = col?.getColDef().pivotValueColumn;
            expect(colValue).toBeDefined();
            expect(colValue!.getColId()).toBe(expectedValueColId);
        };
        expectValueColumnConsistency(originalGymCol);
        expect(getPivotResultColByKeys(['Gymnastics', '2020'])).toBeUndefined();

        api.applyColumnState({
            defaultState: { pivot: false },
            state: [
                { colId: 'sport', pivot: true, pivotIndex: 0 },
                { colId: 'year', pivot: true, pivotIndex: 1 },
            ],
        });

        gridRows = new GridRows(api, 'after enabling sport+year pivot');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:9 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:12 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:5 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            └─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:4 pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2020_gold:null pivot_sport-year_Swimming_gold:null
            · └── LEAF hidden id:3
        `);

        const updatedCol = getPivotResultColByKeys(['Gymnastics', '2020']);
        expect(updatedCol).toBeDefined();
        expect(updatedCol!.getColId()).toBe('pivot_sport-year_Gymnastics-2020_gold');
        expect(updatedCol).not.toBe(originalGymCol);
        expect((api.getPivotResultColumns() || []).includes(originalGymCol!)).toBe(false);
        expectValueColumnConsistency(updatedCol);

        const newRowData = rowData.concat({ country: 'UK', sport: 'Rowing', year: 2022, gold: 2 });
        api.setGridOption('rowData', newRowData);

        gridRows = new GridRows(api, 'after adding UK Rowing 2022');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:9 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:12 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8 pivot_sport-year_Rowing-2022_gold:2 pivot_sport-year_Rowing_gold:2
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:5 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2020_gold:8 pivot_sport-year_Swimming_gold:8 pivot_sport-year_Rowing-2022_gold:null pivot_sport-year_Rowing_gold:null
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            ├─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:4 pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2020_gold:null pivot_sport-year_Swimming_gold:null pivot_sport-year_Rowing-2022_gold:null pivot_sport-year_Rowing_gold:null
            │ └── LEAF hidden id:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Gymnastics-2020_gold:null pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:null pivot_sport-year_Swimming-2020_gold:null pivot_sport-year_Swimming_gold:null pivot_sport-year_Rowing-2022_gold:2 pivot_sport-year_Rowing_gold:2
            · └── LEAF hidden id:4
        `);

        let newPivotCol = getPivotResultColByKeys(['Rowing', '2022']);
        expect(newPivotCol).toBeDefined();
        expect(newPivotCol!.getColId()).toBe('pivot_sport-year_Rowing-2022_gold');
        expectValueColumnConsistency(newPivotCol);

        const swimmingCol = getPivotResultColByKeys(['Swimming', '2020']);
        expect(swimmingCol).toBeDefined();

        const updatedRowData = newRowData.map((row) =>
            row.country === 'USA' && row.sport === 'Swimming' ? { ...row, sport: 'Diving', year: 2023 } : row
        );
        api.setGridOption('rowData', updatedRowData);

        gridRows = new GridRows(api, 'after updating USA Swimming to Diving 2023');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2020_gold:9 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:12 pivot_sport-year_Rowing-2022_gold:2 pivot_sport-year_Rowing_gold:2 pivot_sport-year_Diving-2023_gold:8 pivot_sport-year_Diving_gold:8
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2020_gold:5 pivot_sport-year_Gymnastics-2021_gold:3 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Rowing-2022_gold:null pivot_sport-year_Rowing_gold:null pivot_sport-year_Diving-2023_gold:8 pivot_sport-year_Diving_gold:8
            │ ├── LEAF hidden id:0
            │ ├── LEAF hidden id:1
            │ └── LEAF hidden id:2
            ├─┬ LEAF_GROUP collapsed id:row-group-country-China ag-Grid-AutoColumn:"China" pivot_sport-year_Gymnastics-2020_gold:4 pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Rowing-2022_gold:null pivot_sport-year_Rowing_gold:null pivot_sport-year_Diving-2023_gold:null pivot_sport-year_Diving_gold:null
            │ └── LEAF hidden id:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Gymnastics-2020_gold:null pivot_sport-year_Gymnastics-2021_gold:null pivot_sport-year_Gymnastics_gold:null pivot_sport-year_Rowing-2022_gold:2 pivot_sport-year_Rowing_gold:2 pivot_sport-year_Diving-2023_gold:null pivot_sport-year_Diving_gold:null
            · └── LEAF hidden id:4
        `);

        newPivotCol = getPivotResultColByKeys(['Diving', '2023']);
        expect(newPivotCol).toBeDefined();
        expect(newPivotCol!.getColId()).toBe('pivot_sport-year_Diving-2023_gold');
        expect(newPivotCol).not.toBe(swimmingCol);
        expect((api.getPivotResultColumns() || []).includes(swimmingCol!)).toBe(false);
        expectValueColumnConsistency(newPivotCol);
    });
});
