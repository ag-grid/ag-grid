import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import type { ColDef, ViewRow, ViewRowRef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { ViewSubscriptionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { createRecorder, range } from './viewSubscriptionTestUtils';

describe('viewSubscription with AgGridReact', () => {
    beforeAll(() => {
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
        ModuleRegistry.registerModules([ClientSideRowModelModule, ViewSubscriptionModule]);
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    type Datum = { id: string; value: number };
    const columnDefs: ColDef<Datum>[] = [{ field: 'value' }];
    const rowData: Datum[] = Array.from({ length: 5 }, (_, i) => ({ id: String(i), value: i }));
    const getRowId = ({ data }: { data: Datum }) => data.id;

    test('inline handlers re-created on every render neither unsubscribe nor subscribe again, and viewSubscriptionActive false unsubscribes every row', async () => {
        const recorder = createRecorder();
        let setEnabled: ((enabled: boolean) => void) | undefined;
        let rerender: (() => void) | undefined;

        function Wrapper() {
            const [enabled, setEnabledState] = React.useState(true);
            const [count, setCount] = React.useState(0);
            setEnabled = setEnabledState;
            rerender = () => setCount((c) => c + 1);
            return (
                <div style={{ height: 400, width: 600 }} data-count={count}>
                    <AgGridReact<Datum>
                        rowData={rowData}
                        columnDefs={columnDefs}
                        getRowId={getRowId}
                        viewSubscription={{
                            subscribeRows: (rows: ViewRow[], params) => recorder.handlers.subscribeRows(rows, params),
                            unsubscribeRows: (rows: ViewRowRef[], params) =>
                                recorder.handlers.unsubscribeRows(rows, params),
                        }}
                        viewSubscriptionActive={enabled}
                    />
                </div>
            );
        }

        render(<Wrapper />);
        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 4)));
        const callsBeforeRerender = recorder.calls.slice();

        for (let i = 0; i < 3; ++i) {
            act(() => rerender!());
            await act(() => asyncSetTimeout(0));
        }

        expect(recorder.calls).toEqual(callsBeforeRerender);

        act(() => setEnabled!(false));
        await act(() => asyncSetTimeout(0));

        expect(recorder.calls).toEqual([...callsBeforeRerender, { type: 'unsubscribe', ids: range(0, 4) }]);
        expect(recorder.violations).toEqual([]);
    });
});
