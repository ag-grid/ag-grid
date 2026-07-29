import { act, cleanup, render, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RowApiModule, ScrollApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, collectWeakRefsUntilStable, ignoreConsoleLicenseKeyError } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

/**
 * Guards against unbounded retention in the React view layer: replacing `rowData` without
 * `getRowId` destroys and rebuilds every RowCtrl/CellCtrl, so anything holding on to a torn-down
 * controller (or its detached element) accumulates linearly with update count.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CHURNS = 60;
const MOUNTS = 30;
/** React and test-local closures keep a short trailing window of roots reachable; only older ones must be collected. */
const TRAILING_WINDOW = 5;

const colDefs: ColDef[] = [
    { colId: 'ID', field: 'id', width: 90 },
    ...LETTERS.map((letter) => ({ colId: `C_${letter}`, field: letter, width: 50 })),
];

const makeRowData = (tick: number) => {
    const rows: Record<string, unknown>[] = [];
    for (let i = 0; i < 100; i++) {
        const row: Record<string, unknown> = { id: `row-${i}` };
        for (let j = 0, len = LETTERS.length; j < len; ++j) {
            row[LETTERS[j]] = tick;
        }
        rows.push(row);
    }
    return rows;
};

/** Inside act(): the settle window lets queued animation-frame tasks drive their React state updates. */
const collectUntilStable = (refs: WeakRef<object>[]) =>
    collectWeakRefsUntilStable(refs, () => act(async () => void (await asyncSetTimeout(10))));

