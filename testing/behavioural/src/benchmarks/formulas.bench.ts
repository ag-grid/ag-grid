import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RowApiModule,
} from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const FORMULA_MODULES = [
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    RowApiModule,
    CellApiModule,
    ColumnApiModule,
    FormulaModule,
];

function resolveColumnForAllRows(api: GridApi, colKey: string): void {
    api.forEachNode((node) => {
        api.getCellValue({ rowNode: node, colKey, useFormatter: false });
    });
}

suite('formulas - flat grid evaluation', () => {
    const gridsManager = new BenchGridsManager({ modules: FORMULA_MODULES });
    const rowCount = 3000;

    const rowData = Array.from({ length: rowCount }, (_, i) => ({
        id: `r${i}`,
        a: i + 1,
        b: (i % 50) + 1,
        sum: `=REF(COLUMN("a"),ROW("r${i}"))+REF(COLUMN("b"),ROW("r${i}"))`,
        product: `=REF(COLUMN("a"),ROW("r${i}"))*REF(COLUMN("b"),ROW("r${i}"))`,
        branch: `=IF(REF(COLUMN("a"),ROW("r${i}"))>REF(COLUMN("b"),ROW("r${i}")),REF(COLUMN("sum"),ROW("r${i}")),REF(COLUMN("product"),ROW("r${i}")))`,
    }));

    function createFlatGrid(): GridApi {
        return gridsManager.createGrid('G', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'sum' }, { field: 'product' }, { field: 'branch' }],
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: ({ data }) => data.id,
        });
    }

    function evaluateAll(api: GridApi): void {
        resolveColumnForAllRows(api, 'sum');
        resolveColumnForAllRows(api, 'product');
        resolveColumnForAllRows(api, 'branch');
    }

    let api!: GridApi;
    let toggle = 0;
    const benchOptions: BenchOptions = {
        ...benchDefaults(),
        setup: () => {
            if (!api) {
                api = createFlatGrid();
                evaluateAll(api);
                toggle = 0;
            }
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    };

    bench(
        `cold: invalidate then evaluate sum/product/branch for ${rowCount} rows`,
        () => {
            toggle = toggle === 0 ? 1 : 0;
            api.applyTransaction({ update: [{ id: 'r0', a: 1 + toggle, b: 1 }] });
            evaluateAll(api);
        },
        benchOptions
    );

    bench(
        `warm: re-read sum/product/branch for ${rowCount} rows (no invalidation)`,
        () => {
            evaluateAll(api);
        },
        benchOptions
    );
});

