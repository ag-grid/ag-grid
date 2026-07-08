// Cell-rendering benchmark: fill a wide viewport with freshly-constructed cells from an empty grid.
// Each measured iteration constructs every visible cell, driving the CellComp first-render path
// (wrapper + renderer + feature wiring) — the per-cell construction cost that data-pipeline benches
// only touch as a side effect. The teardown of the previous fill happens in `beforeEach`, which
// tinybench runs OUTSIDE the timed region, so the clear cost never enters the measurement.
//
// AllEnterpriseModule is registered so the per-cell cost reflects every feature being loaded — the
// worst case, and the one that matters for keeping rendering efficient regardless of module set.
// Grid config is otherwise minimal; only the two levers that maximise cells built per fill are set:
// column virtualisation is suppressed so all columns render, and rowHeight is small so the fixed
// 100vh viewport holds more rows.
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [AllEnterpriseModule];

interface WideRow {
    id: string;
    [key: string]: string | number;
}

// Minimal user component: exercises the createCellRendererInstance path (bean lifecycle + user-gui
// insertion + renderer teardown) that the default text-only path skips.
class BenchCellRenderer implements ICellRendererComp {
    private eGui!: HTMLElement;
    public init(params: ICellRendererParams): void {
        this.eGui = document.createElement('span');
        this.eGui.textContent = String(params.value);
    }
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public refresh(): boolean {
        return false;
    }
}

const buildWideCols = (colCount: number, cellRenderer?: unknown): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < colCount; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}`, cellRenderer });
    }
    return cols;
};

const buildWideData = (rowCount: number, colCount: number): WideRow[] => {
    const rows: WideRow[] = [];
    for (let r = 0; r < rowCount; ++r) {
        const row: WideRow = { id: `${r}` };
        for (let c = 0; c < colCount; ++c) {
            row[`c${c}`] = `r${r}c${c}`;
        }
        rows.push(row);
    }
    return rows;
};

// More rows than fit the viewport so vertical virtualisation still applies (realistic), but enough
// to fill it completely on every populate.
const ROW_COUNT = 500;

// Two suites, identical except for the cell content: the default text-only path, and a custom
// cellRenderer on every column (createCellRendererInstance + user-component teardown). Comparing
// them isolates the per-cell cost the user component adds on top of the base render.
const defineFillSuite = (suiteName: string, cellRenderer?: unknown): void => {
    suite(suiteName, () => {
        const gridsManager = new BenchGridsManager({ modules });
        let gridId = 0;

        // Each fill is an expensive iteration (tens of ms), so the 1× window yields few samples; a
        // higher noiseFactor buys a longer measured window and a tighter confidence interval.
        const benchFill = (name: string, colCount: number, noiseFactor = 3) => {
            const data = buildWideData(ROW_COUNT, colCount);
            const options: GridOptions<WideRow> = {
                columnDefs: buildWideCols(colCount, cellRenderer),
                suppressColumnVirtualisation: true,
                rowHeight: 20,
            };
            const id = `CF${++gridId}`;
            let api!: GridApi<WideRow>;
            bench(
                name,
                () => {
                    api.setGridOption('rowData', data);
                    // Flush the deferred (rAF-scheduled) render so the cell construction is measured
                    // here rather than leaking into a later iteration as a spike.
                    api.flushAllAnimationFrames();
                },
                {
                    ...benchDefaults({ noiseFactor }),
                    setup: async () => {
                        await gridsManager.reset();
                        api = gridsManager.createGrid(id, { ...options, rowData: [] });
                    },
                    // Untimed: tear down the previous fill's cells so every measured fill is a true
                    // first render from an empty grid.
                    beforeEach: () => {
                        api.setGridOption('rowData', []);
                        api.flushAllAnimationFrames();
                    },
                }
            );
        };

        benchFill('fill — 50 cols', 50);
        benchFill('fill — 100 cols', 100);
    });
};

defineFillSuite('cell render — fill only (empty → full, clear untimed)');
defineFillSuite('cell render — fill only, custom cellRenderer (empty → full, clear untimed)', BenchCellRenderer);
