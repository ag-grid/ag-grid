import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, PinnedRowModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout, ignoreConsoleLicenseKeyError } from '../test-utils';

const PINNED_TOP_SELECTOR = '.ag-grid-pinned-top-rows [row-id]';
const PINNED_BOTTOM_SELECTOR = '.ag-grid-pinned-bottom-rows [row-id]';

// Regression: driving pinnedTopRowData / pinnedBottomRowData via React state used to grow the
// pinned section's height but never render the rows, because the row renderer mutated its
// topRowCtrls/bottomRowCtrls arrays in place and the React container skips re-rendering when the
// array reference is unchanged.
describe('React-driven pinned row data', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, PinnedRowModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    type Datum = { make: string };
    const columnDefs: ColDef[] = [{ field: 'make' }];
    const rowData: Datum[] = [{ make: 'Toyota' }, { make: 'Ford' }];

    let drivePinnedTop: React.Dispatch<React.SetStateAction<Datum[]>> | undefined;
    let drivePinnedBottom: React.Dispatch<React.SetStateAction<Datum[]>> | undefined;

    function Wrapper() {
        const [pinnedTop, setPinnedTop] = React.useState<Datum[]>([]);
        const [pinnedBottom, setPinnedBottom] = React.useState<Datum[]>([]);
        drivePinnedTop = setPinnedTop;
        drivePinnedBottom = setPinnedBottom;
        return (
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pinnedTopRowData={pinnedTop}
                    pinnedBottomRowData={pinnedBottom}
                />
            </div>
        );
    }

    test('adding pinned top rows via state renders them in the DOM', async () => {
        const rendered = render(<Wrapper />);
        await waitFor(() => expect(rendered.container.querySelectorAll('[row-id]').length).toBeGreaterThan(0));

        expect(rendered.container.querySelectorAll(PINNED_TOP_SELECTOR).length).toBe(0);

        act(() => drivePinnedTop!([{ make: 'Pinned A' }]));
        await waitFor(() => expect(rendered.container.querySelectorAll(PINNED_TOP_SELECTOR).length).toBe(1));
        expect(rendered.container.textContent).toContain('Pinned A');

        // Adding a second pinned row must also render (in-place mutation kept the same array reference).
        act(() => drivePinnedTop!([{ make: 'Pinned A' }, { make: 'Pinned B' }]));
        await waitFor(() => expect(rendered.container.querySelectorAll(PINNED_TOP_SELECTOR).length).toBe(2));
        expect(rendered.container.textContent).toContain('Pinned B');
    });

    test('adding pinned bottom rows via state renders them in the DOM', async () => {
        const rendered = render(<Wrapper />);
        await waitFor(() => expect(rendered.container.querySelectorAll('[row-id]').length).toBeGreaterThan(0));

        expect(rendered.container.querySelectorAll(PINNED_BOTTOM_SELECTOR).length).toBe(0);

        act(() => drivePinnedBottom!([{ make: 'Bottom A' }]));
        await waitFor(() => expect(rendered.container.querySelectorAll(PINNED_BOTTOM_SELECTOR).length).toBe(1));
        expect(rendered.container.textContent).toContain('Bottom A');

        act(() => drivePinnedBottom!([{ make: 'Bottom A' }, { make: 'Bottom B' }]));
        await waitFor(() => expect(rendered.container.querySelectorAll(PINNED_BOTTOM_SELECTOR).length).toBe(2));
        expect(rendered.container.textContent).toContain('Bottom B');
    });
});
