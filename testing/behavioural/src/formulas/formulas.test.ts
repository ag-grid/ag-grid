import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule, RangeSelectionModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

const rowNumberRefreshBufferMs = 25;

describe('formulas general behaviour', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            RangeSelectionModule,
            FormulaModule,
            TextEditorModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const defaultGridRowsOptions: GridRowsOptions = {
        printHiddenRows: true,
        checkDom: true,
        columns: true,
    };

    test('constants and cell references evaluate correctly', async () => {
        const rowData = [
            {
                id: '1',
                A: 10,
                B: '=3.14',
                C: '="Hello"',
                D: '=TRUE',
                E: '=A1',
                F: '=A$1',
                G: '=$A1',
                H: '=$A$1',
                I: '=A2',
            },
            {
                id: '2',
                A: 20,
                B: '=A1',
                C: '="World"',
                D: '=FALSE',
                E: '=A2',
                F: '=A$1',
                G: '=$A2',
                H: '=$A$1',
                I: '=A1',
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
                { field: 'D' },
                { field: 'E' },
                { field: 'F' },
                { field: 'G' },
                { field: 'H' },
                { field: 'I' },
            ],
        };

        const api = gridsManager.createGrid('formulas-constants', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        let gridRows = new GridRows(api, 'initial constants', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:3.14 C:"Hello" D:true E:10 F:10 G:10 H:10 I:20
            └── LEAF id:2 row-number:"2" A:20 B:10 C:"World" D:false E:20 F:10 G:20 H:10 I:10
        `);

        const updatedRow2 = { ...rowData[1], A: 50 };
        api.applyTransaction({ update: [updatedRow2] });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after update', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:3.14 C:"Hello" D:true E:10 F:10 G:10 H:10 I:50
            └── LEAF id:2 row-number:"2" A:50 B:10 C:"World" D:false E:50 F:10 G:50 H:10 I:10
        `);
    });

    test('arithmetic and comparison operators produce expected results', async () => {
        const rowData = [
            {
                id: 'ops',
                A: 5,
                B: 2,
                C: 'Hi',
                add: '=A1 + B1',
                subtract: '=A1 - B1',
                multiply: '=A1 * B1',
                divide: '=A1 / B1',
                exponent: '=A1 ^ B1',
                concat: '=C1 & " there"',
                equal: '=A1 = B1',
                notEqual: '=A1 <> B1',
                greaterThan: '=A1 > B1',
                lessThan: '=A1 < B1',
                greaterThanOrEqual: '=A1 >= B1',
                lessThanOrEqual: '=A1 <= B1',
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'operators', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ops row-number:"1" A:5 B:2 C:"Hi" add:7 subtract:3 multiply:10 divide:2.5 exponent:25 concat:"Hi there" equal:false notEqual:true greaterThan:true lessThan:false greaterThanOrEqual:true lessThanOrEqual:false
        `);
    });

    test('numeric functions', async () => {
        const rowData = [
            {
                id: 'inputs',
                low: 2,
                highOne: 7,
                highTwo: 9,
                lowLabel: 'Low',
                highLabelOne: 'High',
                highLabelTwo: 'High',
                sum: '=SUM(A1, B1, C1)',
                sumIfHigh: '=IF(D1="High",A1,0) + IF(E1="High",B1,0) + IF(F1="High",C1,0)',
                minus: '=MINUS(C1, A1)',
                multiply: '=MULTIPLY(A1, B1, 2)',
                divide: '=DIVIDE(C1, A1)',
                min: '=MIN(A1, B1, C1)',
                max: '=MAX(A1, B1, C1)',
                average: '=AVERAGE(A1, B1, C1)',
                median: '=MEDIAN(A1, B1, C1)',
                percent: '=PERCENT(B1)',
                power: '=POWER(B1, 2)',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'low' },
                { field: 'highOne' },
                { field: 'highTwo' },
                { field: 'lowLabel' },
                { field: 'highLabelOne' },
                { field: 'highLabelTwo' },
                { field: 'sum' },
                { field: 'sumIfHigh' },
                { field: 'minus' },
                { field: 'multiply' },
                { field: 'divide' },
                { field: 'min' },
                { field: 'max' },
                { field: 'average' },
                { field: 'median' },
                { field: 'percent' },
                { field: 'power' },
            ],
        };

        const api = gridsManager.createGrid('formulas-numeric', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'numeric functions', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:inputs row-number:"1" low:2 highOne:7 highTwo:9 lowLabel:"Low" highLabelOne:"High" highLabelTwo:"High" sum:18 sumIfHigh:16 minus:7 multiply:28 divide:4.5 min:2 max:9 average:6 median:7 percent:0.07 power:49
        `);
    });

    test('nested expressions respect evaluation order', async () => {
        const rowData = [
            {
                id: 'nested',
                A: 4,
                B: '=A1 * 5 + POWER(2, 3)',
                C: '=CUSTOMADD(A1, 6)',
                D: '=CUSTOMADD((A1 + 2) * 3, SUM(2, C1), MAX(A1, B1), IF(A1 > 2, 1, 10))',
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

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
                countNumbers: '=COUNT(A1:A4)',
                countAll: '=COUNTA(A1:C4)',
                countBlank: '=COUNTBLANK(A1:C4)',
                countIfAlpha: '=COUNTIF(B1:B4, "Alpha")',
                countIfGreaterThanTwo: '=COUNTIF(A1:A4, ">2")',
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
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:"Alpha" C:"first" countNumbers:3 countAll:7 countBlank:5 countIfAlpha:2 countIfGreaterThanTwo:1
            ├── LEAF id:2 row-number:"2" A:2 B:"Bravo" C:null countNumbers:undefined countAll:undefined countBlank:undefined countIfAlpha:undefined countIfGreaterThanTwo:undefined
            ├── LEAF id:3 row-number:"3" A:null B:null C:null countNumbers:undefined countAll:undefined countBlank:undefined countIfAlpha:undefined countIfGreaterThanTwo:undefined
            └── LEAF id:4 row-number:"4" A:5 B:"Alpha" C:"" countNumbers:undefined countAll:undefined countBlank:undefined countIfAlpha:undefined countIfGreaterThanTwo:undefined
        `);
    });

    test('logical helper functions return booleans and branches', async () => {
        const rowData = [
            {
                id: 'logic',
                A: 5,
                B: 3,
                branch: '=IF(A1 > B1, "High", "Low")',
                equals: '=EQ(A1, B1)',
                notEquals: '=NE(A1, B1)',
                greater: '=GT(A1, B1)',
                greaterOrEqual: '=GTE(A1, 5)',
                less: '=LT(A1, B1)',
                lessOrEqual: '=LTE(A1, 5)',
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'logical functions', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:logic row-number:"1" A:5 B:3 branch:"High" equals:false notEquals:true greater:true greaterOrEqual:true less:false lessOrEqual:true
        `);
    });

    test('date functions produce date objects', async () => {
        const rowData = [
            {
                id: 'dates',
                today: '=TODAY()',
                now: '=NOW()',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'today' }, { field: 'now' }],
        };

        const api = gridsManager.createGrid('formulas-date', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'date functions', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check();

        const rowNode = gridRows.displayedRows[0];
        const todayValue = api.getCellValue<Date>({ rowNode, colKey: 'today' });
        const nowValue = api.getCellValue<Date>({ rowNode, colKey: 'now' });

        expect(todayValue).toBeInstanceOf(Date);
        expect(nowValue).toBeInstanceOf(Date);
        const todayDate = todayValue as Date;
        expect(todayDate.getHours()).toBe(0);
        expect(todayDate.getMinutes()).toBe(0);
        expect(todayDate.getSeconds()).toBe(0);
    });

    test('custom iterator formula aggregates values', async () => {
        const rowData = [
            {
                id: 'custom',
                A: 1,
                B: 2,
                result: '=CUSTOMSUM(A1:B1, 3)',
            },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

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
            {
                id: 'error',
                A: 1,
                result: '=ERRORIFONE(A1)',
            },
            {
                id: 'ok',
                A: 2,
                result: '=ERRORIFONE(A2)',
            },
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'custom error', {
            ...defaultGridRowsOptions,
        });
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
                matchCount: '=COUNTEQ(A1:C1, 1)',
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

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRows = new GridRows(api, 'complex custom function', {
            ...defaultGridRowsOptions,
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:range row-number:"1" A:1 B:1 C:2 matchCount:2
        `);
    });
});
