import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { BenchGridsManager, benchDefaults } from './bench-utils';

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
    // One manager for the suite, so each setup's reset destroys the previous bench's grid.
    const gridsManager = new BenchGridsManager({ modules });

    const benchLayout = (
        name: string,
        density: SpanDensity,
        initial: () => GridOptions<Row>,
        act: (api: GridApi<Row>, viewport: HTMLElement, iter: number) => void
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
                // Rendering whole rows of cells sits as noisy as scrolling does.
                ...benchDefaults({ noiseFactor: 2 }),
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
                },
            }
        );
    };

    /** Drives the real listener: dragging a scrollbar is a scroll event, not an api call. */
    const scrollTo = (viewport: HTMLElement, left: number, top: number): void => {
        viewport.scrollLeft = left;
        viewport.scrollTop = top;
        viewport.dispatchEvent(new Event('scroll'));
    };

    const densities: SpanDensity[] = ['none', 'sparse', 'dense'];
    for (const density of densities) {
        const cols100 = memo(() => buildCols(100, density));
        const cols400 = memo(() => buildCols(400, density));
        const grid100 = () => ({ columnDefs: cols100(), rowData: rows20k() });
        const grid400 = () => ({ columnDefs: cols400(), rowData: rows50k() });

        benchLayout('horizontal scroll 100 cols x 20k rows (small steps)', density, grid100, (api, viewport, i) => {
            scrollTo(viewport, 600 + (i % 20) * COL_WIDTH, 0);
        });

        benchLayout('horizontal scroll 400 cols x 50k rows (small steps)', density, grid400, (api, viewport, i) => {
            scrollTo(viewport, 600 + (i % 20) * COL_WIDTH, 0);
        });

        benchLayout('vertical scroll 100 cols x 20k rows (small steps)', density, grid100, (api, viewport, i) => {
            scrollTo(viewport, 0, 1000 + (i % 20) * 42);
        });

        const toggle100 = everyTenth(100);
        benchLayout('hide/show 10 of 100 cols x 20k rows', density, grid100, (api, _viewport, i) => {
            api.setColumnsVisible(toggle100, (i & 1) === 1);
        });

        const toggle400 = everyTenth(400);
        benchLayout('hide/show 40 of 400 cols x 50k rows', density, grid400, (api, _viewport, i) => {
            api.setColumnsVisible(toggle400, (i & 1) === 1);
        });

        benchLayout('move a column across 100 cols x 20k rows', density, grid100, (api, _viewport, i) => {
            api.moveColumns(['c1'], i & 1 ? 1 : 3);
        });

        // Focusing a column a span covers finds the drawn cell spanning it.
        benchLayout('setFocusedCell along a rendered row, 100 cols', density, grid100, (api, _viewport, i) => {
            api.setFocusedCell(1, `c${1 + (i % 10)}`);
        });

        // Flipping `wide` changes which cells the rendered row draws, so the row lays its cells out again.
        benchLayout('update a rendered row flipping its spans, 100 cols', density, grid100, (api, _viewport, i) => {
            api.applyTransaction({ update: [{ id: 2, v: i, wide: (i & 1) === 0 }] });
        });
    }
});
