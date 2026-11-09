import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const ROW_HEIGHT = 50;
const SCROLL_TOP = 1000; // row 20 at the top of the viewport

const createRows = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, value: i }));

// React applies the row positions and the container classes through its own state, so the rows kept in view must
// still be moved with their animation prevented.
describe('maintainRowsInViewOnDataUpdate in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule]);
        mockGridLayout.init();
    });

    beforeEach(() => {
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
        mockGridLayout.resetOptions();
    });

    test('keeps rows in view without animating them when animateRows is enabled', async () => {
        let api: GridApi | undefined;
        const { container } = render(
            <AgGridReact
                columnDefs={[{ field: 'value' }]}
                rowData={createRows('r', 200)}
                getRowId={({ data }) => data.id}
                rowHeight={ROW_HEIGHT}
                animateRows
                maintainRowsInViewOnDataUpdate
                onGridReady={(event) => (api = event.api)}
            />
        );
        await waitFor(() => expect(api).toBeDefined());
        const viewport = container.querySelector<HTMLElement>('.ag-grid-viewport')!;
        await act(async () => {
            await nextAnimationFrame();
            viewport.scrollTop = SCROLL_TOP;
        });
        await waitFor(() => expect(container.querySelector('[row-id="r20"]')).not.toBeNull());

        act(() => {
            api!.applyTransaction({ add: createRows('new', 3), addIndex: 0 });
        });

        expect(viewport.scrollTop).toBe(SCROLL_TOP + 3 * ROW_HEIGHT);
        expect(container.querySelector<HTMLElement>('[row-id="r20"]')!.style.transform).toBe(
            `translateY(${SCROLL_TOP + 3 * ROW_HEIGHT}px)`
        );
        expect(container.querySelector('.ag-prevent-animation')).not.toBeNull();

        await act(async () => {
            await nextAnimationFrame();
            await nextAnimationFrame();
        });
        expect(container.querySelector('.ag-prevent-animation')).toBeNull();
    });
});
