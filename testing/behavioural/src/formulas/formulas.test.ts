import { vi } from 'vitest';
import type { MockInstance } from 'vitest';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

const rowNumberRefreshBufferMs = 25;

describe('ag-grid formulas general behaviour', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, FormulaModule, TextEditorModule] as Module[],
    });

    let randomSpy: MockInstance | undefined;
    let usingFakeTimers = false;

    const useFakeTimers = () => {
        usingFakeTimers = true;
        vi.useFakeTimers();
    };

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        randomSpy?.mockRestore();
        randomSpy = undefined;
        if (usingFakeTimers) {
            vi.useRealTimers();
            usingFakeTimers = false;
        }
    });

    const defaultGridRowsOptions: GridRowsOptions = {
        printHiddenRows: true,
        checkDom: true,
        columns: true,
    };

    test('constants and cell references evaluate correctly', async () => {
        const rowData = [
            { id: 'value-a1', value: 10 },
            { id: 'value-a2', value: 20 },
            { id: 'constant-pi', value: '=3.14' },
            { id: 'constant-hello', value: '="Hello"' },
            { id: 'constant-true', value: '=TRUE' },
            { id: 'relative-a1', value: '=REF(COLUMN("value"),ROW("value-a1"))' },
            { id: 'absolute-row-a$1', value: '=REF(COLUMN("value"),ROW("1",true))' },
            { id: 'absolute-col-$a1', value: '=REF(COLUMN("A",true),ROW("value-a1"))' },
            { id: 'absolute-both-$a$1', value: '=REF(COLUMN("A",true),ROW("1",true))' },
            { id: 'relative-a2', value: '=REF(COLUMN("value"),ROW("value-a2"))' },
            { id: 'absolute-row-a$2', value: '=REF(COLUMN("value"),ROW("2",true))' },
            { id: 'absolute-col-$a2', value: '=REF(COLUMN("A",true),ROW("value-a2"))' },
            { id: 'absolute-both-$a$2', value: '=REF(COLUMN("A",true),ROW("2",true))' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }],
        };

        const api = gridsManager.createGrid('formulas-constants', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        let gridRows = new GridRows(api, 'initial constants', {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: ['value'],
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:value-a1 value:10
            ├── LEAF id:value-a2 value:20
            ├── LEAF id:constant-pi value:3.14
            ├── LEAF id:constant-hello value:"Hello"
            ├── LEAF id:constant-true value:true
            ├── LEAF id:relative-a1 value:10
            ├── LEAF id:"absolute-row-a$1" value:10
            ├── LEAF id:"absolute-col-$a1" value:10
            ├── LEAF id:"absolute-both-$a$1" value:10
            ├── LEAF id:relative-a2 value:20
            ├── LEAF id:"absolute-row-a$2" value:20
            ├── LEAF id:"absolute-col-$a2" value:20
            └── LEAF id:"absolute-both-$a$2" value:20
        `);

        const updatedRow2 = { ...rowData[1], value: 50 };
        api.applyTransaction({ update: [updatedRow2] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after update', {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: ['value'],
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:value-a1 value:10
            ├── LEAF id:value-a2 value:50
            ├── LEAF id:constant-pi value:3.14
            ├── LEAF id:constant-hello value:"Hello"
            ├── LEAF id:constant-true value:true
            ├── LEAF id:relative-a1 value:10
            ├── LEAF id:"absolute-row-a$1" value:10
            ├── LEAF id:"absolute-col-$a1" value:10
            ├── LEAF id:"absolute-both-$a$1" value:10
            ├── LEAF id:relative-a2 value:50
            ├── LEAF id:"absolute-row-a$2" value:50
            ├── LEAF id:"absolute-col-$a2" value:50
            └── LEAF id:"absolute-both-$a$2" value:50
        `);
    });

    test('arithmetic and comparison operators produce expected results', async () => {
        const rowData = [
            {
                id: 'ops',
                A: 5,
                B: 2,
                C: 'Hi',
                add: '=REF(COLUMN("A"),ROW("ops"))+REF(COLUMN("B"),ROW("ops"))',
                subtract: '=REF(COLUMN("A"),ROW("ops"))-REF(COLUMN("B"),ROW("ops"))',
                multiply: '=REF(COLUMN("A"),ROW("ops"))*REF(COLUMN("B"),ROW("ops"))',
                divide: '=REF(COLUMN("A"),ROW("ops"))/REF(COLUMN("B"),ROW("ops"))',
                exponent: '=REF(COLUMN("A"),ROW("ops"))^REF(COLUMN("B"),ROW("ops"))',
                concat: '=REF(COLUMN("C"),ROW("ops"))&" there"',
                equal: '=REF(COLUMN("A"),ROW("ops"))=REF(COLUMN("B"),ROW("ops"))',
                notEqual: '=REF(COLUMN("A"),ROW("ops"))<>REF(COLUMN("B"),ROW("ops"))',
                greaterThan: '=REF(COLUMN("A"),ROW("ops"))>REF(COLUMN("B"),ROW("ops"))',
                lessThan: '=REF(COLUMN("A"),ROW("ops"))<REF(COLUMN("B"),ROW("ops"))',
                greaterThanOrEqual: '=REF(COLUMN("A"),ROW("ops"))>=REF(COLUMN("B"),ROW("ops"))',
                lessThanOrEqual: '=REF(COLUMN("A"),ROW("ops"))<=REF(COLUMN("B"),ROW("ops"))',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'A' },
                { field: 'B' },
                { field: 'C' },
                { field: 'add' },
                { field: 'subtract' },
                { field: 'multiply' },
                { field: 'divide' },
                { field: 'exponent' },
                { field: 'concat' },
                { field: 'equal' },
                { field: 'notEqual' },
                { field: 'greaterThan' },
                { field: 'lessThan' },
                { field: 'greaterThanOrEqual' },
                { field: 'lessThanOrEqual' },
            ],
        };

        const api = gridsManager.createGrid('formulas-operators', gridOptions);

        const gridRows = new GridRows(api, 'operators', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ops row-number:"1" A:5 B:2 C:"Hi" add:7 subtract:3 multiply:10 divide:2.5 exponent:25 concat:"Hi there" equal:false notEqual:true greaterThan:true lessThan:false greaterThanOrEqual:true lessThanOrEqual:false
        `);
    });

    test('numeric helpers and documented formulas evaluate across rows', async () => {
        randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123);

        const rowData = [
            { id: 'value-a1', value: 2, altValue: 10, category: 'Low' },
            { id: 'value-a2', value: 4, altValue: 20, category: 'High' },
            { id: 'value-a3', value: 6, altValue: 30, category: 'Low' },
            { id: 'value-a4', value: 8, altValue: 40, category: 'High' },
            { id: 'sum-a1-a4', value: '=SUM(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))' },
            {
                id: 'sumif-a-range-gt-4',
                value: '=SUMIF(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")),">4")',
            },
            {
                id: 'sumif-high-category-a-values',
                value: '=SUMIF(REF(COLUMN("category"),ROW("value-a1"),COLUMN("category"),ROW("value-a4")),"High",REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))',
            },
            {
                id: 'sumif-high-category-b-values',
                value: '=SUMIF(REF(COLUMN("category"),ROW("value-a1"),COLUMN("category"),ROW("value-a4")),"High",REF(COLUMN("altValue"),ROW("value-a1"),COLUMN("altValue"),ROW("value-a4")))',
            },
            {
                id: 'minus-a3-minus-a1',
                value: '=MINUS(REF(COLUMN("value"),ROW("value-a3")),REF(COLUMN("value"),ROW("value-a1")))',
            },
            {
                id: 'multiply-a1-a2-times-2',
                value: '=MULTIPLY(REF(COLUMN("value"),ROW("value-a1")),REF(COLUMN("value"),ROW("value-a2")),2)',
            },
            {
                id: 'divide-a3-by-a2',
                value: '=DIVIDE(REF(COLUMN("value"),ROW("value-a3")),REF(COLUMN("value"),ROW("value-a2")))',
            },
            { id: 'min-a1-a4', value: '=MIN(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))' },
            { id: 'max-a1-a4', value: '=MAX(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))' },
            {
                id: 'average-a1-a4',
                value: '=AVERAGE(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))',
            },
            {
                id: 'median-a1-a4',
                value: '=MEDIAN(REF(COLUMN("value"),ROW("value-a1"),COLUMN("value"),ROW("value-a4")))',
            },
            { id: 'percent-b2', value: '=PERCENT(REF(COLUMN("altValue"),ROW("value-a2")))' },
            { id: 'power-b2-squared', value: '=POWER(REF(COLUMN("altValue"),ROW("value-a2")),2)' },
            { id: 'rand-fixed', value: '=RAND()' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value' }, { field: 'altValue' }, { field: 'category' }],
        };

        const api = gridsManager.createGrid('formulas-numeric-rows', gridOptions);

        const gridRows = new GridRows(api, 'numeric helpers across rows', {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: ['value'],
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:value-a1 value:2
            ├── LEAF id:value-a2 value:4
            ├── LEAF id:value-a3 value:6
            ├── LEAF id:value-a4 value:8
            ├── LEAF id:sum-a1-a4 value:20
            ├── LEAF id:sumif-a-range-gt-4 value:14
            ├── LEAF id:sumif-high-category-a-values value:12
            ├── LEAF id:sumif-high-category-b-values value:60
            ├── LEAF id:minus-a3-minus-a1 value:4
            ├── LEAF id:multiply-a1-a2-times-2 value:16
            ├── LEAF id:divide-a3-by-a2 value:1.5
            ├── LEAF id:min-a1-a4 value:2
            ├── LEAF id:max-a1-a4 value:8
            ├── LEAF id:average-a1-a4 value:5
            ├── LEAF id:median-a1-a4 value:5
            ├── LEAF id:percent-b2 value:0.2
            ├── LEAF id:power-b2-squared value:400
            └── LEAF id:rand-fixed value:0.123
        `);
    });

    test('nested expressions respect evaluation order', async () => {
        const rowData = [
            {
                id: 'nested',
                A: 4,
                B: '=A1 * 5 + POWER(2, 3)',
                C: '=CUSTOMADD(REF(COLUMN("A"),ROW("nested")),6)',
                D: '=CUSTOMADD((REF(COLUMN("A"),ROW("nested"))+2)*3,SUM(2,REF(COLUMN("C"),ROW("nested"))),MAX(REF(COLUMN("A"),ROW("nested")),REF(COLUMN("B"),ROW("nested"))),IF(REF(COLUMN("A"),ROW("nested"))>2,1,10))',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'C' }, { field: 'D' }],
            formulaFuncs: {
                CUSTOMADD: {
                    func: (params) => {
                        let total = 0;
                        const addValue = (input: unknown) => {
                            if (Array.isArray(input)) {
                                input.forEach(addValue);
                                return;
                            }
                            const numeric = Number(input);
                            if (!Number.isNaN(numeric)) {
                                total += numeric;
                            }
                        };
                        for (const value of Array.from(params.values)) {
                            addValue(value);
                        }
                        return total;
                    },
                },
            },
        };

        const api = gridsManager.createGrid('formulas-nested-order', gridOptions);

        const gridRows = new GridRows(api, 'nested evaluation order', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:nested row-number:"1" A:4 B:28 C:10 D:59
        `);
    });

    test('counting functions evaluate full ranges', async () => {
        const rowData = [
            {
                id: '1',
                A: 1,
                B: 'Alpha',
                C: 'first',
                countNumbers: '=COUNT(REF(COLUMN("A"),ROW("1"),COLUMN("A"),ROW("4")))',
                countAll: '=COUNTA(REF(COLUMN("A"),ROW("1"),COLUMN("C"),ROW("4")))',
                countBlank: '=COUNTBLANK(REF(COLUMN("A"),ROW("1"),COLUMN("C"),ROW("4")))',
                countIfAlpha: '=COUNTIF(REF(COLUMN("B"),ROW("1"),COLUMN("B"),ROW("4")),"Alpha")',
                countIfGreaterThanTwo: '=COUNTIF(REF(COLUMN("A"),ROW("1"),COLUMN("A"),ROW("4")),">2")',
            },
            { id: '2', A: 2, B: 'Bravo', C: null },
            { id: '3', A: null, B: null, C: null },
            { id: '4', A: 5, B: 'Alpha', C: '' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'A' },
                { field: 'B' },
                { field: 'C' },
                { field: 'countNumbers' },
                { field: 'countAll' },
                { field: 'countBlank' },
                { field: 'countIfAlpha' },
                { field: 'countIfGreaterThanTwo' },
            ],
        };

        const api = gridsManager.createGrid('formulas-counting', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'counting functions', {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:"Alpha" C:"first" countNumbers:3 countAll:7 countBlank:5 countIfAlpha:2 countIfGreaterThanTwo:1
            ├── LEAF id:2 row-number:"2" A:2 B:"Bravo" C:null
            ├── LEAF id:3 row-number:"3" A:null B:null C:null
            └── LEAF id:4 row-number:"4" A:5 B:"Alpha" C:""
        `);
    });

    test('logical helper functions return booleans and branches', async () => {
        const rowData = [
            {
                id: 'logic',
                A: 5,
                B: 3,
                branch: '=IF(REF(COLUMN("A"),ROW("logic"))>REF(COLUMN("B"),ROW("logic")),"High","Low")',
                equals: '=EQ(REF(COLUMN("A"),ROW("logic")),REF(COLUMN("B"),ROW("logic")))',
                notEquals: '=NE(REF(COLUMN("A"),ROW("logic")),REF(COLUMN("B"),ROW("logic")))',
                greater: '=GT(REF(COLUMN("A"),ROW("logic")),REF(COLUMN("B"),ROW("logic")))',
                greaterOrEqual: '=GTE(REF(COLUMN("A"),ROW("logic")),5)',
                less: '=LT(REF(COLUMN("A"),ROW("logic")),REF(COLUMN("B"),ROW("logic")))',
                lessOrEqual: '=LTE(REF(COLUMN("A"),ROW("logic")),5)',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'A' },
                { field: 'B' },
                { field: 'branch' },
                { field: 'equals' },
                { field: 'notEquals' },
                { field: 'greater' },
                { field: 'greaterOrEqual' },
                { field: 'less' },
                { field: 'lessOrEqual' },
            ],
        };

        const api = gridsManager.createGrid('formulas-logical', gridOptions);

        const gridRows = new GridRows(api, 'logical functions', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:logic row-number:"1" A:5 B:3 branch:"High" equals:false notEquals:true greater:true greaterOrEqual:true less:false lessOrEqual:true
        `);
    });

    test('date functions produce date objects', async () => {
        useFakeTimers();
        const fixedSystemTime = new Date('2024-05-17T13:24:35.456Z');
        vi.setSystemTime(fixedSystemTime);

        try {
            const gridOptions: GridOptions = {
                enableFormulas: true,
                rowNumbers: true,
                rowData: [{ id: 'dates', today: '=TODAY()', now: '=NOW()' }],
                getRowId: (params) => params.data?.id,
                columnDefs: [{ field: 'today' }, { field: 'now' }],
            };

            const api = gridsManager.createGrid('formulas-date', gridOptions);

            const gridRows = new GridRows(api, 'date functions fixed clock', {
                ...defaultGridRowsOptions,
                columns: ['today', 'now'],
            });

            const rowNode = gridRows.displayedRows[0];
            const todayValue = api.getCellValue<Date>({ rowNode, colKey: 'today' })!;
            const nowValue = api.getCellValue<Date>({ rowNode, colKey: 'now' })!;

            expect(todayValue).toBeInstanceOf(Date);
            expect(nowValue).toBeInstanceOf(Date);

            const expectedToday = new Date(fixedSystemTime);
            expectedToday.setHours(0, 0, 0, 0);

            const todayIso = todayValue.toISOString();
            const nowIso = nowValue.toISOString();

            await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:dates today:"${todayIso}" now:"${nowIso}"
        `);

            expect(todayIso).toBe(expectedToday.toISOString());
            expect(nowIso).toBe(fixedSystemTime.toISOString());
            expect(todayValue.getHours()).toBe(0);
            expect(todayValue.getMinutes()).toBe(0);
            expect(todayValue.getSeconds()).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    test('custom iterator formula aggregates values', async () => {
        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData: [
                {
                    id: 'custom',
                    A: 1,
                    B: 2,
                    result: '=CUSTOMSUM(REF(COLUMN("A"),ROW("custom"),COLUMN("B"),ROW("custom")),3)',
                },
            ],
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'result' }],
            formulaFuncs: {
                CUSTOMSUM: {
                    func: (params) => {
                        let total = 0;
                        for (const value of Array.from(params.values)) {
                            total += Number(value);
                        }
                        return total;
                    },
                },
            },
        };

        const api = gridsManager.createGrid('formulas-custom-iterator', gridOptions);

        const gridRows = new GridRows(api, 'custom function', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:custom row-number:"1" A:1 B:2 result:6
        `);
    });

    test('custom function surfaces errors to dependent cells', async () => {
        const rowData = [
            { id: 'error', A: 1, result: '=ERRORIFONE(REF(COLUMN("A"),ROW("error")))' },
            { id: 'ok', A: 2, result: '=ERRORIFONE(REF(COLUMN("A"),ROW("ok")))' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'A' }, { field: 'result' }],
            formulaFuncs: {
                ERRORIFONE: {
                    func: (params) => {
                        for (const value of Array.from(params.values)) {
                            if (Number(value) === 1) {
                                throw new Error("Error, discovered a '1' in params");
                            }
                        }
                        return 'SUCCESS';
                    },
                },
            },
        };

        const api = gridsManager.createGrid('formulas-custom-error', gridOptions);

        const gridRows = new GridRows(api, 'custom error', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:error row-number:"1" A:1 result:"#ERROR!"
            └── LEAF id:ok row-number:"2" A:2 result:"SUCCESS"
        `);
    });

    test('contextual iterator custom function honours ranges', async () => {
        const rowData = [
            {
                id: 'range',
                A: 1,
                B: 1,
                C: 2,
                matchCount: '=COUNTEQ(REF(COLUMN("A"),ROW("range"),COLUMN("C"),ROW("range")),1)',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'A' }, { field: 'B' }, { field: 'C' }, { field: 'matchCount' }],
            formulaFuncs: {
                COUNTEQ: {
                    func: (params) => {
                        const args = Array.from(params.args);
                        if (args.length !== 2) {
                            throw new Error('COUNTEQ requires exactly 2 arguments');
                        }
                        const [range, criteria] = args;
                        if (range.kind !== 'range') {
                            throw new Error('First argument to COUNTEQ must be a range');
                        }
                        if (criteria.kind !== 'value') {
                            throw new Error('Second argument to COUNTEQ must be a value');
                        }
                        const target = criteria.value;
                        let count = 0;
                        for (const value of Array.from(range)) {
                            if (value === target) {
                                count++;
                            }
                        }
                        return count;
                    },
                },
            },
        };

        const api = gridsManager.createGrid('formulas-custom-range', gridOptions);

        const gridRows = new GridRows(api, 'complex custom function', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:range row-number:"1" A:1 B:1 C:2 matchCount:2
        `);
    });

    test('long-hand REF formulas persist when data mutates', async () => {
        const rowData = [
            { id: 'base', source: 100 },
            { id: 'longhand-row', result: '=REF(COLUMN("source"),ROW("base"))' },
            { id: 'absolute-row', result: '=REF(COLUMN("A",true),ROW("1",true))' },
            { id: 'relative-row', result: '=REF(COLUMN("source"),ROW("base"))' },
        ];
        const columnDefs = [{ field: 'source', colId: 'source' }, { field: 'result' }];
        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs,
        };

        const api = gridsManager.createGrid('formulas-longhand', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRowsOptions: GridRowsOptions = {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: ['result'],
        };

        let gridRows = new GridRows(api, 'initial long-hand formulas', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:base
            ├── LEAF id:longhand-row result:100
            ├── LEAF id:absolute-row result:100
            └── LEAF id:relative-row result:100
        `);

        api.applyTransaction({ update: [{ id: 'base', source: 250 }] });

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after base update', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:base
            ├── LEAF id:longhand-row result:250
            ├── LEAF id:absolute-row result:250
            └── LEAF id:relative-row result:250
        `);

        api.applyTransaction({ add: [{ id: 'prepended', source: 10 }], addIndex: 0 });

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after prepending row', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:prepended
            ├── LEAF id:base
            ├── LEAF id:longhand-row result:250
            ├── LEAF id:absolute-row result:10
            └── LEAF id:relative-row result:250
        `);
    });

    test('absolute and relative references track row and column changes', async () => {
        const initialRowData = [
            { id: 'x-base', x: 10, y: 5 },
            { id: 'relative-A1', y: 15, value: '=REF(COLUMN("x"),ROW("x-base"))' },
            { id: 'absolute-row-A$1', value: '=REF(COLUMN("x"),ROW("1",true))' },
            { id: 'absolute-col-$A1', value: '=REF(COLUMN("A",true),ROW("x-base"))' },
            { id: 'absolute-both-$A$1', value: '=REF(COLUMN("A",true),ROW("1",true))' },
            { id: 'x-middle', x: 40, y: 10 },
            { id: 'relative-forward-A6', value: '=REF(COLUMN("x"),ROW("x-middle"))' },
            { id: 'absolute-row-forward-A$6', value: '=REF(COLUMN("x"),ROW("6",true))' },
            { id: 'absolute-col-forward-$A6', value: '=REF(COLUMN("A",true),ROW("x-middle"))' },
            { id: 'absolute-both-forward-$A$6', value: '=REF(COLUMN("A",true),ROW("6",true))' },
            { id: 'relative-self-A11', x: 130, y: 17, value: '=REF(COLUMN("x"),ROW("relative-self-A11"))' },
            { id: 'absolute-row-self-A$12', x: 135, y: 18, value: '=REF(COLUMN("x"),ROW("12",true))' },
            {
                id: 'absolute-col-self-$A13',
                x: 140,
                y: 19,
                value: '=REF(COLUMN("A",true),ROW("absolute-col-self-$A13"))',
            },
            {
                id: 'absolute-mixed-A$1+$B2',
                value: '=REF(COLUMN("x"),ROW("1",true))+REF(COLUMN("B",true),ROW("relative-A1"))',
            },
        ];

        const columnDefs = [{ field: 'x' }, { field: 'y' }, { field: 'value' }];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData: initialRowData,
            getRowId: (params) => params.data?.id,
            columnDefs,
        };

        const api = gridsManager.createGrid('formulas-abs-rel', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: ['value'],
        };

        let gridRows = new GridRows(api, 'initial absolute/relative references', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x-base
            ├── LEAF id:relative-A1 value:10
            ├── LEAF id:"absolute-row-A$1" value:10
            ├── LEAF id:"absolute-col-$A1" value:10
            ├── LEAF id:"absolute-both-$A$1" value:10
            ├── LEAF id:x-middle
            ├── LEAF id:relative-forward-A6 value:40
            ├── LEAF id:"absolute-row-forward-A$6" value:40
            ├── LEAF id:"absolute-col-forward-$A6" value:40
            ├── LEAF id:"absolute-both-forward-$A$6" value:40
            ├── LEAF id:relative-self-A11 value:130
            ├── LEAF id:"absolute-row-self-A$12" value:135
            ├── LEAF id:"absolute-col-self-$A13" value:140
            └── LEAF id:"absolute-mixed-A$1+$B2" value:25
        `);

        const updatedRowData = [
            { id: 'x-base', x: 25, y: 7 },
            { id: 'relative-A1', y: 18, value: '=REF(COLUMN("x"),ROW("x-base"))' },
            { id: 'absolute-row-A$1', value: '=REF(COLUMN("x"),ROW("1",true))' },
            { id: 'absolute-col-$A1', value: '=REF(COLUMN("A",true),ROW("x-base"))' },
            { id: 'absolute-both-$A$1', value: '=REF(COLUMN("A",true),ROW("1",true))' },
            { id: 'x-middle', x: 60, y: 12 },
            { id: 'relative-forward-A6', value: '=REF(COLUMN("x"),ROW("x-middle"))' },
            { id: 'absolute-row-forward-A$6', value: '=REF(COLUMN("x"),ROW("6",true))' },
            { id: 'absolute-col-forward-$A6', value: '=REF(COLUMN("A",true),ROW("x-middle"))' },
            { id: 'absolute-both-forward-$A$6', value: '=REF(COLUMN("A",true),ROW("6",true))' },
            { id: 'relative-self-A11', x: 140, y: 20, value: '=REF(COLUMN("x"),ROW("relative-self-A11"))' },
            { id: 'absolute-row-self-A$12', x: 145, y: 21, value: '=REF(COLUMN("x"),ROW("12",true))' },
            {
                id: 'absolute-col-self-$A13',
                x: 150,
                y: 22,
                value: '=REF(COLUMN("A",true),ROW("absolute-col-self-$A13"))',
            },
            {
                id: 'absolute-mixed-A$1+$B2',
                value: '=REF(COLUMN("x"),ROW("1",true))+REF(COLUMN("B",true),ROW("relative-A1"))',
            },
        ];

        api.updateGridOptions({ rowData: updatedRowData });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after setRowData update', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x-base
            ├── LEAF id:relative-A1 value:25
            ├── LEAF id:"absolute-row-A$1" value:25
            ├── LEAF id:"absolute-col-$A1" value:25
            ├── LEAF id:"absolute-both-$A$1" value:25
            ├── LEAF id:x-middle
            ├── LEAF id:relative-forward-A6 value:60
            ├── LEAF id:"absolute-row-forward-A$6" value:60
            ├── LEAF id:"absolute-col-forward-$A6" value:60
            ├── LEAF id:"absolute-both-forward-$A$6" value:60
            ├── LEAF id:relative-self-A11 value:140
            ├── LEAF id:"absolute-row-self-A$12" value:145
            ├── LEAF id:"absolute-col-self-$A13" value:150
            └── LEAF id:"absolute-mixed-A$1+$B2" value:43
        `);

        api.applyTransaction({
            add: [{ id: 'prepended-row', x: -5, y: -2 }],
            addIndex: 0,
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after inserting a new first row', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:prepended-row
            ├── LEAF id:x-base
            ├── LEAF id:relative-A1 value:25
            ├── LEAF id:"absolute-row-A$1" value:-5
            ├── LEAF id:"absolute-col-$A1" value:25
            ├── LEAF id:"absolute-both-$A$1" value:-5
            ├── LEAF id:x-middle
            ├── LEAF id:relative-forward-A6 value:60
            ├── LEAF id:"absolute-row-forward-A$6"
            ├── LEAF id:"absolute-col-forward-$A6" value:60
            ├── LEAF id:"absolute-both-forward-$A$6"
            ├── LEAF id:relative-self-A11 value:140
            ├── LEAF id:"absolute-row-self-A$12" value:140
            ├── LEAF id:"absolute-col-self-$A13" value:150
            └── LEAF id:"absolute-mixed-A$1+$B2" value:13
        `);

        api.applyColumnState({
            state: [{ colId: 'y' }, { colId: 'x' }, { colId: 'value' }],
            applyOrder: true,
        });

        gridRows = new GridRows(api, 'after column reorder', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:prepended-row
            ├── LEAF id:x-base
            ├── LEAF id:relative-A1 value:25
            ├── LEAF id:"absolute-row-A$1" value:-5
            ├── LEAF id:"absolute-col-$A1" value:7
            ├── LEAF id:"absolute-both-$A$1" value:-2
            ├── LEAF id:x-middle
            ├── LEAF id:relative-forward-A6 value:60
            ├── LEAF id:"absolute-row-forward-A$6"
            ├── LEAF id:"absolute-col-forward-$A6" value:12
            ├── LEAF id:"absolute-both-forward-$A$6"
            ├── LEAF id:relative-self-A11 value:140
            ├── LEAF id:"absolute-row-self-A$12" value:140
            ├── LEAF id:"absolute-col-self-$A13" value:22
            └── LEAF id:"absolute-mixed-A$1+$B2" value:-5
        `);
    });
});
