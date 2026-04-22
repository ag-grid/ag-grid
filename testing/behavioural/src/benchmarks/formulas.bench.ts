import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { CellApiModule, ClientSideRowModelApiModule, ClientSideRowModelModule, RowApiModule } from 'ag-grid-community';
import { FormulaModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

const FORMULA_MODULES = [
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    RowApiModule,
    CellApiModule,
    FormulaModule,
];

function resolveColumnForAllRows(api: GridApi, colKey: string): void {
    api.forEachNode((node) => {
        api.getCellValue({ rowNode: node, colKey, useFormatter: false });
    });
}

suite('formulas - flat grid evaluation', () => {
    const gridsManager = new TestGridsManager({ benchmark: true, modules: FORMULA_MODULES });
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
    const coldBenchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= createFlatGrid();
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    const warmBenchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            if (!api) {
                api = createFlatGrid();
                evaluateAll(api);
            }
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    bench(`cold: evaluate sum/product/branch for ${rowCount} rows`, () => evaluateAll(api), coldBenchOptions);
    bench(
        `warm: re-read sum/product/branch for ${rowCount} rows (cache hits)`,
        () => evaluateAll(api),
        warmBenchOptions
    );
});

suite('formulas - dependent re-evaluation on update', () => {
    const gridsManager = new TestGridsManager({ benchmark: true, modules: FORMULA_MODULES });
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
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [{ field: 'value' }],
                defaultColDef: { allowFormula: true },
                rowData,
                getRowId: ({ data }) => data.id as string,
            });
            resolveColumnForAllRows(api, 'value');
            sourceValue = 10;
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
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
    const gridsManager = new TestGridsManager({ benchmark: true, modules: FORMULA_MODULES });
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
    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= createRangeGrid();
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    bench(
        `SUM over ${rowCount * colCount} cells (first read)`,
        () => {
            const rowNode = api.getRowNode('agg')!;
            api.getCellValue({ rowNode, colKey: 'total', useFormatter: false });
        },
        benchOptions
    );
});
