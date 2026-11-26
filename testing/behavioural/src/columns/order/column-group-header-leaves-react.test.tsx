import { cleanup, render, waitFor } from '@testing-library/react';
import { initPointerEventPolyfill } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnHoverModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('a kept column group header follows the leaves new column definitions give it (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
        initPointerEventPolyfill();
    });

    afterEach(() => {
        cleanup();
    });

    const rowData = [{ a: 1, c: 3, d: 4, e: 5 }];
    const columnDefs = (second: string): (ColDef | ColGroupDef)[] => [
        { field: 'a' },
        { groupId: 'g', children: [{ field: 'c' }, { field: second }] },
    ];
    const grid = (second: string) => (
        <React.StrictMode>
            <AgGridReact
                modules={[ClientSideRowModelModule, ColumnHoverModule]}
                suppressColumnVirtualisation
                columnHoverHighlight
                columnDefs={columnDefs(second)}
                rowData={rowData}
            />
        </React.StrictMode>
    );
    const hoveredByGroupHeader = () => {
        const header = document.querySelector('.ag-header-group-cell[col-id^="g_"]')!;
        header.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        const hovered = Array.from(document.querySelectorAll('.ag-cell.ag-column-hover'), (cell) =>
            cell.getAttribute('col-id')
        ).sort();
        header.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        return hovered;
    };

    // TODO: disabled due to AG-19353 - re-enable once fixed
    test.skip('hovering the header highlights the leaves of each columnDefs update', async () => {
        const view = render(grid('d'));
        await waitFor(() => expect(hoveredByGroupHeader()).toEqual(['c', 'd']));

        view.rerender(grid('e'));
        await waitFor(() => expect(document.querySelector('.ag-cell[col-id="e"]')).not.toBeNull());
        expect(hoveredByGroupHeader()).toEqual(['c', 'e']);

        view.rerender(grid('d'));
        await waitFor(() => expect(document.querySelector('.ag-cell[col-id="d"]')).not.toBeNull());
        expect(hoveredByGroupHeader()).toEqual(['c', 'd']);
    });
});
