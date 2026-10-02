// React twin of column-layout.bench.ts: paths that keep a row and change what it draws (scroll, column change,
// focus, data update). Each act runs in flushSync with frames flushed, and setup asserts a scroll commits
// synchronously, so a deferred commit never reads as free.
import { flushSync } from 'react-dom';
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RenderApiModule,
} from 'ag-grid-community';

import { ReactBenchGrid } from './bench-react-utils';
import { benchDefaults, scrollStep, sweep } from './bench-utils';

// RenderApiModule for api.flushAllAnimationFrames(), without which every act measures nothing.
const modules: Module[] = [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule, RenderApiModule];

const COL_WIDTH = 120;
const COL_COUNT = 100;

interface Row {
    id: number;
    v: number;
    /** A wide row draws every spanning column over the column after it. */
    wide: boolean;
}

/** Which columns carry a `colSpan`: none, or one in twenty. */
type SpanDensity = 'none' | 'sparse';

const spanWide = (params: { data?: Row }): number => (params.data?.wide ? 2 : 1);

/** `pinned` pins the first two columns left and the last one right. */
const buildCols = (density: SpanDensity, pinned: boolean): ColDef<Row>[] => {
    const cols: ColDef<Row>[] = [];
    for (let i = 0; i < COL_COUNT; ++i) {
        const spans = density === 'sparse' && i % 20 === 0;
        let pin: 'left' | 'right' | undefined;
        if (pinned && i < 2) {
            pin = 'left';
        } else if (pinned && i === COL_COUNT - 1) {
            pin = 'right';
        }
        cols.push({ colId: `c${i}`, field: 'v', width: COL_WIDTH, colSpan: spans ? spanWide : undefined, pinned: pin });
    }
    return cols;
};

// Built on first use, not at import, so a run filtered to another file allocates none of it.
let rows20k: Row[] | undefined;
const getRows = (): Row[] => {
    if (!rows20k) {
        rows20k = [];
        for (let i = 0; i < 20_000; ++i) {
            rows20k.push({ id: i, v: i, wide: (i & 1) === 1 });
        }
    }
    return rows20k;
};

const getRowId = (params: { data: Row }): string => String(params.data.id);

// A wheel step moving both ways, so one event renders new columns and new rows.
const scrollDiagonal = (_api: GridApi<Row>, viewport: HTMLElement, i: number): void => {
    const step = sweep(i);
    scrollStep(viewport, 600 + step * COL_WIDTH, 1000 + step * 42);
};

/** Every tenth column, the set a hide/show toggle flips, offset from the sparse spanning columns. */
const TOGGLED: string[] = [];
for (let i = 5; i < COL_COUNT; i += 10) {
    TOGGLED.push(`c${i}`);
}

suite('react row render — scrolling and updates on rendered rows', () => {
    const grid = new ReactBenchGrid<Row>();
    let viewport!: HTMLElement;

    const benchRows = (
        name: string,
        options: () => GridOptions<Row>,
        act: (api: GridApi<Row>, viewport: HTMLElement, iter: number) => void,
        prepare?: (api: GridApi<Row>, viewport: HTMLElement) => void
    ) => {
        let iter = 0;
        bench(
            name,
            () => {
                const api = grid.api;
                flushSync(() => {
                    act(api, viewport, iter++);
                    api.flushAllAnimationFrames();
                });
            },
            {
                ...benchDefaults(),
                setup: async () => {
                    await grid.reset();
                    iter = 0;
                    await grid.mount({ modules, getRowId, ...options() });
                    const api = grid.api;
                    // Widths settle on the resize observation after the first layout.
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    flushSync(() => api.flushAllAnimationFrames());
                    viewport = grid.container!.querySelector('.ag-grid-viewport') as HTMLElement;
                    if (
                        viewport.scrollWidth <= viewport.clientWidth ||
                        viewport.scrollHeight <= viewport.clientHeight
                    ) {
                        throw new Error('viewport is not laid out: both axes must scroll');
                    }
                    // A scroll must commit inside flushSync, or every bench here measures nothing.
                    flushSync(() => {
                        scrollStep(viewport, 50 * COL_WIDTH, 0);
                        api.flushAllAnimationFrames();
                    });
                    if (!viewport.querySelector('.ag-cell[col-id="c50"]')) {
                        throw new Error('React did not commit the scrolled cells synchronously');
                    }
                    flushSync(() => {
                        scrollStep(viewport, 0, 0);
                        api.flushAllAnimationFrames();
                    });
                    prepare?.(api, viewport);
                },
            }
        );
    };

    const densities: SpanDensity[] = ['none', 'sparse'];
    for (const density of densities) {
        const cols = buildCols(density, false);
        const plain = () => ({ columnDefs: cols, rowData: getRows(), suppressColumnMoveAnimation: true });
        const tag = `[colSpan ${density}]`;

        benchRows(`scroll step 100 cols x 20k rows ${tag}`, plain, scrollDiagonal);

        benchRows(`hide/show 10 + move 1 of 100 cols x 20k rows, no animation ${tag}`, plain, (api, _viewport, i) => {
            api.setColumnsVisible(TOGGLED, (i & 1) === 1);
            api.moveColumns(['c1'], i & 1 ? 1 : 3);
        });

        // Flipping `wide` makes the rendered row lay its cells out again, then focus moves along that row onto
        // columns a span may cover.
        benchRows(`update + focus a rendered row, 100 cols ${tag}`, plain, (api, _viewport, i) => {
            api.applyTransaction({ update: [{ id: 2, v: i, wide: (i & 1) === 0 }] });
            api.setFocusedCell(2, `c${1 + (i % 10)}`);
        });

        // Every rendered row's value changes, so every rendered cell refreshes in place.
        benchRows(`update every rendered row's value, 100 cols ${tag}`, plain, (api, _viewport, i) => {
            const update: Row[] = [];
            for (let r = 0; r < 60; ++r) {
                update.push({ id: r, v: r + i, wide: (r & 1) === 1 });
            }
            api.applyTransaction({ update });
        });
    }

    const pinnedCols = buildCols('none', true);
    const pinned = () => ({ columnDefs: pinnedCols, rowData: getRows(), suppressColumnMoveAnimation: true });

    benchRows('scroll step 100 cols x 20k rows, 3 pinned', pinned, scrollDiagonal);

    benchRows('move a column across 100 cols x 20k rows, 3 pinned, no animation', pinned, (api, _viewport, i) => {
        api.moveColumns(['c5'], i & 1 ? 5 : 7);
    });

    const plainNone = buildCols('none', false);
    // The focused cell is scrolled out of view, so each layout keeps it outside the centre's columns.
    benchRows(
        'horizontal scroll with the focused cell scrolled out, 100 cols x 20k rows',
        () => ({ columnDefs: plainNone, rowData: getRows() }),
        (_api, viewport, i) => {
            scrollStep(viewport, 1200 + sweep(i) * COL_WIDTH, 0);
        },
        (api) => {
            flushSync(() => {
                api.setFocusedCell(1, 'c2');
                api.flushAllAnimationFrames();
            });
        }
    );
});
