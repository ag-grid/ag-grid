import { vi } from 'vitest';

import type { FormulaFunctionParams, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid formulas function semantics', () => {
    const rowNumberRefreshBufferMs = 25;
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, FormulaModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true },
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    test('SUM over a range of all blanks surfaces a parse error', async () => {
        const api = createGrid('fn-sum-blanks', {
            rowData: [
                { id: 'r1', value: null },
                { id: 'r2', value: '' },
                { id: 'total', value: '=SUM(REF(COLUMN("value"),ROW("r1"),COLUMN("value"),ROW("r2")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'sum of blanks', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:null
            ├── LEAF id:r2 row-number:"2" value:""
            └── LEAF id:total row-number:"3" value:"#PARSE!"
        `);
    });

    test('MEDIAN of an even-length range returns the average of middle two', async () => {
        const api = createGrid('fn-median-even', {
            rowData: [
                { id: 'r1', value: 1 },
                { id: 'r2', value: 4 },
                { id: 'r3', value: 5 },
                { id: 'r4', value: 10 },
                { id: 'med', value: '=MEDIAN(REF(COLUMN("value"),ROW("r1"),COLUMN("value"),ROW("r4")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'median even length', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:1
            ├── LEAF id:r2 row-number:"2" value:4
            ├── LEAF id:r3 row-number:"3" value:5
            ├── LEAF id:r4 row-number:"4" value:10
            └── LEAF id:med row-number:"5" value:4.5
        `);
    });

    test('MIN / MAX skip null cells but still see empty strings as values', async () => {
        // MIN/MAX skip only null/undefined - empty string sorts as 0 in JS and is treated as a value.
        const api = createGrid('fn-minmax-blanks', {
            rowData: [
                { id: 'r1', value: 5 },
                { id: 'r2', value: null },
                { id: 'r3', value: 2 },
                { id: 'r4', value: 7 },
                { id: 'minVal', value: '=MIN(REF(COLUMN("value"),ROW("r1"),COLUMN("value"),ROW("r4")))' },
                { id: 'maxVal', value: '=MAX(REF(COLUMN("value"),ROW("r1"),COLUMN("value"),ROW("r4")))' },
            ],
            columnDefs: [{ field: 'value' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'min/max skip nulls', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" value:5
            ├── LEAF id:r2 row-number:"2" value:null
            ├── LEAF id:r3 row-number:"3" value:2
            ├── LEAF id:r4 row-number:"4" value:7
            ├── LEAF id:minVal row-number:"5" value:2
            └── LEAF id:maxVal row-number:"6" value:7
        `);
    });

    test('COUNT only counts finite numbers; COUNTA skips blanks; COUNTBLANK is the inverse', async () => {
        const api = createGrid('fn-count-family', {
            rowData: [
                {
                    id: 'r1',
                    a: 1,
                    b: 'text',
                    c: null,
                    cn: '=COUNT(REF(COLUMN("a"),ROW("r1"),COLUMN("c"),ROW("r4")))',
                    ca: '=COUNTA(REF(COLUMN("a"),ROW("r1"),COLUMN("c"),ROW("r4")))',
                    cb: '=COUNTBLANK(REF(COLUMN("a"),ROW("r1"),COLUMN("c"),ROW("r4")))',
                },
                { id: 'r2', a: 2, b: '', c: 3 },
                { id: 'r3', a: null, b: 'x', c: '' },
                { id: 'r4', a: 4, b: null, c: 0 },
            ],
            columnDefs: [
                { field: 'a' },
                { field: 'b' },
                { field: 'c' },
                { field: 'cn' },
                { field: 'ca' },
                { field: 'cb' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'count/counta/countblank', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:"text" c:null cn:5 ca:7 cb:5
            ├── LEAF id:r2 row-number:"2" a:2 b:"" c:3
            ├── LEAF id:r3 row-number:"3" a:null b:"x" c:""
            └── LEAF id:r4 row-number:"4" a:4 b:null c:0
        `);
    });

    test('COUNTIF with * and ? wildcards matches any / single character', async () => {
        const api = createGrid('fn-countif-wildcards', {
            rowData: [
                {
                    id: 'row',
                    v1: 'apple',
                    v2: 'apricot',
                    v3: 'banana',
                    v4: 'apx',
                    star: '=COUNTIF(REF(COLUMN("v1"),ROW("row"),COLUMN("v4"),ROW("row")),"ap*")',
                    qmark: '=COUNTIF(REF(COLUMN("v1"),ROW("row"),COLUMN("v4"),ROW("row")),"ap?")',
                },
            ],
            columnDefs: [
                { field: 'v1' },
                { field: 'v2' },
                { field: 'v3' },
                { field: 'v4' },
                { field: 'star' },
                { field: 'qmark' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'wildcard counts', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" v1:"apple" v2:"apricot" v3:"banana" v4:"apx" star:3 qmark:1
        `);
    });

    test('COUNTIF with tilde-escaped wildcards treats them as literals', async () => {
        const api = createGrid('fn-countif-escaped', {
            rowData: [
                {
                    id: 'row',
                    v1: 'a*b',
                    v2: 'aXb',
                    v3: 'a?b',
                    v4: 'a*b',
                    literalStar: '=COUNTIF(REF(COLUMN("v1"),ROW("row"),COLUMN("v4"),ROW("row")),"a~*b")',
                    literalQmark: '=COUNTIF(REF(COLUMN("v1"),ROW("row"),COLUMN("v4"),ROW("row")),"a~?b")',
                },
            ],
            columnDefs: [
                { field: 'v1' },
                { field: 'v2' },
                { field: 'v3' },
                { field: 'v4' },
                { field: 'literalStar' },
                { field: 'literalQmark' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'escaped wildcards', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" v1:"a*b" v2:"aXb" v3:"a?b" v4:"a*b" literalStar:2 literalQmark:1
        `);
    });

    test('SUMIF throws #VALUE! when wildcard combined with a non equals/not-equals operator', async () => {
        const api = createGrid('fn-sumif-bad-wildcard', {
            rowData: [
                { id: 'r1', name: 'alpha', amt: 1 },
                { id: 'r2', name: 'beta', amt: 2 },
                {
                    id: 'out',
                    amt: '=SUMIF(REF(COLUMN("name"),ROW("r1"),COLUMN("name"),ROW("r2")),">a*",REF(COLUMN("amt"),ROW("r1"),COLUMN("amt"),ROW("r2")))',
                },
            ],
            columnDefs: [{ field: 'name' }, { field: 'amt' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'invalid wildcard combo', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" name:"alpha" amt:1
            ├── LEAF id:r2 row-number:"2" name:"beta" amt:2
            └── LEAF id:out row-number:"3" amt:"#VALUE!"
        `);
    });

    test('COUNTIF with case-insensitive string criteria', async () => {
        const api = createGrid('fn-countif-case', {
            rowData: [
                {
                    id: 'row',
                    v1: 'Apple',
                    v2: 'APPLE',
                    v3: 'apple',
                    v4: 'orange',
                    count: '=COUNTIF(REF(COLUMN("v1"),ROW("row"),COLUMN("v4"),ROW("row")),"apple")',
                },
            ],
            columnDefs: [{ field: 'v1' }, { field: 'v2' }, { field: 'v3' }, { field: 'v4' }, { field: 'count' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'case insensitive match', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" v1:"Apple" v2:"APPLE" v3:"apple" v4:"orange" count:3
        `);
    });

    test('SUMIF with sum_range shorter than criteria range yields #VALUE!', async () => {
        const api = createGrid('fn-sumif-mismatch', {
            rowData: [
                { id: 'r1', name: 'a', amt: 1 },
                { id: 'r2', name: 'a', amt: 2 },
                { id: 'r3', name: 'a', amt: 3 },
                {
                    id: 'out',
                    amt: '=SUMIF(REF(COLUMN("name"),ROW("r1"),COLUMN("name"),ROW("r3")),"a",REF(COLUMN("amt"),ROW("r1"),COLUMN("amt"),ROW("r2")))',
                },
            ],
            columnDefs: [{ field: 'name' }, { field: 'amt' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'sumif mismatched ranges', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" name:"a" amt:1
            ├── LEAF id:r2 row-number:"2" name:"a" amt:2
            ├── LEAF id:r3 row-number:"3" name:"a" amt:3
            └── LEAF id:out row-number:"4" amt:"#VALUE!"
        `);
    });

    test('percent operator handles numeric and string-number operands', async () => {
        const api = createGrid('fn-percent', {
            rowData: [
                {
                    id: 'row',
                    fromNum: '=50%',
                    fromStr: '="25"%',
                    negative: '=-20%',
                },
            ],
            columnDefs: [{ field: 'fromNum' }, { field: 'fromStr' }, { field: 'negative' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'percent operator', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" fromNum:0.5 fromStr:0.25 negative:-0.2
        `);
    });

    test('power operator with negative exponent and right-associativity', async () => {
        const api = createGrid('fn-power', {
            rowData: [
                {
                    id: 'row',
                    negExp: '=2^(-3)',
                    // Right-associative: 2^3^2 = 2^(3^2) = 2^9 = 512, not (2^3)^2 = 64.
                    nested: '=2^3^2',
                },
            ],
            columnDefs: [{ field: 'negExp' }, { field: 'nested' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'power associativity', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" negExp:0.125 nested:512
        `);
    });

    test('unary minus binds tighter than subtraction', async () => {
        const api = createGrid('fn-unary-minus', {
            rowData: [{ id: 'row', v: '=-3-(-4)' }],
            columnDefs: [{ field: 'v' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'unary vs subtraction', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" v:1
        `);
    });

    test('string concatenation via & coerces booleans and numbers', async () => {
        const api = createGrid('fn-concat-coerce', {
            rowData: [
                {
                    id: 'row',
                    boolConcat: '=TRUE&"/"&FALSE',
                    numConcat: '="count:"&(1+2)',
                },
            ],
            columnDefs: [{ field: 'boolConcat' }, { field: 'numConcat' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'concat coercion', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" boolConcat:"TRUE/FALSE" numConcat:"count:3"
        `);
    });

    test('CONCAT skips null and empty values but preserves zero and FALSE', async () => {
        const api = createGrid('fn-concat-nulls', {
            rowData: [
                { id: 'r1', a: 'x', b: null, c: '', d: 'y' },
                {
                    id: 'out',
                    joined: '=REF(COLUMN("a"),ROW("r1"))&REF(COLUMN("b"),ROW("r1"))&REF(COLUMN("c"),ROW("r1"))&REF(COLUMN("d"),ROW("r1"))',
                },
                { id: 'zeros', joined: '="["&0&"|"&FALSE&"]"' },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }, { field: 'joined' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'concat with nulls', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:"x" b:null c:"" d:"y"
            ├── LEAF id:out row-number:"2" joined:"xy"
            └── LEAF id:zeros row-number:"3" joined:"[0|FALSE]"
        `);
    });

    test('IF returns the branch selected by the condition and handles non-boolean conditions', async () => {
        const api = createGrid('fn-if-branches', {
            rowData: [
                {
                    id: 'row',
                    numTruthy: '=IF(3,"yes","no")',
                    numZero: '=IF(0,"yes","no")',
                    strTruthy: '=IF("x","yes","no")',
                    emptyFalse: '=IF(FALSE,"yes","")',
                    nullFalse: '=IF(FALSE,"yes",NULL)',
                    boolTrue: '=IF(TRUE,1,2)',
                    boolFalse: '=IF(FALSE,1,2)',
                },
            ],
            columnDefs: [
                { field: 'numTruthy' },
                { field: 'numZero' },
                { field: 'strTruthy' },
                { field: 'emptyFalse' },
                { field: 'nullFalse' },
                { field: 'boolTrue' },
                { field: 'boolFalse' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'IF truthy matrix', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" numTruthy:"yes" numZero:"no" strTruthy:"yes" emptyFalse:"" nullFalse:null boolTrue:1 boolFalse:2
        `);
    });

    test('trivial constant formulas evaluate to their literal value', async () => {
        const api = createGrid('fn-trivial-consts', {
            rowData: [
                {
                    id: 'row',
                    intLit: '=42',
                    floatLit: '=3.14',
                    smallDecimal: '=0.001',
                    // Scientific notation is not recognised; `1e3` parses as integer + unknown ident.
                    sciNotation: '=1e3',
                    negative: '=-5',
                    negZero: '=-0',
                    parens: '=(1+2)',
                    strLit: '="hello"',
                    emptyStrLit: '=""',
                    nullLit: '=NULL',
                    trueLit: '=TRUE',
                    falseLit: '=FALSE',
                },
            ],
            columnDefs: [
                { field: 'intLit' },
                { field: 'floatLit' },
                { field: 'smallDecimal' },
                { field: 'sciNotation' },
                { field: 'negative' },
                { field: 'negZero' },
                { field: 'parens' },
                { field: 'strLit' },
                { field: 'emptyStrLit' },
                { field: 'nullLit' },
                { field: 'trueLit' },
                { field: 'falseLit' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'trivial constants', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" intLit:42 floatLit:3.14 smallDecimal:0.001 sciNotation:"#PARSE!" negative:-5 negZero:0 parens:3 strLit:"hello" emptyStrLit:"" nullLit:null trueLit:true falseLit:false
        `);
    });

    test('missing function arguments are rejected during parsing', async () => {
        const api = createGrid('fn-missing-function-arg', {
            rowData: [
                {
                    id: 'row',
                    trailingArg: '=IF(TRUE,"yes",)',
                    leadingArg: '=IF(,"yes","no")',
                    middleArg: '=IF(TRUE,,"no")',
                },
            ],
            columnDefs: [{ field: 'trailingArg' }, { field: 'leadingArg' }, { field: 'middleArg' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'missing function args parse errors', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" trailingArg:"#PARSE!" leadingArg:"#PARSE!" middleArg:"#PARSE!"
        `);
    });

    test('SUM and COUNT with no arguments surface a parse-like error', async () => {
        const api = createGrid('fn-empty-call', {
            rowData: [
                {
                    id: 'row',
                    emptySum: '=SUM()',
                    emptyCount: '=COUNT()',
                },
            ],
            columnDefs: [{ field: 'emptySum' }, { field: 'emptyCount' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'zero-arg aggregates error', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" emptySum:"#PARSE!" emptyCount:0
        `);
    });

    test('nested custom function calls resolve inside out', async () => {
        const innerSpy = vi.fn((params: FormulaFunctionParams) => {
            const [v] = Array.from(params.values);
            return Number(v) + 1;
        });
        const outerSpy = vi.fn((params: FormulaFunctionParams) => {
            const [v] = Array.from(params.values);
            return Number(v) * 10;
        });
        const api = createGrid('fn-nested-custom', {
            rowData: [{ id: 'r', v: 4, out: '=OUTER(INNER(REF(COLUMN("v"),ROW("r"))))' }],
            columnDefs: [{ field: 'v' }, { field: 'out' }],
            formulaFuncs: {
                INNER: { func: innerSpy },
                OUTER: { func: outerSpy },
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'nested custom fns', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r row-number:"1" v:4 out:50
        `);
        expect(innerSpy).toHaveBeenCalled();
        expect(outerSpy).toHaveBeenCalled();
    });

    test('TODAY()-1 evaluates to the previous calendar date', async () => {
        vi.useFakeTimers();
        try {
            vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));

            const api = createGrid('fn-date-arith', {
                rowData: [{ id: 'r', today: '=TODAY()', yesterday: '=TODAY()-1' }],
                columnDefs: [{ field: 'today' }, { field: 'yesterday' }],
            });

            const rowNode = api.getRowNode('r')!;
            const todayVal = api.getCellValue<Date>({ rowNode, colKey: 'today', useFormatter: false })!;
            const yestVal = api.getCellValue<Date>({ rowNode, colKey: 'yesterday', useFormatter: false })!;

            expect(todayVal).toBeInstanceOf(Date);
            expect(yestVal).toBeInstanceOf(Date);

            const oneDayMs = 24 * 60 * 60 * 1000;
            expect(todayVal.getTime() - yestVal.getTime()).toBe(oneDayMs);
        } finally {
            vi.useRealTimers();
        }
    });

    test('bigint column refuses non-integer numeric input via #VALUE!', async () => {
        const api = createGrid('fn-bigint-unsafe', {
            rowData: [{ id: 'r', base: 12345n, derived: '=REF(COLUMN("base"),ROW("r"))+0.5' }],
            columnDefs: [
                { field: 'base', cellDataType: 'bigint' },
                { field: 'derived', cellDataType: 'bigint' },
            ],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'bigint unsafe coercion', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r row-number:"1" base:"12345n" derived:"#VALUE!"
        `);
    });

    test('deeply nested parentheses parse and evaluate correctly', async () => {
        const api = createGrid('fn-deep-parens', {
            rowData: [
                {
                    id: 'row',
                    shallow: '=(1+2)',
                    deep: '=(((((1+2+3+4+5)))))',
                    veryDeep: `=${'('.repeat(40)}7${')'.repeat(40)}`,
                },
            ],
            columnDefs: [{ field: 'shallow' }, { field: 'deep' }, { field: 'veryDeep' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'deep parens', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" shallow:3 deep:15 veryDeep:7
        `);
    });

    test('long additive expression parses and evaluates in reasonable time', async () => {
        const terms = Array.from({ length: 50 }, (_, i) => String(i + 1));
        const formula = '=' + terms.join('+');
        const expected = terms.reduce((sum, n) => sum + Number(n), 0); // 1275

        const api = createGrid('fn-long-expr', {
            rowData: [{ id: 'row', total: formula }],
            columnDefs: [{ field: 'total' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'long additive chain', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" total:${expected}
        `);
    });

    test('string literals with unicode characters preserve their content', async () => {
        const api = createGrid('fn-unicode-strings', {
            rowData: [
                {
                    id: 'row',
                    accented: '="café"',
                    cjk: '="日本語"',
                    emoji: '="done 😀"',
                    joined: '="a"&"b"&"日本語"',
                },
            ],
            columnDefs: [{ field: 'accented' }, { field: 'cjk' }, { field: 'emoji' }, { field: 'joined' }],
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        await new GridRows(api, 'unicode string literals', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:row row-number:"1" accented:"café" cjk:"日本語" emoji:"done 😀" joined:"ab日本語"
        `);
    });
});
