import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    RowApiModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

const ROW_SELECTOR = '[row-id]';

/**
 * Detection strategy: a MutationObserver records mutations where an element is
 * appended INTO an already-attached row. Pre-fix this fires for every newly-added
 * row (RowComp mounts empty, fills cells on a later commit); post-fix RowCtrl
 * pre-creates the cells so the row's first commit already contains them.
 */
describe('Eager row content seed (bulk-add flicker regression)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            RowApiModule,
            ColumnApiModule,
        ]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    type FlickerRecord = { rowId: string | null; addedElements: number };

    /** Records every mutation where a child element is appended into an already-attached row. */
    async function recordContentAppendedIntoExistingRows(
        root: HTMLElement,
        mutate: () => Promise<void> | void
    ): Promise<FlickerRecord[]> {
        const records: FlickerRecord[] = [];
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
                    continue;
                }
                const target = mutation.target;
                if (!(target instanceof HTMLElement) || !target.hasAttribute('row-id')) {
                    continue;
                }
                const addedElements = Array.from(mutation.addedNodes).filter(
                    (n): n is HTMLElement => n instanceof HTMLElement
                ).length;
                if (addedElements > 0) {
                    records.push({ rowId: target.getAttribute('row-id'), addedElements });
                }
            }
        });
        observer.observe(root, { childList: true, subtree: true });
        try {
            await mutate();
            await asyncSetTimeout(0); // drain MutationObserver microtask queue
        } finally {
            observer.disconnect();
        }
        return records;
    }

    function expectNoFlicker(records: FlickerRecord[]) {
        if (records.length === 0) {
            return;
        }
        const total = records.reduce((acc, r) => acc + r.addedElements, 0);
        throw new Error(
            `Expected new rows to be inserted with content already attached, but ${total} element(s) were ` +
                `appended into ${records.length} already-attached row(s). First: ${JSON.stringify(records.slice(0, 5))}`
        );
    }

    test('center-only columns: bulk add inserts rows with cells attached', async () => {
        const columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }];
        const initialRowData = Array.from({ length: 5 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));

        let gridApi: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={initialRowData}
                    columnDefs={columnDefs}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(0));

        const records = await recordContentAppendedIntoExistingRows(rendered.container, async () => {
            const additions = Array.from({ length: 20 }, (_, i) => ({ a: `na${i}`, b: `nb${i}`, c: `nc${i}` }));
            act(() => {
                gridApi!.applyTransaction({ add: additions });
            });
            await waitFor(() =>
                expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(initialRowData.length)
            );
        });

        expectNoFlicker(records);
    });

    test('pinned columns: left and right containers also receive pre-created cells', async () => {
        const columnDefs: ColDef[] = [
            { field: 'l1', pinned: 'left' },
            { field: 'l2', pinned: 'left' },
            { field: 'c1' },
            { field: 'c2' },
            { field: 'r1', pinned: 'right' },
        ];
        const makeRow = (i: number) => ({
            l1: `l1-${i}`,
            l2: `l2-${i}`,
            c1: `c1-${i}`,
            c2: `c2-${i}`,
            r1: `r1-${i}`,
        });
        const initialRowData = Array.from({ length: 3 }, (_, i) => makeRow(i));

        let gridApi: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 800 }}>
                <AgGridReact
                    rowData={initialRowData}
                    columnDefs={columnDefs}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(0));

        // Each row appears 3 times in the DOM (left/center/right containers).
        const records = await recordContentAppendedIntoExistingRows(rendered.container, async () => {
            const additions = Array.from({ length: 20 }, (_, i) => makeRow(100 + i));
            act(() => {
                gridApi!.applyTransaction({ add: additions });
            });
            await waitFor(() =>
                expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(
                    initialRowData.length * 3
                )
            );
        });

        expectNoFlicker(records);
    });

    test('column visibility toggle after bulk add still produces correct cells', async () => {
        // Guards against a regression where the constructor pre-creation prevents the
        // setComp-driven reconciliation from picking up subsequent column changes.
        const columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }];
        const initialRowData = Array.from({ length: 3 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));

        let gridApi: GridApi | undefined;
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={initialRowData}
                    columnDefs={columnDefs}
                    onGridReady={(p) => {
                        gridApi = p.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(0));

        act(() => {
            gridApi!.applyTransaction({
                add: Array.from({ length: 20 }, (_, i) => ({ a: `na${i}`, b: `nb${i}`, c: `nc${i}` })),
            });
        });
        await waitFor(() =>
            expect(rendered.container.querySelectorAll(ROW_SELECTOR).length).toBeGreaterThan(initialRowData.length)
        );

        act(() => {
            gridApi!.setColumnsVisible(['b'], false);
        });

        await waitFor(() => {
            const dataRows = Array.from(rendered.container.querySelectorAll(ROW_SELECTOR)).filter(
                (r) => r.querySelectorAll('[role="gridcell"]').length > 0
            );
            expect(dataRows.length).toBeGreaterThan(0);
            for (const row of dataRows) {
                expect(row.querySelectorAll('[role="gridcell"]').length).toBe(2);
            }
        });
    });
});
