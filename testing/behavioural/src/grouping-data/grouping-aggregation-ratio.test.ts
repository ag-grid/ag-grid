import type { GridApi, IAggFuncParams, IAggFuncResult, IRowNode, ValueGetterParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

/**
 * Mirrors the `multi-level-ratio` documentation example. The aggFunc + value getter pair
 * produce a `RatioResult` for both leaves and groups, so the aggFunc reads each child the
 * same way at every level.
 */
class RatioResult implements IAggFuncResult<number | null> {
    readonly value: number | null;

    constructor(
        readonly gold: number,
        readonly silver: number
    ) {
        this.value = silver ? gold / silver : null;
    }

    toNumber(): number | null {
        return this.value;
    }

    toString() {
        const value = this.value;
        return value === null ? '' : value.toFixed(2);
    }
}

interface MedalRow {
    id: string;
    country: string;
    year: number;
    gold: number;
    silver: number;
}

function leafRatioValueGetter(params: ValueGetterParams<MedalRow>): RatioResult | undefined {
    if (!params.data) {
        return undefined;
    }
    const { gold, silver } = params.data;
    return new RatioResult(gold, silver);
}

function ratioAggFunc(params: IAggFuncParams<MedalRow>): RatioResult {
    let gold = 0;
    let silver = 0;
    for (const child of params.aggregatedChildren) {
        const ratio = child.getDataValue(params.column, 'data');
        if (ratio instanceof RatioResult) {
            gold += ratio.gold;
            silver += ratio.silver;
        }
    }
    return new RatioResult(gold, silver);
}

function findGroupRow(api: GridApi, key: string): IRowNode {
    let found: IRowNode | undefined;
    api.forEachNode((node) => {
        if (node.group && node.key === key && !found) {
            found = node;
        }
    });
    if (!found) {
        throw new Error(`Group row '${key}' not found`);
    }
    return found;
}

describe('ratio-of-sums aggregation via IAggFuncResult wrapper', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('rolls up gold/silver totals correctly across multiple grouping levels', async () => {
        const api = gridsManager.createGrid('ratio-multi-level', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                {
                    headerName: 'Gold to Silver',
                    colId: 'goldSilverRatio',
                    aggFunc: 'ratio',
                    valueGetter: leafRatioValueGetter,
                },
            ],
            aggFuncs: { ratio: ratioAggFunc },
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'Ireland', year: 2000, gold: 3, silver: 1 },
                { id: '2', country: 'Ireland', year: 2000, gold: 1, silver: 1 },
                { id: '3', country: 'Ireland', year: 2004, gold: 6, silver: 2 },
            ] satisfies MedalRow[],
        });
        await new GridColumns(api, `rolls up gold/silver totals correctly across multiple grouping levels setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── goldSilverRatio "Gold to Silver" width:200 aggFunc:ratio
            `);
        await new GridRows(api, `rolls up gold/silver totals correctly across multiple grouping levels setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" goldSilverRatio:{"gold":10,"silver":4,"value":2.5}
                · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000 goldSilverRatio:{"gold":4,"silver":2,"value":2}
                · │ ├── LEAF id:1 country:"Ireland" year:2000 goldSilverRatio:{"gold":3,"silver":1,"value":3}
                · │ └── LEAF id:2 country:"Ireland" year:2000 goldSilverRatio:{"gold":1,"silver":1,"value":1}
                · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2004 ag-Grid-AutoColumn:2004 goldSilverRatio:{"gold":6,"silver":2,"value":3}
                · · └── LEAF id:3 country:"Ireland" year:2004 goldSilverRatio:{"gold":6,"silver":2,"value":3}
            `
        );

        // Year-level sums
        const year2000 = findGroupRow(api, '2000').aggData?.goldSilverRatio;
        const year2004 = findGroupRow(api, '2004').aggData?.goldSilverRatio;
        expect(year2000).toBeInstanceOf(RatioResult);
        expect(year2000.gold).toBe(4);
        expect(year2000.silver).toBe(2);
        expect(year2000.toNumber()).toBe(2);
        expect(year2004.gold).toBe(6);
        expect(year2004.silver).toBe(2);
        expect(year2004.toNumber()).toBe(3);

        // Country-level sums the year wrappers (not the year ratios).
        const ireland = findGroupRow(api, 'Ireland').aggData?.goldSilverRatio;
        expect(ireland.gold).toBe(10);
        expect(ireland.silver).toBe(4);
        expect(ireland.toNumber()).toBe(2.5);
        expect(ireland.toString()).toBe('2.50');
        await new GridRows(api, `rolls up gold/silver totals correctly across multiple grouping levels final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" goldSilverRatio:{"gold":10,"silver":4,"value":2.5}
                · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000 goldSilverRatio:{"gold":4,"silver":2,"value":2}
                · │ ├── LEAF id:1 country:"Ireland" year:2000 goldSilverRatio:{"gold":3,"silver":1,"value":3}
                · │ └── LEAF id:2 country:"Ireland" year:2000 goldSilverRatio:{"gold":1,"silver":1,"value":1}
                · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2004 ag-Grid-AutoColumn:2004 goldSilverRatio:{"gold":6,"silver":2,"value":3}
                · · └── LEAF id:3 country:"Ireland" year:2004 goldSilverRatio:{"gold":6,"silver":2,"value":3}
            `);
    });

    test('child group with zero silver still contributes its gold to the parent total', async () => {
        const api = gridsManager.createGrid('ratio-zero-silver-child', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                {
                    headerName: 'Gold to Silver',
                    colId: 'goldSilverRatio',
                    aggFunc: 'ratio',
                    valueGetter: leafRatioValueGetter,
                },
            ],
            aggFuncs: { ratio: ratioAggFunc },
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                // 2000: gold-only — every child's silver is 0.
                { id: '1', country: 'Ireland', year: 2000, gold: 5, silver: 0 },
                { id: '2', country: 'Ireland', year: 2000, gold: 2, silver: 0 },
                // 2004: has silver. Country-level rollup must combine both years.
                { id: '3', country: 'Ireland', year: 2004, gold: 0, silver: 5 },
            ] satisfies MedalRow[],
        });
        await new GridColumns(api, `child group with zero silver still contributes its gold to the parent total setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── goldSilverRatio "Gold to Silver" width:200 aggFunc:ratio
            `);
        await new GridRows(api, `child group with zero silver still contributes its gold to the parent total setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" goldSilverRatio:{"gold":7,"silver":5,"value":1.4}
                · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000 goldSilverRatio:{"gold":7,"silver":0,"value":null}
                · │ ├── LEAF id:1 country:"Ireland" year:2000 goldSilverRatio:{"gold":5,"silver":0,"value":null}
                · │ └── LEAF id:2 country:"Ireland" year:2000 goldSilverRatio:{"gold":2,"silver":0,"value":null}
                · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2004 ag-Grid-AutoColumn:2004 goldSilverRatio:{"gold":0,"silver":5,"value":0}
                · · └── LEAF id:3 country:"Ireland" year:2004 goldSilverRatio:{"gold":0,"silver":5,"value":0}
            `);

        const year2000 = findGroupRow(api, '2000').aggData?.goldSilverRatio;
        expect(year2000).toBeInstanceOf(RatioResult);
        expect(year2000.gold).toBe(7);
        expect(year2000.silver).toBe(0);
        // No denominator — wrapper exposes `null` to sort/filter/chart paths, blank to display.
        expect(year2000.value).toBeNull();
        expect(year2000.toNumber()).toBeNull();
        expect(year2000.toString()).toBe('');

        const year2004 = findGroupRow(api, '2004').aggData?.goldSilverRatio;
        expect(year2004.gold).toBe(0);
        expect(year2004.silver).toBe(5);
        expect(year2004.toNumber()).toBe(0);

        // Parent sums both years' gold and silver — would have been 0/5 if the zero-silver
        // year had returned null instead of a RatioResult.
        const ireland = findGroupRow(api, 'Ireland').aggData?.goldSilverRatio;
        expect(ireland).toBeInstanceOf(RatioResult);
        expect(ireland.gold).toBe(7);
        expect(ireland.silver).toBe(5);
        expect(ireland.toNumber()).toBe(7 / 5);
        await new GridRows(
            api,
            `child group with zero silver still contributes its gold to the parent total final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" goldSilverRatio:{"gold":7,"silver":5,"value":1.4}
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000 goldSilverRatio:{"gold":7,"silver":0,"value":null}
            · │ ├── LEAF id:1 country:"Ireland" year:2000 goldSilverRatio:{"gold":5,"silver":0,"value":null}
            · │ └── LEAF id:2 country:"Ireland" year:2000 goldSilverRatio:{"gold":2,"silver":0,"value":null}
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2004 ag-Grid-AutoColumn:2004 goldSilverRatio:{"gold":0,"silver":5,"value":0}
            · · └── LEAF id:3 country:"Ireland" year:2004 goldSilverRatio:{"gold":0,"silver":5,"value":0}
        `);
    });
});
