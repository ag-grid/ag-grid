import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi, IViewportDatasourceParams } from 'ag-grid-community';
import { ModuleRegistry, RowApiModule } from 'ag-grid-community';
import { ViewportRowModelModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

const ROW_SELECTOR = '[row-id]';

describe('viewport stale index + orphaned row ctrl leak (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ModuleRegistry.registerModules([ViewportRowModelModule, RowApiModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    type ViewportRow = { id: string; name: string };

    function rowDataFromIds(idsByIndex: Record<number, string>) {
        const rowData: Record<number, ViewportRow> = {};
        for (const [index, id] of Object.entries(idsByIndex)) {
            rowData[Number(index)] = { id, name: `name-${id}` };
        }
        return rowData;
    }

    test('LEAK: no RowCtrl left alive but unreachable after recycles through AgGridReact', async () => {
        let gridApi: GridApi | undefined;
        let ds: IViewportDatasourceParams | undefined;

        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<ViewportRow>
                    columnDefs={[{ field: 'name' }]}
                    rowModelType="viewport"
                    suppressRowVirtualisation={true}
                    getRowId={(params) => params.data.id}
                    viewportDatasource={{
                        init: (params) => {
                            ds = params;
                        },
                        setViewportRange: () => {},
                    }}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(ds).toBeDefined());

        await act(async () => {
            ds!.setRowCount(5);
            ds!.setRowData(rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' }));
            await asyncSetTimeout(0);
        });

        await waitFor(() => expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(0));

        // Internal access is unavoidable here: the orphaned-RowCtrl leak has no public API/DOM
        // footprint (after recycles the DOM and forEachNode are clean while leaked controllers stay
        // alive-but-unreachable), so we census controllers via the RowRenderer. The unmounted-state
        // console error asserted below is the only public, React-specific symptom of the same leak.
        const beans = (gridApi!.getRowNode('a') as any).beans;
        const rowRenderer = beans.rowRenderer;

        // Census EVERY RowCtrl ever constructed by spying its prototype addListeners.
        const seen = new Set<any>(rowRenderer.getAllRowCtrls());
        const RowCtrlProto = Object.getPrototypeOf([...seen][0]);
        const origAddListeners = RowCtrlProto.addListeners;
        RowCtrlProto.addListeners = function (...args: any[]) {
            seen.add(this);
            return origAddListeners.apply(this, args);
        };

        // React logs an error when state is set on an unmounted component; capture as a
        // secondary React-specific signal of the orphaned ctrl still driving its cell comps.
        const consoleErrors: string[] = [];
        const origConsoleError = console.error;
        console.error = (...args: any[]) => {
            consoleErrors.push(args.map(String).join(' '));
        };

        try {
            const a = rowDataFromIds({ 0: 'e', 1: 'a', 2: 'b', 3: 'c' });
            const b = rowDataFromIds({ 0: 'a', 1: 'b', 2: 'c', 3: 'd' });
            for (let i = 0; i < 6; i++) {
                await act(async () => {
                    ds!.setRowData(i % 2 ? b : a);
                    await asyncSetTimeout(0);
                });
            }
        } finally {
            RowCtrlProto.addListeners = origAddListeners;
            console.error = origConsoleError;
        }

        const reachable = new Set(rowRenderer.getAllRowCtrls());
        const orphaned = [...seen].filter((c) => c.isAlive() && !reachable.has(c));

        // primary: the leaked controllers themselves
        expect(orphaned).toHaveLength(0);
        // secondary (React-specific compounding): no unmounted-component state updates
        expect(consoleErrors.filter((e) => e.includes('unmounted'))).toEqual([]);
    });
});