describe('row data churn retention (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule, ScrollApiModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('LEAK: repeatedly replacing rowData retains no torn-down row or cell ctrls', async () => {
        let api: GridApi | undefined;
        let setTick: ((tick: number) => void) | undefined;

        const Harness = () => {
            const [tick, tickState] = useState(0);
            const [rowData, setRowData] = useState(() => makeRowData(0));
            setTick = tickState;
            useEffect(() => {
                setRowData(makeRowData(tick));
            }, [tick]);
            return (
                <div style={{ height: 400, width: 600 }}>
                    <AgGridReact
                        columnDefs={colDefs}
                        rowData={rowData}
                        onGridReady={(params) => {
                            api = params.api;
                        }}
                    />
                </div>
            );
        };

        const rendered = render(<Harness />);
        await waitFor(() => expect(rendered.container.querySelectorAll('[row-id]').length).toBeGreaterThan(0));

        // Internal access is unavoidable: retention of destroyed controllers has no public API or DOM
        // footprint, so we census every controller ever mounted by spying their prototype setComp.
        const rowRenderer = (api!.getDisplayedRowAtIndex(0) as any).beans.rowRenderer;
        await waitFor(() => expect(rowRenderer.getAllRowCtrls()[0]?.getAllCellCtrls()?.length).toBeGreaterThan(0));

        const cellRefs: WeakRef<any>[] = [];
        const rowRefs: WeakRef<any>[] = [];
        const cellCtrlProto = Object.getPrototypeOf(rowRenderer.getAllRowCtrls()[0].getAllCellCtrls()[0]);
        const rowCtrlProto = Object.getPrototypeOf(rowRenderer.getAllRowCtrls()[0]);
        const origCellSetComp = cellCtrlProto.setComp;
        const origRowSetComp = rowCtrlProto.setComp;
        cellCtrlProto.setComp = function (...args: any[]) {
            cellRefs.push(new WeakRef(this));
            return origCellSetComp.apply(this, args);
        };
        rowCtrlProto.setComp = function (...args: any[]) {
            rowRefs.push(new WeakRef(this));
            return origRowSetComp.apply(this, args);
        };

        let liveCellsAfterFirstThird = 0;
        let liveRowsAfterFirstThird = 0;
        try {
            for (let tick = 1; tick <= CHURNS; tick++) {
                await act(async () => {
                    setTick!(tick);
                    await asyncSetTimeout(0);
                });

                if (tick === CHURNS / 3) {
                    liveCellsAfterFirstThird = await collectUntilStable(cellRefs);
                    liveRowsAfterFirstThird = await collectUntilStable(rowRefs);
                }
            }
        } finally {
            cellCtrlProto.setComp = origCellSetComp;
            rowCtrlProto.setComp = origRowSetComp;
        }

        const liveCells = await collectUntilStable(cellRefs);
        const liveRows = await collectUntilStable(rowRefs);

        // Every controller mounted was torn down and rebuilt, so the census must be far larger than
        // what stays alive — otherwise the churn never happened and the test proves nothing.
        expect(cellRefs.length).toBeGreaterThan(liveCells * 10);

        // Retention must be bounded by the viewport, not by the number of updates.
        expect(liveCells).toBeLessThanOrEqual(liveCellsAfterFirstThird);
        expect(liveRows).toBeLessThanOrEqual(liveRowsAfterFirstThird);

        const reachableCells = new Set<unknown>();
        for (const rowCtrl of rowRenderer.getAllRowCtrls()) {
            for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
                reachableCells.add(cellCtrl);
            }
        }
        expect(liveCells).toBe(reachableCells.size);

        const liveWithDetachedGui = cellRefs.filter((ref) => {
            const gui = ref.deref()?.eGui;
            return gui && !gui.isConnected;
        });
        expect(liveWithDetachedGui).toEqual([]);
    });

    test('LEAK: repeatedly mounting and unmounting a grid retains no grid api or beans', async () => {
        const apiRefs: WeakRef<object>[] = [];
        const beanRefs: WeakRef<object>[] = [];

        for (let i = 0; i < MOUNTS; i++) {
            let api: GridApi | undefined;
            render(
                <div style={{ height: 400, width: 600 }}>
                    <AgGridReact
                        columnDefs={colDefs}
                        rowData={makeRowData(i)}
                        onGridReady={(params) => {
                            api = params.api;
                        }}
                    />
                </div>
            );
            await waitFor(() => expect(api).toBeDefined());

            apiRefs.push(new WeakRef(api!));
            beanRefs.push(new WeakRef((api!.getDisplayedRowAtIndex(0) as any).beans));
            api = undefined;

            await act(async () => {
                await asyncSetTimeout(0);
                cleanup();
            });
        }

        await collectUntilStable(apiRefs);
        await collectUntilStable(beanRefs);

        const survivingApis = apiRefs.map((ref, index) => (ref.deref() ? index : -1)).filter((index) => index >= 0);
        const survivingBeans = beanRefs.map((ref, index) => (ref.deref() ? index : -1)).filter((index) => index >= 0);

        expect(survivingApis.every((index) => index >= MOUNTS - TRAILING_WINDOW)).toBe(true);
        expect(survivingBeans.every((index) => index >= MOUNTS - TRAILING_WINDOW)).toBe(true);
    });

    test('LEAK: scrolling back and forth retains no row or cell ctrls from previous viewports', async () => {
        let api: GridApi | undefined;

        const rowData: Record<string, unknown>[] = [];
        for (let i = 0; i < 2000; i++) {
            const row: Record<string, unknown> = { id: `row-${i}` };
            for (let j = 0, len = LETTERS.length; j < len; ++j) {
                row[LETTERS[j]] = i;
            }
            rowData.push(row);
        }

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    columnDefs={colDefs}
                    rowData={rowData}
                    getRowId={(params) => params.data.id as string}
                    onGridReady={(params) => {
                        api = params.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(rendered.container.querySelectorAll('[row-id]').length).toBeGreaterThan(0));

        const rowRenderer = (api!.getDisplayedRowAtIndex(0) as any).beans.rowRenderer;
        await waitFor(() => expect(rowRenderer.getAllRowCtrls()[0]?.getAllCellCtrls()?.length).toBeGreaterThan(0));

        const cellRefs: WeakRef<any>[] = [];
        const rowRefs: WeakRef<any>[] = [];
        const cellCtrlProto = Object.getPrototypeOf(rowRenderer.getAllRowCtrls()[0].getAllCellCtrls()[0]);
        const rowCtrlProto = Object.getPrototypeOf(rowRenderer.getAllRowCtrls()[0]);
        const origCellSetComp = cellCtrlProto.setComp;
        const origRowSetComp = rowCtrlProto.setComp;
        cellCtrlProto.setComp = function (...args: any[]) {
            cellRefs.push(new WeakRef(this));
            return origCellSetComp.apply(this, args);
        };
        rowCtrlProto.setComp = function (...args: any[]) {
            rowRefs.push(new WeakRef(this));
            return origRowSetComp.apply(this, args);
        };

        let liveCellsAfterFirstSweep = 0;
        let liveRowsAfterFirstSweep = 0;
        try {
            for (let sweep = 0; sweep < 4; sweep++) {
                for (let index = 0; index < 2000; index += 250) {
                    await act(async () => {
                        api!.ensureIndexVisible(index);
                        await asyncSetTimeout(0);
                    });
                }
                await act(async () => {
                    api!.ensureIndexVisible(0);
                    await asyncSetTimeout(0);
                });

                if (sweep === 0) {
                    liveCellsAfterFirstSweep = await collectUntilStable(cellRefs);
                    liveRowsAfterFirstSweep = await collectUntilStable(rowRefs);
                }
            }
        } finally {
            cellCtrlProto.setComp = origCellSetComp;
            rowCtrlProto.setComp = origRowSetComp;
        }

        const liveCells = await collectUntilStable(cellRefs);
        const liveRows = await collectUntilStable(rowRefs);

        expect(cellRefs.length).toBeGreaterThan(liveCells * 10);
        expect(liveCells).toBeLessThanOrEqual(liveCellsAfterFirstSweep);
        expect(liveRows).toBeLessThanOrEqual(liveRowsAfterFirstSweep);

        const liveWithDetachedGui = cellRefs.filter((ref) => {
            const gui = ref.deref()?.eGui;
            return gui && !gui.isConnected;
        });
        expect(liveWithDetachedGui).toEqual([]);
    });
});
