import { waitFor } from '@testing-library/dom';
import { vi } from 'vitest';

import type { FormulaFunctionParams, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';

import { createGrid, setupCalculatedColumnsSuite } from './calculatedColumnsHarness';

describe('calculated columns cache', () => {
    setupCalculatedColumnsSuite();

    function setupGrid() {
        const trace = vi.fn<(id: string) => void>();
        // observe source reads without introducing an opaque formula function or value getter
        const trackCost = (data: { id: string; revenue: number; cost: number; qty: number }) => ({
            ...data,
            get trackedCost(): number {
                trace(this.id);
                return this.cost;
            },
        });
        const rowData = [
            { id: 'a', revenue: 100, cost: 40, qty: 2 },
            { id: 'b', revenue: 200, cost: 100, qty: 4 },
            { id: 'c', revenue: 80, cost: 60, qty: 2 },
        ].map(trackCost);
        const api = createGrid('calculated-cache', {
            rowData,
            formulaFuncs: { UNUSED: { func: () => 0 } },
            columnDefs: [
                { field: 'revenue', filter: 'agNumberColumnFilter' },
                { field: 'cost' },
                { field: 'trackedCost', hide: true, cellDataType: 'number' },
                { colId: 'unusedGetter', valueGetter: ({ data }) => data.revenue, hide: true },
                { field: 'qty' },
                { colId: 'profit', calculatedExpression: '[revenue] - [trackedCost]' },
                { colId: 'margin', calculatedExpression: 'IF([revenue] > 0, [profit] / [revenue], 0)' },
                { colId: 'unit', calculatedExpression: '[revenue] / [qty]' },
                { colId: 'c1', calculatedExpression: '[margin] * 100' },
                { colId: 'c2', calculatedExpression: '[c1] + [unit]' },
            ],
        });
        api.applyColumnState({ state: [{ colId: 'c2', sort: 'asc' }] });
        expect(displayedValues(api)).toEqual([65, 100, 110]);
        trace.mockClear();
        return { api, trace, rowData, trackCost };
    }

    function displayedValues(api: GridApi) {
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((rowNode) => {
            values.push(api.getCellValue({ rowNode, colKey: 'c2' }));
        });
        return values;
    }

    test('repeated sorting and filtering reuse calculated values', () => {
        const { api, trace } = setupGrid();
        for (const sort of ['desc', 'asc', 'desc'] as const) {
            api.applyColumnState({ state: [{ colId: 'c2', sort }] });
            expect(displayedValues(api)).toEqual(sort === 'asc' ? [65, 100, 110] : [110, 100, 65]);
        }
        api.applyColumnState({ state: [{ colId: 'revenue', sort: 'asc' }], defaultState: { sort: null } });
        expect(displayedValues(api)).toEqual([65, 110, 100]);
        api.applyColumnState({ state: [{ colId: 'c2', sort: 'desc' }], defaultState: { sort: null } });
        api.setFilterModel({ revenue: { filterType: 'number', type: 'greaterThan', filter: 90 } });
        expect(displayedValues(api)).toEqual([110, 100]);
        api.setFilterModel(null);
        expect(displayedValues(api)).toEqual([110, 100, 65]);
        expect(trace).not.toHaveBeenCalled();
    });

    test.each(['transaction', 'immutable', 'setData', 'updateData', 'setDataValue'] as const)(
        '%s recomputes only the changed row and its calculated dependencies',
        (method) => {
            const { api, trace, rowData, trackCost } = setupGrid();
            const update = trackCost({ ...rowData[0], cost: 95 });
            trace.mockClear();
            const node = api.getRowNode('a')!;
            switch (method) {
                case 'transaction':
                    api.applyTransaction({ update: [update] });
                    break;
                case 'immutable':
                    api.setGridOption('rowData', [update, ...rowData.slice(1)]);
                    break;
                case 'setDataValue':
                    node.setDataValue('cost', update.cost);
                    break;
                default:
                    node[method](update);
            }
            if (method === 'transaction' || method === 'immutable') {
                expect(displayedValues(api)).toEqual([55, 65, 100]);
            }
            api.refreshClientSideRowModel('sort');
            expect(displayedValues(api)).toEqual([55, 65, 100]);
            expect(trace).toHaveBeenCalled();
            expect(trace.mock.calls.every(([id]) => id === 'a')).toBe(true);
        }
    );

    test('explicit formula refresh still invalidates every calculated value', () => {
        const { api, trace, rowData } = setupGrid();
        rowData[0].cost = 95;
        expect(api.refreshFormulas()).toBe(true);
        api.refreshClientSideRowModel('sort');
        expect(displayedValues(api)).toEqual([55, 65, 100]);
        expect(new Set(trace.mock.calls.map(([id]) => id))).toEqual(new Set(['a', 'b', 'c']));
    });

    test('removing and replacing a row preserves other rows and computes the replacement', () => {
        const { api, trace, rowData, trackCost } = setupGrid();
        api.applyTransaction({ remove: [rowData[0]] });
        expect(displayedValues(api)).toEqual([65, 100]);
        expect(trace).not.toHaveBeenCalled();

        const replacement = trackCost({ ...rowData[0], cost: 95 });
        trace.mockClear();
        api.applyTransaction({ add: [replacement] });
        expect(displayedValues(api)).toEqual([55, 65, 100]);
        expect(trace).toHaveBeenCalled();
        expect(trace.mock.calls.every(([id]) => id === 'a')).toBe(true);
    });

    test('calculated columns depending on editable formulas still refresh across rows', () => {
        const api = createGrid('calculated-cache-mixed', {
            rowNumbers: false,
            rowData: [
                { id: 'source', value: 10 },
                { id: 'dependent', value: '=REF(COLUMN("value"),ROW("source"))*2' },
            ],
            columnDefs: [
                { field: 'value', allowFormula: true },
                { colId: 'c2', calculatedExpression: '[value] + 1' },
            ],
        });
        expect(displayedValues(api)).toEqual([11, 21]);
        api.applyTransaction({ update: [{ id: 'source', value: 30 }] });
        expect(displayedValues(api)).toEqual([31, 61]);
        api.getRowNode('source')!.setDataValue('value', 50);
        expect(displayedValues(api)).toEqual([51, 101]);
    });

    test.each(['transaction', 'setDataValue'] as const)('tree parents recalculate after %s', async (method) => {
        const api = createGrid('calculated-cache-tree', {
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'parent', path: ['Parent'] },
                { id: 'child', path: ['Parent', 'Child'], revenue: 10 },
            ],
            columnDefs: [
                { field: 'revenue', aggFunc: 'sum' },
                { colId: 'c2', calculatedExpression: '[revenue] * 2' },
            ],
        });
        expect(displayedValues(api)).toEqual([20, 20]);
        if (method === 'transaction') {
            api.applyTransaction({ update: [{ id: 'child', path: ['Parent', 'Child'], revenue: 30 }] });
        } else {
            api.getRowNode('child')!.setDataValue('revenue', 30);
        }
        expect(api.getCellValue({ rowNode: api.getRowNode('parent')!, colKey: 'revenue' })).toBe(30);
        expect(displayedValues(api)).toEqual([60, 60]);
        await waitFor(() => {
            const cell = getGridElement(api)!.querySelector('[row-id="parent"] [col-id="c2"]');
            expect(cell?.textContent).toBe('60');
        });
    });

    describe.each(['valueGetter', 'custom function', 'built-in override'] as const)('%s dependencies', (dependency) => {
        test.each(['transaction', 'setDataValue'] as const)(
            'recalculate aggregate-backed values in unchanged rows after %s',
            async (method) => {
                const share = (row: FormulaFunctionParams['row']) => row.data.revenue / row.parent!.aggData!.revenue;
                const api = createGrid('calculated-cache-aggregate-dependency', {
                    alwaysAggregateAtRootLevel: true,
                    rowData: [
                        { id: 'source', revenue: 100 },
                        { id: 'dependent', revenue: 100 },
                    ],
                    formulaFuncs: {
                        SHARE: { func: ({ row }) => share(row) },
                        SUM: { func: ({ row }) => share(row) },
                    },
                    columnDefs: [
                        { field: 'revenue', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                        { colId: 'share', valueGetter: ({ node }) => share(node!), hide: true },
                        {
                            colId: 'calc',
                            calculatedExpression:
                                dependency === 'valueGetter'
                                    ? '[share] * 100'
                                    : `${dependency === 'custom function' ? 'sHaRe' : 'sum'}() * 100`,
                        },
                        { colId: 'chained', calculatedExpression: '[calc] + 1' },
                    ],
                });
                const read = () => api.getCellValue({ rowNode: api.getRowNode('dependent')!, colKey: 'chained' });
                expect(read()).toBe(51);
                if (method === 'transaction') {
                    api.applyTransaction({ update: [{ id: 'source', revenue: 300 }] });
                } else {
                    api.getRowNode('source')!.setDataValue('revenue', 300);
                }
                expect(read()).toBe(26);
                await waitFor(() => {
                    const cell = getGridElement(api)!.querySelector('[row-id="dependent"] [col-id="chained"]');
                    expect(cell?.textContent).toBe('26');
                });

                api.setFilterModel({ revenue: { filterType: 'number', type: 'lessThan', filter: 200 } });
                expect(read()).toBe(101);
                api.setFilterModel(null);
                expect(read()).toBe(26);
            }
        );

        test('recalculates indirect references to another row without aggregation', () => {
            const source = { id: 'source', revenue: 10 };
            const sourceRevenue = (row: FormulaFunctionParams['row']) =>
                row.parent!.childrenAfterGroup!.find((node) => node.id === 'source')?.data.revenue ?? 0;
            const api = createGrid('calculated-cache-opaque-dependency', {
                rowData: [source, { id: 'dependent', revenue: 5 }],
                formulaFuncs: {
                    SOURCE: { func: ({ row }) => sourceRevenue(row) },
                    SUM: { func: ({ row }) => sourceRevenue(row) },
                },
                columnDefs: [
                    { field: 'revenue' },
                    { colId: 'sourceRevenue', valueGetter: ({ node }) => sourceRevenue(node!) },
                    {
                        colId: 'calc',
                        calculatedExpression:
                            dependency === 'valueGetter'
                                ? '[sourceRevenue] * 2'
                                : `${dependency === 'custom function' ? 'SOURCE' : 'SUM'}() * 2`,
                    },
                ],
            });
            const read = () => api.getCellValue({ rowNode: api.getRowNode('dependent')!, colKey: 'calc' });
            expect(read()).toBe(20);
            api.applyTransaction({ update: [{ ...source, revenue: 30 }] });
            expect(read()).toBe(60);
            api.getRowNode('source')!.setDataValue('revenue', 50);
            expect(read()).toBe(100);
            api.getRowNode('source')!.setData({ ...source, revenue: 40 });
            expect(read()).toBe(80);
            api.applyTransaction({ remove: [source] });
            expect(read()).toBe(0);
        });
    });

    test('changing a referenced field into a value getter updates invalidation', () => {
        const api = createGrid('calculated-cache-source-change', {
            rowData: [
                { id: 'source', revenue: 10 },
                { id: 'dependent', revenue: 5 },
            ],
            columnDefs: [{ field: 'revenue' }, { colId: 'calc', calculatedExpression: '[revenue] * 2' }],
        });
        const read = () => api.getCellValue({ rowNode: api.getRowNode('dependent')!, colKey: 'calc' });
        expect(read()).toBe(10);
        api.setGridOption('columnDefs', [
            { field: 'revenue', valueGetter: ({ api }) => api.getRowNode('source')?.data.revenue },
            { colId: 'calc', calculatedExpression: '[revenue] * 2' },
        ]);
        expect(read()).toBe(20);
        api.applyTransaction({ update: [{ id: 'source', revenue: 30 }] });
        expect(read()).toBe(60);
    });

    describe('legacy cross-row expression compatibility', () => {
        test.each([
            { expression: 'A1 * 2', initial: 20, updated: 60 },
            { expression: 'SUM(A1:A2) * 2', initial: 30, updated: 70 },
            { expression: 'REF(COLUMN("revenue"), ROW("source")) * 2', initial: 20, updated: 60 },
        ])('$expression retains cross-row invalidation', ({ expression, initial, updated }) => {
            const source = { id: 'source', revenue: 10 };
            const api = createGrid('calculated-cache-legacy', {
                rowData: [source, { id: 'other', revenue: 5 }, { id: 'dependent', revenue: 1 }],
                columnDefs: [
                    { field: 'revenue' },
                    { colId: 'calc', calculatedExpression: expression },
                    { colId: 'chained', calculatedExpression: '[calc] + 1' },
                ],
            });
            const read = () => api.getCellValue({ rowNode: api.getRowNode('dependent')!, colKey: 'chained' });
            expect(read()).toBe(initial + 1);

            api.applyTransaction({ update: [{ ...source, revenue: 30 }] });
            expect(read()).toBe(updated + 1);
            api.getRowNode('source')!.setDataValue('revenue', 10);
            expect(read()).toBe(initial + 1);
            api.getRowNode('source')!.setData({ ...source, revenue: 30 });
            expect(read()).toBe(updated + 1);

            api.applyTransaction({ remove: [source] });
            expect(read()).toBe('#REF!');
            api.applyTransaction({ add: [source], addIndex: 0 });
            expect(read()).toBe(initial + 1);
        });

        test('absolute row references follow sorting and filtering', () => {
            const api = createGrid('calculated-cache-absolute', {
                rowData: [
                    { id: 'a', revenue: 10 },
                    { id: 'b', revenue: 20 },
                    { id: 'c', revenue: 30 },
                ],
                columnDefs: [
                    { field: 'revenue', filter: 'agNumberColumnFilter' },
                    { colId: 'calc', calculatedExpression: '$A$1 * 2' },
                ],
            });
            const read = () => api.getCellValue({ rowNode: api.getRowNode('c')!, colKey: 'calc' });
            expect(read()).toBe(20);
            api.applyColumnState({ state: [{ colId: 'revenue', sort: 'desc' }] });
            expect(read()).toBe(60);
            api.setFilterModel({ revenue: { filterType: 'number', type: 'lessThan', filter: 25 } });
            expect(read()).toBe(40);
            api.setFilterModel(null);
            expect(read()).toBe(60);
        });

        test('changing an expression updates its invalidation strategy', () => {
            const trace = vi.fn(() => 5);
            const columnDefs = (expression: string) => [
                { field: 'revenue', hide: true, cellDataType: 'number' },
                { colId: 'calc', calculatedExpression: expression },
            ];
            const api = createGrid('calculated-cache-expression-change', {
                rowData: [
                    { id: 'source', revenue: 10 },
                    {
                        id: 'dependent',
                        get revenue() {
                            return trace();
                        },
                    },
                ],
                columnDefs: columnDefs('[revenue]'),
            });
            const read = () => api.getCellValue({ rowNode: api.getRowNode('dependent')!, colKey: 'calc' });
            expect(read()).toBe(5);
            api.setGridOption('columnDefs', columnDefs('REF(COLUMN("revenue"), ROW("source"))'));
            expect(read()).toBe(10);
            api.getRowNode('source')!.setDataValue('revenue', 30);
            expect(read()).toBe(30);

            api.setGridOption('columnDefs', columnDefs('[revenue]'));
            expect(read()).toBe(5);
            trace.mockClear();
            api.applyColumnState({ state: [{ colId: 'calc', sort: 'desc' }] });
            expect(read()).toBe(5);
            expect(trace).not.toHaveBeenCalled();
        });
    });
});
