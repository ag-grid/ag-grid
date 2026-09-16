import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ScrollApiModule } from 'ag-grid-community';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [ClientSideRowModelModule, ColumnApiModule, ScrollApiModule];

const buildCols = (count: number, pinned = 0): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < count; ++i) {
        cols.push({
            colId: `c${i}`,
            field: `c${i}`,
            width: 120,
            pinned: i < pinned ? 'left' : undefined,
        });
    }
    return cols;
};

const buildRows = (rowCount: number, colCount: number): Record<string, string>[] => {
    const rows: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; ++r) {
        const row: Record<string, string> = {};
        for (let c = 0; c < colCount; ++c) {
            row[`c${c}`] = `r${r}c${c}`;
        }
        rows.push(row);
    }
    return rows;
};

const cols200 = buildCols(200);
const cols200Pinned = buildCols(200, 3);
const cols20 = buildCols(20);
const rows1k = buildRows(1000, 200);
const rows10k = buildRows(10_000, 20);

suite('scroll — horizontal and vertical virtualisation', () => {
    let gridId = 0;
    // One manager for the suite, so each setup's reset also destroys the previous bench's grid rather
    // than leaving it live on the page alongside the one being measured.
    const gridsManager = new BenchGridsManager({ modules });
    const benchScroll = (
        name: string,
        initial: GridOptions,
        act: (api: GridApi, viewport: HTMLElement, iter: number) => void
    ) => {
        const id = `SCROLL${++gridId}`;
        let api!: GridApi;
        let viewport!: HTMLElement;
        let iter = 0;
        bench(
            name,
            () => {
                act(api, viewport, iter++);
            },
            {
                // A scroll drives virtualisation plus the scrollbar sync, so it sits noisier than a pure
                // col-model rebuild; 2 keeps the band above the run-to-run spread.
                ...benchDefaults({ noiseFactor: 2 }),
                setup: async () => {
                    await gridsManager.reset();
                    iter = 0;
                    api = gridsManager.createGrid(id, initial);
                    api.flushAllAnimationFrames();
                    viewport = document.querySelector(`#${id} .ag-grid-viewport`) as HTMLElement;
                    // The grid is built before the browser lays it out, and its widths settle on the
                    // resize observation that follows. Measuring before that measures an unsized grid.
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    api.flushAllAnimationFrames();
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

    benchScroll(
        'horizontal scroll 200 cols (alternating far/near)',
        { columnDefs: cols200, rowData: rows1k },
        (api, viewport, i) => {
            scrollTo(viewport, i & 1 ? 0 : 12_000, 0);
            api.flushAllAnimationFrames();
        }
    );

    benchScroll(
        'horizontal scroll 200 cols, 3 pinned (alternating far/near)',
        { columnDefs: cols200Pinned, rowData: rows1k },
        (api, viewport, i) => {
            scrollTo(viewport, i & 1 ? 0 : 12_000, 0);
            api.flushAllAnimationFrames();
        }
    );

    /** Small steps are the common case: a wheel or trackpad gesture, not a jump to the far end. */
    benchScroll(
        'horizontal scroll 200 cols (small steps)',
        { columnDefs: cols200, rowData: rows1k },
        (api, viewport, i) => {
            scrollTo(viewport, 600 + (i % 20) * 120, 0);
            api.flushAllAnimationFrames();
        }
    );

    benchScroll(
        'vertical scroll 10k rows (alternating far/near)',
        { columnDefs: cols20, rowData: rows10k },
        (api, viewport, i) => {
            scrollTo(viewport, 0, i & 1 ? 0 : 100_000);
            api.flushAllAnimationFrames();
        }
    );

    benchScroll(
        'vertical scroll 10k rows (small steps)',
        { columnDefs: cols20, rowData: rows10k },
        (api, viewport, i) => {
            scrollTo(viewport, 0, 1000 + (i % 20) * 42);
            api.flushAllAnimationFrames();
        }
    );

    benchScroll(
        'ensureColumnVisible across 200 cols',
        { columnDefs: cols200, rowData: rows1k },
        (api, _viewport, i) => {
            api.ensureColumnVisible(`c${(i * 37) % 200}`);
            api.flushAllAnimationFrames();
        }
    );
});
