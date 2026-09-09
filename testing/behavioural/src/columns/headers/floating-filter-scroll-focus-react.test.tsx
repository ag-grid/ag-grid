import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const COL_COUNT = 20;

function makeColumnDefs(pinned: boolean): ColDef[] {
    return Array.from({ length: COL_COUNT }, (_, i) => ({
        colId: `c${i}`,
        field: `c${i}`,
        width: 150,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        pinned: pinned && i === 0 ? 'left' : pinned && i === COL_COUNT - 1 ? 'right' : null,
    }));
}

// col indices of the rendered floating-filter cells within a header section, in DOM order.
function floatingFilterColIndices(container: HTMLElement, sectionClass: string): number[] {
    const row = container.querySelector('.ag-header-row-filter');
    const section = row?.querySelector(`.${sectionClass}`);
    return Array.from(section?.querySelectorAll('[col-id]') ?? []).map((el) =>
        Number(el.getAttribute('col-id')!.slice(1))
    );
}

interface ScrollOptions {
    ensureDomOrder: boolean;
    pinned: boolean;
}

// Drives the regression scenario: render, focus the first centre floating-filter input (engages
// keep-alive; pinned columns never virtualise out, so only centre cells can hit that path), then scroll
// the focused column out of view so virtualisation retains its kept-alive ctrl. Resolves once
// virtualisation has engaged, returning the rendered floating-filter col indices per header section.
async function scrollFocusedColumnOutOfView({ ensureDomOrder, pinned }: ScrollOptions) {
    const columnDefs = makeColumnDefs(pinned);
    const rowData = [Object.fromEntries(columnDefs.map((c) => [c.field!, 1]))];
    const apiRef: { current?: GridApi } = {};
    const { container } = render(
        <div style={{ height: 400, width: 600 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                ensureDomOrder={ensureDomOrder}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        </div>
    );

    const centerIndices = () => floatingFilterColIndices(container, 'ag-grid-scrolling-cells');

    await waitFor(() => expect(apiRef.current).toBeDefined());
    await waitFor(() => expect(centerIndices().length).toBeGreaterThan(0));

    // Focus the first centre floating-filter input — registers the focused header and engages keep-alive.
    const focusedColId = pinned ? 'c1' : 'c0';
    const focusedIndex = pinned ? 1 : 0;
    const input = container.querySelector<HTMLInputElement>(
        `.ag-header-row-filter .ag-grid-scrolling-cells [col-id="${focusedColId}"] input`
    );
    expect(input).not.toBeNull();
    await act(async () => {
        input!.focus();
        await asyncSetTimeout(0);
    });

    // Scroll horizontally until the focused column leaves the viewport. The first scroll also
    // measures the viewport (happy-dom fires no initial resize), so virtualisation engages here.
    const lastCenterCol = pinned ? `c${COL_COUNT - 2}` : `c${COL_COUNT - 1}`;
    await act(async () => {
        apiRef.current!.ensureColumnVisible(lastCenterCol);
        await asyncSetTimeout(0);
    });

    // Guard: wait until virtualisation has engaged (fewer than all centre columns rendered), otherwise
    // the scenario is not exercised. The focused cell stays rendered (kept alive for keyboard nav).
    const centerColCount = pinned ? COL_COUNT - 2 : COL_COUNT;
    await waitFor(() => expect(centerIndices().length).toBeLessThan(centerColCount));

    return {
        focusedIndex,
        left: floatingFilterColIndices(container, 'ag-grid-pinned-left-cells'),
        center: centerIndices(),
        right: floatingFilterColIndices(container, 'ag-grid-pinned-right-cells'),
    };
}

describe('React floating filter: horizontal scroll does not snap back to the focused column', () => {
    beforeAll(() => {
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
    });
    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
    });
    afterEach(() => cleanup());

    // A focused floating-filter cell is kept alive for keyboard nav, so virtualisation retains its ctrl
    // after it scrolls out of view. The header ctrl must keep the ctrl array in column order: if the
    // kept-alive ctrl is appended last, React moves the focused cell's DOM node to the end, dropping focus
    // and triggering a scrollIntoView that snaps the viewport to column 1. Guard the centre cell order.
    it.each([false, true])(
        'keeps centre floating-filter cells in column order after scrolling the focused column out of view (ensureDomOrder: %s)',
        async (ensureDomOrder) => {
            const { focusedIndex, center } = await scrollFocusedColumnOutOfView({ ensureDomOrder, pinned: false });

            // The focused (now scrolled-out) cell must not be appended last.
            expect(center.at(-1)).not.toBe(focusedIndex);
            // Rendered centre cells stay in ascending column order.
            expect(center).toEqual([...center].sort((a, b) => a - b));
        }
    );

    // With pinned columns, all sections share one ctrl array with per-section left values; the restore of
    // column order must not interleave sections or displace the pinned cells.
    it.each([false, true])(
        'keeps pinned sections intact and centre cells in column order (ensureDomOrder: %s)',
        async (ensureDomOrder) => {
            const { focusedIndex, left, center, right } = await scrollFocusedColumnOutOfView({
                ensureDomOrder,
                pinned: true,
            });

            expect(left).toEqual([0]);
            expect(right).toEqual([COL_COUNT - 1]);
            expect(center.at(-1)).not.toBe(focusedIndex);
            expect(center).toEqual([...center].sort((a, b) => a - b));
            // Centre section contains only centre columns.
            expect(center).not.toContain(0);
            expect(center).not.toContain(COL_COUNT - 1);
        }
    );
});
