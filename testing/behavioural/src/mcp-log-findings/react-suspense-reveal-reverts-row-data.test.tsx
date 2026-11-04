import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import React, { Suspense, useState } from 'react';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, RowApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: in React, if `rowData` is changed while the grid is visible, and the grid is later hidden and revealed
 * by a Suspense boundary (a sibling inside the same boundary suspends), the revealed grid shows the `rowData`
 * from the very first render, not the current one. React hides the existing tree and re-attaches the grid's
 * ref on reveal, and the grid is then recreated from the props captured on the first render. The change
 * detection that would catch up compares against the latest props, which already hold the new `rowData`, so it
 * finds nothing to send.
 *
 * Setup: a concurrent root (`createRoot`, which `@testing-library/react` uses). A wrapper holds `rowData` in
 * state (2 rows to start) and renders `<AgGridReact columnDefs rowData getRowId onGridReady />` with every other
 * prop a stable reference, next to a sibling component that can suspend, all inside one `<Suspense>`.
 * The rows are changed to 3 while the grid is visible. Then the sibling suspends, the fallback is shown, and the
 * promise resolves with no further state change.
 *
 * Expected: the Grid Interface docs say "Simply update your state and the grid will respond to the new value."
 * (Grid Interface page, React). After the reveal the grid shows the current 3 rows.
 *
 * Actual: after the reveal the grid shows the 2 rows from the first render.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of React grid lifecycle events for AG-18665.
 */
describe('React rowData after a Suspense hide and reveal', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowApiModule]);
    });

    afterEach(() => {
        cleanup();
    });

    type Row = { id: string };
    const columnDefs: ColDef<Row>[] = [{ field: 'id' }];
    const getRowId = ({ data }: { data: Row }) => data.id;
    const rows = (...ids: string[]): Row[] => ids.map((id) => ({ id }));

    test('rowData changed before a Suspense hide and reveal is still the current rowData after the reveal', async () => {
        let resolveSuspense!: () => void;
        const apis: GridApi<Row>[] = [];
        const onGridReady = (e: GridReadyEvent<Row>) => {
            apis.push(e.api);
        };

        let setRowData!: (rows: Row[]) => void;
        let suspend!: () => void;
        let resolved = false;

        const Suspender = ({ promise }: { promise: Promise<void> | null }) => {
            if (promise && !resolved) {
                throw promise;
            }
            return null;
        };

        const Wrapper = () => {
            const [rowData, setRowDataState] = useState(rows('a', 'b'));
            const [promise, setPromise] = useState<Promise<void> | null>(null);
            setRowData = setRowDataState;
            suspend = () => setPromise(new Promise<void>((resolve) => (resolveSuspense = resolve)));
            return (
                <Suspense fallback={<span data-testid="fallback">loading</span>}>
                    <div style={{ height: 300, width: 400 }}>
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={rowData}
                            getRowId={getRowId}
                            onGridReady={onGridReady}
                        />
                    </div>
                    <Suspender promise={promise} />
                </Suspense>
            );
        };

        const { findByTestId, queryByTestId } = render(<Wrapper />);

        await waitFor(() => expect(apis).toHaveLength(1));

        act(() => setRowData(rows('a', 'b', 'c')));
        await waitFor(() => expect(apis[0].getDisplayedRowCount()).toBe(3));

        act(() => suspend());
        await findByTestId('fallback');

        act(() => {
            resolved = true;
            resolveSuspense();
        });
        await waitFor(() => expect(queryByTestId('fallback')).toBeNull());
        await waitFor(() => expect(apis).toHaveLength(2));

        expect(apis[1].getRenderedNodes().map((node) => node.data!.id)).toEqual(['a', 'b', 'c']);
    });
});