suite('formulas - dependent re-evaluation on update', () => {
    const gridsManager = new BenchGridsManager({ modules: FORMULA_MODULES });
    const dependentCount = 1500;
    const chainLength = 200;

    const rowData: Record<string, unknown>[] = [{ id: 'source', value: 10 }];

    for (let i = 0; i < chainLength; i++) {
        const prev = i === 0 ? 'source' : `link-${i - 1}`;
        rowData.push({ id: `link-${i}`, value: `=REF(COLUMN("value"),ROW("${prev}"))+1` });
    }
    const tip = `link-${chainLength - 1}`;
    for (let i = 0; i < dependentCount; i++) {
        rowData.push({ id: `dep-${i}`, value: `=REF(COLUMN("value"),ROW("${tip}"))*${(i % 7) + 1}` });
    }

    let api!: GridApi;
    let sourceValue = 10;
    const benchOptions: BenchOptions = {
        ...benchDefaults(),
        setup: () => {
            if (!api) {
                api = gridsManager.createGrid('G', {
                    columnDefs: [{ field: 'value' }],
                    defaultColDef: { allowFormula: true },
                    rowData,
                    getRowId: ({ data }) => data.id as string,
                });
                resolveColumnForAllRows(api, 'value');
                sourceValue = 10;
            }
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    };

    bench(
        `update source -> re-eval ${chainLength} chained + ${dependentCount} fan-out dependents`,
        () => {
            sourceValue = sourceValue === 10 ? 20 : 10;
            api.applyTransaction({ update: [{ id: 'source', value: sourceValue }] });
            resolveColumnForAllRows(api, 'value');
        },
        benchOptions
    );
});

suite('formulas - large range aggregate', () => {
    const gridsManager = new BenchGridsManager({ modules: FORMULA_MODULES });
    const rowCount = 5000;
    const colCount = 20;

    const columnDefs = Array.from({ length: colCount }, (_, c) => ({ field: `c${c}` }));
    columnDefs.push({ field: 'total' });

    const rowData: Record<string, unknown>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, unknown> = { id: `r${r}` };
        for (let c = 0; c < colCount; c++) {
            row[`c${c}`] = r + c;
        }
        rowData.push(row);
    }
    rowData.push({
        id: 'agg',
        total: `=SUM(REF(COLUMN("c0"),ROW("r0"),COLUMN("c${colCount - 1}"),ROW("r${rowCount - 1}")))`,
    });

    function createRangeGrid(): GridApi {
        return gridsManager.createGrid('G', {
            columnDefs,
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: ({ data }) => data.id as string,
        });
    }

    let api!: GridApi;
    let toggle = 0;
    const benchOptions: BenchOptions = {
        ...benchDefaults(),
        setup: () => {
            if (!api) {
                api = createRangeGrid();
                const aggNode = api.getRowNode('agg')!;
                api.getCellValue({ rowNode: aggNode, colKey: 'total', useFormatter: false });
                toggle = 0;
            }
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    };

    bench(
        `cold: invalidate then SUM over ${rowCount * colCount} cells`,
        () => {
            toggle = toggle === 0 ? 1 : 0;
            api.applyTransaction({ update: [{ id: 'r0', c0: toggle }] });
            const rowNode = api.getRowNode('agg')!;
            api.getCellValue({ rowNode, colKey: 'total', useFormatter: false });
        },
        benchOptions
    );

    bench(
        `warm: re-read SUM over ${rowCount * colCount} cells (no invalidation)`,
        () => {
            const rowNode = api.getRowNode('agg')!;
            api.getCellValue({ rowNode, colKey: 'total', useFormatter: false });
        },
        benchOptions
    );
});

suite('formulas - column reorder', () => {
    const gridsManager = new BenchGridsManager({ modules: FORMULA_MODULES });
    const rowCount = 3000;

    // Two formula cols: one relative (immune to column order), one absolute (needs re-eval on reorder).
    const rowData = Array.from({ length: rowCount }, (_, i) => ({
        id: `r${i}`,
        a: i + 1,
        b: (i % 50) + 1,
        rel: `=REF(COLUMN("a"),ROW("r${i}"))*2`,
        abs: `=REF(COLUMN("A",true),ROW("r${i}"))+1`,
    }));

    const orderForward = [{ colId: 'a' }, { colId: 'b' }, { colId: 'rel' }, { colId: 'abs' }];
    const orderReversed = [{ colId: 'b' }, { colId: 'a' }, { colId: 'rel' }, { colId: 'abs' }];

    function createGrid(): GridApi {
        return gridsManager.createGrid('G', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'rel' }, { field: 'abs' }],
            defaultColDef: { allowFormula: true },
            rowData,
            getRowId: ({ data }) => data.id,
        });
    }

    function evaluateAll(api: GridApi): void {
        resolveColumnForAllRows(api, 'rel');
        resolveColumnForAllRows(api, 'abs');
    }

    let api!: GridApi;
    let forward = true;
    const benchOptions: BenchOptions = {
        ...benchDefaults(),
        setup: () => {
            if (!api) {
                api = createGrid();
                evaluateAll(api); // prime cache: ASTs parsed, values cached
                forward = true;
            }
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    };

    // Measures columnMoved cost: swap first two columns, then re-resolve every formula. The key
    // benefit of the granular `columnMoved` handler is that parsed ASTs are preserved, so this
    // becomes (rebuild colRefMap + version bump + pure recompute) instead of (full wipe + re-parse
    // + recompute) on every reorder.
    bench(
        `swap columns then re-evaluate ${rowCount * 2} formulas`,
        () => {
            forward = !forward;
            api.applyColumnState({
                state: forward ? orderForward : orderReversed,
                applyOrder: true,
            });
            evaluateAll(api);
        },
        benchOptions
    );
});
