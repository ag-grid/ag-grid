// React cell-rendering benchmark — the React twin of cell-render.bench.ts. React re-implements the
// cell view layer (packages/ag-grid-react/src/reactUi), so it runs an entirely different render path
// (React reconciliation + commit) that the vanilla suite never touches. Each measured call fills an
// emptied grid (the emptying is untimed), constructing every visible cell without the teardown of the
// previous fill.
//
// React defers its cell commits: after setGridOption + flushAllAnimationFrames the grid has fired its
// events but React has NOT yet committed (0 cells in the DOM). Wrapping the fill in ReactDOM.flushSync
// forces the pending commit synchronously, landing the whole render inside the measured window.
//
// NB: numbers here are NOT directly comparable to the vanilla suite (React adds a reconciliation +
// commit layer); keep the two reports separate.
import React from 'react';
import { flushSync } from 'react-dom';
import { bench, suite } from 'vitest';

import type { ColDef, Module } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { CustomCellRendererProps } from 'ag-grid-react';

import { ReactBenchGrid } from './bench-react-utils';
import { benchDefaults, untimedPrepare } from './bench-utils';

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

const defineReactFillSuite = (suiteName: string, cellRenderer?: unknown): void => {
    suite(suiteName, () => {
        const grid = new ReactBenchGrid<WideRow>();

        const benchFill = (name: string, colCount: number) => {
            const data = buildWideData(ROW_COUNT, colCount);
            const columnDefs = buildWideCols(colCount, cellRenderer);
            bench(
                name,
                untimedPrepare(
                    () => {
                        flushSync(() => {
                            grid.api.setGridOption('rowData', []);
                            grid.api.flushAllAnimationFrames();
                        });
                    },
                    () => {
                        // flushSync forces React to commit the cells synchronously (see file header); the
                        // rAF flush inside it fires the grid events that schedule those commits.
                        flushSync(() => {
                            grid.api.setGridOption('rowData', data);
                            grid.api.flushAllAnimationFrames();
                        });
                    }
                ),
                {
                    ...benchDefaults(),
                    setup: async () => {
                        await grid.reset();
                        await grid.mount({
                            modules,
                            columnDefs,
                            rowData: [],
                            suppressColumnVirtualisation: true,
                            rowHeight: 20,
                        });
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
