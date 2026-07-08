// React cell-rendering benchmark — the React twin of cell-render.bench.ts. React re-implements the
// cell view layer (packages/ag-grid-react/src/reactUi), so it runs an entirely different render path
// (React reconciliation + commit) that the vanilla suite never touches. Each measured iteration
// replaces the grid's row data, constructing every visible cell; `setup` empties the grid once per
// cycle, so the first measured iteration is an empty→full first render and every subsequent one
// replaces the previous full row set (no getRowId → every row/cell is torn down and rebuilt).
//
// React defers its cell commits: after setGridOption + flushAllAnimationFrames the grid has fired its
// events but React has NOT yet committed (0 cells in the DOM). Wrapping the fill in ReactDOM.flushSync
// forces the pending commit synchronously, landing the whole render inside the measured window.
//
// NB: vitest runs a single measured loop per bench and exposes no untimed per-iteration hook, so the
// teardown of the previous fill is part of the replace samples by design — it cannot be excluded.
// NB: numbers here are NOT directly comparable to the vanilla suite (React adds a reconciliation +
// commit layer); keep the two reports separate.
import React from 'react';
import { flushSync } from 'react-dom';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent, Module } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

import { ignoreConsoleLicenseKeyError } from '../test-utils/ignoreConsoleLicenseKeyError';
import { benchCooldown, benchDefaults } from './bench-utils';

const modules: Module[] = [AllEnterpriseModule];

interface WideRow {
    id: string;
    [key: string]: string | number;
}

// Idiomatic React cell renderer — the framework-component path, not the vanilla JS-class shim.
const BenchReactRenderer = (props: CustomCellRendererProps<WideRow>) => <span>{String(props.value)}</span>;

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

// Mounts one AgGridReact into a viewport-filling container (matching bench-utils' vanilla grids) and
// resolves once the grid is ready. Unmount + reclaim happens in reset(), mirroring BenchGridsManager.
class ReactBenchGrid {
    private container: HTMLDivElement | undefined;
    private root: Root | undefined;
    public api!: GridApi<WideRow>;

    public async mount(columnDefs: ColDef[]): Promise<void> {
        const container = document.createElement('div');
        const style = container.style;
        style.width = '100vw';
        style.height = '100vh';
        document.body.style.margin = '0';
        document.body.appendChild(container);
        this.container = container;

        ignoreConsoleLicenseKeyError();

        const root = createRoot(container);
        this.root = root;
        await new Promise<void>((resolve) => {
            root.render(
                <AgGridReact<WideRow>
                    modules={modules}
                    columnDefs={columnDefs}
                    rowData={[]}
                    suppressColumnVirtualisation={true}
                    rowHeight={20}
                    onGridReady={(e: GridReadyEvent<WideRow>) => {
                        this.api = e.api;
                        resolve();
                    }}
                />
            );
        });
    }

    public async reset(): Promise<void> {
        this.root?.unmount();
        this.container?.remove();
        this.root = undefined;
        this.container = undefined;
        this.api = undefined!;
        (globalThis as { gc?: () => void }).gc?.();
        await benchCooldown();
    }
}

const defineReactFillSuite = (suiteName: string, cellRenderer?: unknown): void => {
    suite(suiteName, () => {
        const grid = new ReactBenchGrid();

        // Each fill is an expensive iteration (tens of ms), so the 1× window yields few samples; a
        // higher noiseFactor buys a longer measured window and a tighter confidence interval.
        const benchFill = (name: string, colCount: number, noiseFactor = 3) => {
            const data = buildWideData(ROW_COUNT, colCount);
            const columnDefs = buildWideCols(colCount, cellRenderer);
            bench(
                name,
                () => {
                    // flushSync forces React to commit the cells synchronously (see file header); the
                    // rAF flush inside it fires the grid events that schedule those commits.
                    flushSync(() => {
                        grid.api.setGridOption('rowData', data);
                        grid.api.flushAllAnimationFrames();
                    });
                },
                {
                    ...benchDefaults({ noiseFactor }),
                    setup: async () => {
                        await grid.reset();
                        await grid.mount(columnDefs);
                    },
                }
            );
        };

        benchFill('fill — 50 cols', 50);
        benchFill('fill — 100 cols', 100);
    });
};

defineReactFillSuite('react cell render — replace all cells (full grid re-render)');
defineReactFillSuite(
    'react cell render — replace all cells, custom cellRenderer (full grid re-render)',
    BenchReactRenderer
);
