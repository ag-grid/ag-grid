import { bench, suite } from 'vitest';

import type { AgColumn, ColDef, GridApi, IRowNode } from 'ag-grid-community';
import {
    CellApiModule,
    CellStyleModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RowApiModule,
    TextEditorModule,
    TooltipModule,
} from 'ag-grid-community';

import { BenchGridsManager, SimplePRNG, benchDefaults } from './bench-utils';

suite('getValue profiling', () => {
    const rowCount = 2000;
    const colCount = 100;

    const gridsManager = new BenchGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowApiModule,
            CellApiModule,
            ColumnApiModule,
            CellStyleModule,
            TooltipModule,
            TextEditorModule,
        ],
    });

    const columnDefs: ColDef[] = [];
    for (let i = 0; i < colCount; i++) {
        columnDefs.push({ colId: `col_${i}`, field: `col_${i}` });
    }

    const prng = new SimplePRNG(0x12345678);
    const rowData: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, string> = { id: r.toString() };
        for (let c = 0; c < colCount; c++) {
            row[`col_${c}`] = prng.nextString(6);
        }
        rowData.push(row);
    }

    const lastField = `col_${colCount - 1}`;
    let api!: GridApi;
    let rowNodes: IRowNode[] = [];
    let lastCol!: AgColumn;
    // A grid per bench, built in setup: one built at import renders rows before every bench, and the JIT
    // feedback that leaves in the value path is the rendering code's, not the bench's.
    const options = benchDefaults({
        setup: async () => {
            await gridsManager.reset();
            api = gridsManager.createGrid('G', { columnDefs, rowData, getRowId: ({ data }) => data.id });
            rowNodes = [];
            api.forEachNode((n) => rowNodes.push(n));
            lastCol = api.getColumn(lastField)! as AgColumn;
        },
    });

    // Each loop accumulates the read value into `sink` (returned) so V8 can't dead-code-eliminate the
    // getDataValue call — otherwise the bench would measure nothing and look impossibly fast. A call reads
    // the rows PASSES times: one pass is a few 5µs timer steps, too coarse to measure.
    const PASSES = 10;
    bench(
        `getDataValue by string (last of ${colCount} cols)`,
        () => {
            let sink = 0;
            for (let p = 0; p < PASSES; ++p) {
                for (let i = 0; i < rowCount; ++i) {
                    sink += rowNodes[i].getDataValue(lastField) ? 1 : 0;
                }
            }
            return sink as any;
        },
        options
    );

    bench(
        `getDataValue by Column object (last of ${colCount} cols)`,
        () => {
            let sink = 0;
            for (let p = 0; p < PASSES; ++p) {
                for (let i = 0; i < rowCount; ++i) {
                    sink += rowNodes[i].getDataValue(lastCol) ? 1 : 0;
                }
            }
            return sink as any;
        },
        options
    );

    bench(
        `getCellValue by string (last of ${colCount} cols)`,
        () => {
            let sink = 0;
            for (let p = 0; p < PASSES; ++p) {
                for (let i = 0; i < rowCount; ++i) {
                    sink += api.getCellValue({ rowNode: rowNodes[i], colKey: lastField, useFormatter: false }) ? 1 : 0;
                }
            }
            return sink as any;
        },
        options
    );
});

