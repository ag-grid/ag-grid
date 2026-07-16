import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { asyncSetTimeout } from '../../test-utils';
import { mockGridLayout } from '../../test-utils/polyfills/mockGridLayout';

const COL_COUNT = 20;
const columnDefs: ColDef[] = Array.from({ length: COL_COUNT }, (_, i) => ({
    colId: `c${i}`,
    field: `c${i}`,
    width: 150,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
}));
const rowData = [Object.fromEntries(columnDefs.map((c) => [c.field!, 1]))];

// col-ids of the rendered centre floating-filter cells, in DOM order.
function centerFloatingFilterColIds(container: HTMLElement): string[] {
    const row = container.querySelector('.ag-header-row-filter');
    const scrolling = row?.querySelector('.ag-grid-scrolling-cells');
    return Array.from(scrolling?.querySelectorAll('[col-id]') ?? []).map((el) => el.getAttribute('col-id')!);
}

const colIndex = (colId: string) => Number(colId.slice(1));

describe('React floating filter: horizontal scroll does not snap back to the focused column', () => {
    beforeAll(() => {
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
    });
    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });
    afterEach(() => cleanup());

    // A focused floating-filter cell is kept alive for keyboard nav, so virtualisation appends it last in
    // the ctrl array. After a horizontal scroll the React header must run its order-preserving reconcile:
    // if it feeds React the raw array instead, the focused cell's DOM node moves to the end, dropping focus
    // and triggering a scrollIntoView that snaps the viewport to column 1. Guard the centre cell order.
    it('keeps centre floating-filter cells in column order after scrolling the focused column out of view', async () => {
        const apiRef: { current?: GridApi } = {};
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </div>
        );

        await waitFor(() => expect(apiRef.current).toBeDefined());
        await waitFor(() => expect(centerFloatingFilterColIds(container).length).toBeGreaterThan(0));

        // Focus the first floating-filter input — registers the focused header and engages keep-alive.
        const firstInput = container.querySelector<HTMLInputElement>('.ag-header-row-filter [col-id="c0"] input');
        expect(firstInput).not.toBeNull();
        firstInput!.focus();
        await asyncSetTimeout(0);

        // Scroll horizontally until the focused column leaves the viewport. The first scroll also
        // measures the viewport (jsdom fires no initial resize), so virtualisation engages here.
        apiRef.current!.ensureColumnVisible(`c${COL_COUNT - 1}`);

        // Guard: wait until virtualisation has engaged (fewer than all columns rendered), otherwise the
        // scenario is not exercised. The focused c0 stays rendered (kept alive for keyboard nav); the
        // regression is purely about its DOM position, asserted below.
        await waitFor(() => expect(centerFloatingFilterColIds(container).length).toBeLessThan(COL_COUNT));

        const colIds = centerFloatingFilterColIds(container);
        const indices = colIds.map(colIndex);

        // The focused (now scrolled-out) cell must not be appended last.
        expect(indices.at(-1)).not.toBe(0);
        // Rendered centre cells stay in ascending column order (order-preserving reconcile ran).
        const ascending = [...indices].sort((a, b) => a - b);
        expect(indices).toEqual(ascending);
    });
});
