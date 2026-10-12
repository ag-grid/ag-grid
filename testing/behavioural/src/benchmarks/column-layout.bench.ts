import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { BenchGridsManager, benchDefaults, scrollStep, sweep } from './bench-utils';

// column moves are in the core module
const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule];

const COL_WIDTH = 120;

interface Row {
    id: number;
    v: number;
    /** A wide row draws every spanning column over the column after it. */
    wide: boolean;
}

/** Which columns carry a `colSpan`: none, one in twenty, or all of them. */
type SpanDensity = 'none' | 'sparse' | 'dense';

const spanWide = (params: { data?: Row }): number => (params.data?.wide ? 2 : 1);

const buildCols = (count: number, density: SpanDensity): ColDef<Row>[] => {
    const cols: ColDef<Row>[] = [];
    for (let i = 0; i < count; ++i) {
        const spans = density === 'dense' || (density === 'sparse' && i % 20 === 0);
        cols.push({ colId: `c${i}`, field: 'v', width: COL_WIDTH, colSpan: spans ? spanWide : undefined });
    }
    return cols;
};

const buildRows = (count: number): Row[] => {
    const rows: Row[] = [];
    for (let i = 0; i < count; ++i) {
        rows.push({ id: i, v: i, wide: (i & 1) === 1 });
    }
    return rows;
};

// Built on first use, not at import, so a run filtered to another file allocates none of it.
const memo = <T>(build: () => T): (() => T) => {
    let value: T | undefined;
    return () => (value ??= build());
};

const rows20k = memo(() => buildRows(20_000));
const rows50k = memo(() => buildRows(50_000));

const getRowId = (params: { data: Row }): string => String(params.data.id);

// A wheel step moving both ways, so one event renders new columns and new rows.
const scrollDiagonal = (_api: GridApi<Row>, viewport: HTMLElement, i: number): void => {
    const step = sweep(i);
    scrollStep(viewport, 600 + step * COL_WIDTH, 1000 + step * 42);
};

/** Every tenth column, the set a hide/show toggle flips, offset from the sparse spanning columns. */
const everyTenth = (count: number): string[] => {
    const ids: string[] = [];
    for (let i = 5; i < count; i += 10) {
        ids.push(`c${i}`);
    }
    return ids;
};

suite('column layout — rendered rows under colSpan density', () => {
    let gridId = 0;
    const gridsManager = new BenchGridsManager({ modules });

    const benchLayout = (
        name: string,
        density: SpanDensity,
        initial: () => GridOptions<Row>,
        act: (api: GridApi<Row>, viewport: HTMLElement, iter: number) => void,
        prepare?: (api: GridApi<Row>) => void
    ) => {
        const id = `CL${++gridId}`;
        let api!: GridApi<Row>;
        let viewport!: HTMLElement;
        let iter = 0;
        bench(
            `${name} [colSpan ${density}]`,
            () => {
                act(api, viewport, iter++);
                api.flushAllAnimationFrames();
            },
            {
                ...benchDefaults(),
                setup: async () => {
                    await gridsManager.reset();
                    iter = 0;
                    api = gridsManager.createGrid(id, { getRowId, ...initial() });
                    api.flushAllAnimationFrames();
                    viewport = document.querySelector(`#${id} .ag-grid-viewport`) as HTMLElement;
                    // Widths settle on the resize observation after the first layout.
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    api.flushAllAnimationFrames();
                    if (
                        viewport.scrollWidth <= viewport.clientWidth ||
                        viewport.scrollHeight <= viewport.clientHeight
                    ) {
                        throw new Error('viewport is not laid out: both axes must scroll');
                    }
                    // A bench that meant to span but draws no spanning cell measures the plain grid.
                    const spanned = document.querySelector(
                        `#${id} .ag-row[row-index="1"] .ag-cell[col-id="c0"]`
                    ) as HTMLElement | null;
                    const spans = spanned?.style.width === `${COL_WIDTH * 2}px`;
                    if (spans !== (density !== 'none')) {
                        throw new Error(`colSpan ${density}: row 1's first cell is ${spanned?.style.width}`);
                    }
                    prepare?.(api);
                    api.flushAllAnimationFrames();
                },
            }
        );
    };

    const densities: SpanDensity[] = ['none', 'sparse', 'dense'];
    const toggle100 = everyTenth(100);
    const toggle400 = everyTenth(400);
    for (const density of densities) {
        const cols100 = memo(() => buildCols(100, density));
        const cols400 = memo(() => buildCols(400, density));
        const grid100 = () => ({ columnDefs: cols100(), rowData: rows20k() });
        const grid400 = () => ({ columnDefs: cols400(), rowData: rows50k() });
        // The column animation is half to two thirds of a hide/show or move: without it, a change in the grid's
        // own column work shows two to three times as large.
        const grid100NoAnimation = () => ({ ...grid100(), suppressColumnMoveAnimation: true });

        benchLayout('scroll step 100 cols x 20k rows', density, grid100, scrollDiagonal);

        benchLayout('scroll step 400 cols x 50k rows', density, grid400, scrollDiagonal);

        const changeColumns = (toggle: string[]) => (api: GridApi<Row>, _viewport: HTMLElement, i: number) => {
            api.setColumnsVisible(toggle, (i & 1) === 1);
            api.moveColumns(['c1'], i & 1 ? 1 : 3);
        };
        benchLayout('hide/show 10 + move 1 of 100 cols x 20k rows', density, grid100, changeColumns(toggle100));
        benchLayout(
            'hide/show 10 + move 1 of 100 cols x 20k rows, no animation',
            density,
            grid100NoAnimation,
            changeColumns(toggle100)
        );
        benchLayout('hide/show 40 + move 1 of 400 cols x 50k rows', density, grid400, changeColumns(toggle400));

        // Flipping `wide` makes the rendered row lay its cells out again, then focus moves along that row onto
        // columns a span may cover.
        benchLayout('update + focus a rendered row, 100 cols', density, grid100, (api, _viewport, i) => {
            api.applyTransaction({ update: [{ id: 2, v: i, wide: (i & 1) === 0 }] });
            api.setFocusedCell(2, `c${1 + (i % 10)}`);
        });
    }

    // The first two columns pinned left and the last one right, so every layout has three lanes.
    const cols100Pinned = memo(() => {
        const cols = buildCols(100, 'none');
        cols[0].pinned = 'left';
        cols[1].pinned = 'left';
        cols[99].pinned = 'right';
        return cols;
    });
    const grid100Pinned = () => ({
        columnDefs: cols100Pinned(),
        rowData: rows20k(),
        suppressColumnMoveAnimation: true,
    });

    benchLayout('scroll step 100 cols x 20k rows, 3 pinned', 'none', grid100Pinned, scrollDiagonal);

    benchLayout(
        'move a column across 100 cols x 20k rows, 3 pinned, no animation',
        'none',
        grid100Pinned,
        (api, _viewport, i) => {
            api.moveColumns(['c5'], i & 1 ? 5 : 7);
        }
    );

    // The focused cell is scrolled out of view, so each layout keeps it outside the centre's columns.
    benchLayout(
        'horizontal scroll with the focused cell scrolled out, 100 cols x 20k rows',
        'none',
        () => ({ columnDefs: buildCols(100, 'none'), rowData: rows20k() }),
        (_api, viewport, i) => {
            scrollStep(viewport, 1200 + sweep(i) * COL_WIDTH, 0);
        },
        (api) => api.setFocusedCell(1, 'c2')
    );
});