suite('getValue profiling (all columns per row)', () => {
    // The hot grid paths (render, filter, sort, aggregation) read EVERY column per row, so the value
    // read site sees many columns — not one repeated column like the suite above (which keeps the
    // `colDef` read site monomorphic regardless of colDef variety). With varied colDefs (the realistic
    // case) the `colDef.X` site goes megamorphic; a mirrored `column.X` field stays monomorphic on the
    // single AgColumn shape. The uniform grid is the control that isolates the colDef-shape-variety effect.
    const rowCount = 1000;
    const colCount = 100;

    const gridsManager = new BenchGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowApiModule,
            CellApiModule,
            ColumnApiModule,
            CellStyleModule,
            TooltipModule,
            TextEditorModule,
        ],
    });

    // Props that change the colDef object SHAPE without diverting value resolution away from `field`.
    const shapeVariants: Partial<ColDef>[] = [
        { headerName: 'A' },
        { sortable: true },
        { resizable: false },
        { width: 120 },
        { minWidth: 60, maxWidth: 400 },
        { cellClass: 'c' },
        { headerTooltip: 't' },
        { editable: true },
        { flex: 1 },
        { suppressMovable: true },
        { headerClass: 'h', cellStyle: { color: 'red' } },
        { initialPinned: 'left' },
    ];

    const uniformDefs: ColDef[] = [];
    const variedDefs: ColDef[] = [];
    for (let i = 0; i < colCount; i++) {
        uniformDefs.push({ colId: `col_${i}`, field: `col_${i}` });
        variedDefs.push({ colId: `col_${i}`, field: `col_${i}`, ...shapeVariants[i % shapeVariants.length] });
    }

    const prng = new SimplePRNG(0x12345678);
    const rowData: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, string> = { id: r.toString() };
        for (let c = 0; c < colCount; c++) {
            row[`col_${c}`] = prng.nextString(6);
        }
        rowData.push(row);
    }

    let nodes: IRowNode[] = [];
    let cols: AgColumn[] = [];
    const options = (columnDefs: ColDef[]) =>
        benchDefaults({
            setup: async () => {
                await gridsManager.reset();
                const api = gridsManager.createGrid('V', { columnDefs, rowData, getRowId: ({ data }) => data.id });
                nodes = [];
                api.forEachNode((n) => nodes.push(n));
                cols = api.getColumns()! as AgColumn[];
            },
        });
    // Two literals, not one shared fn: closures from one site share their feedback, so the varied loop would
    // inherit the uniform one's shapes and the control would stop isolating them.
    bench(
        `getDataValue uniform colDefs (${colCount} cols x ${rowCount} rows)`,
        () => {
            let sink = 0;
            for (let i = 0; i < rowCount; ++i) {
                const node = nodes[i];
                for (let c = 0; c < colCount; ++c) {
                    sink += node.getDataValue(cols[c]) ? 1 : 0;
                }
            }
            return sink as any;
        },
        options(uniformDefs)
    );

    bench(
        `getDataValue varied colDefs (${colCount} cols x ${rowCount} rows)`,
        () => {
            let sink = 0;
            for (let i = 0; i < rowCount; ++i) {
                const node = nodes[i];
                for (let c = 0; c < colCount; ++c) {
                    sink += node.getDataValue(cols[c]) ? 1 : 0;
                }
            }
            return sink as any;
        },
        options(variedDefs)
    );
});

suite('getValue profiling (valueGetter columns)', () => {
    // Exercises the executeValueGetter dispatch path (not hit by plain field columns above).
    const rowCount = 1000;
    const colCount = 100;

    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, RowApiModule, CellApiModule, ColumnApiModule],
    });

    const columnDefs: ColDef[] = [];
    for (let i = 0; i < colCount; i++) {
        const field = `col_${i}`;
        columnDefs.push({ colId: field, valueGetter: (p) => p.data?.[field] });
    }

    const prng = new SimplePRNG(0x12345678);
    const rowData: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, string> = { id: r.toString() };
        for (let c = 0; c < colCount; c++) {
            row[`col_${c}`] = prng.nextString(6);
        }
        rowData.push(row);
    }

    let nodes: IRowNode[] = [];
    let cols: AgColumn[] = [];

    bench(
        `getDataValue valueGetter cols (${colCount} cols x ${rowCount} rows)`,
        () => {
            let sink = 0;
            for (let i = 0; i < rowCount; ++i) {
                const node = nodes[i];
                for (let c = 0; c < colCount; ++c) {
                    sink += node.getDataValue(cols[c]) ? 1 : 0;
                }
            }
            return sink as any;
        },
        benchDefaults({
            setup: async () => {
                await gridsManager.reset();
                const api = gridsManager.createGrid('VG', { columnDefs, rowData, getRowId: ({ data }) => data.id });
                nodes = [];
                api.forEachNode((n) => nodes.push(n));
                cols = api.getColumns()! as AgColumn[];
            },
        })
    );
});
