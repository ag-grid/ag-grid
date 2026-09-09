import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout } from 'ag-test-utils';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

const scrollbarWidth = 15;
const initialRowCount = 11;
const rowData = Array.from({ length: initialRowCount + 1 }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

// enough rows that the vertical scrollbar is displayed whatever the scrollbar width resolves to
const overflowingRowData = Array.from({ length: initialRowCount * 4 }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

const expectScrollbarSizes = async (horizontal: string, vertical: string, phase: string): Promise<void> => {
    await waitFor(() => {
        expect(query<HTMLElement>('.ag-body-horizontal-scroll').style.height, phase).toBe(horizontal);
        expect(query<HTMLElement>('.ag-body-vertical-scroll').style.width, phase).toBe(vertical);
    });
};

describe('Scrollbar visibility', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        mockGridLayout.gridWidth = 655;
        // Eleven rows have half a scrollbar of spare height: they fit without the horizontal scrollbar and
        // overflow once it consumes layout space. The two header heights account for the mock viewport and
        // getBodyViewportHeight each removing the header section.
        mockGridLayout.gridHeight =
            mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * initialRowCount + scrollbarWidth / 2;
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.gridHeight = originalGridHeight;
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('removes mutually dependent scrollbars after overflowing row data is removed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', minWidth: 300 },
                { field: 'country', minWidth: 200 },
                { field: 'sport', minWidth: 150 },
            ],
            defaultColDef: {
                minWidth: 100,
                flex: 1,
            },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: [],
            scrollbarWidth,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const horizontalScrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
        Object.defineProperty(viewport, 'clientHeight', {
            configurable: true,
            get: () =>
                mockGridLayout.gridHeight -
                mockGridLayout.headerHeight -
                (Number.parseFloat(horizontalScrollbar.style.height) || 0),
        });

        api.setGridOption('rowData', rowData.slice(0, initialRowCount));
        await waitFor(() => expect(document.querySelectorAll('.ag-row')).toHaveLength(initialRowCount));
        await expectScrollbarSizes('0px', '0px', 'initial row data');

        api.setGridOption('rowData', rowData);
        await expectScrollbarSizes(`${scrollbarWidth}px`, `${scrollbarWidth}px`, 'overflowing row data');

        api.setGridOption('rowData', rowData.slice(0, initialRowCount));
        await expectScrollbarSizes('0px', '0px', 'restored row data');
    });

    // AG-18346: `scrollbarWidth: 0` is a documented grid option by which a user asserts their
    // platform's scrollbars take no space. Reserving the overlay scrollbar lane must be gated on the
    // platform actually drawing invisible scrollbars, never on the configured width being zero, or
    // this explicit override would silently lose 16px of content width.
    test('honours scrollbarWidth: 0 on a platform with real scrollbars', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }],
            defaultColDef: {
                minWidth: 100,
                flex: 1,
            },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: overflowingRowData,
            scrollbarWidth: 0,
            alwaysShowVerticalScroll: true,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        await waitFor(() => expect(document.querySelectorAll('.ag-row').length).toBeGreaterThan(0));
        // the vertical scrollbar is displayed (alwaysShowVerticalScroll), so the code path that
        // reserves the overlay lane is reached - and must still resolve to the user's zero width
        expect(query<HTMLElement>('.ag-body-vertical-scroll').classList.contains('ag-hidden')).toBe(false);
        await expectScrollbarSizes('0px', '0px', 'scrollbarWidth: 0');

        // happy-dom fires no ResizeObserver, so re-set the columns to force the flex pass to run again
        api.setGridOption('columnDefs', [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }]);
        await waitFor(() => expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(3));

        const contentWidth = api.getColumnState().reduce((total, { width }) => total + (width ?? 0), 0);
        expect(contentWidth).toBe(viewport.clientWidth);
    });
});
