import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout } from 'ag-test-utils';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

const scrollbarWidth = 15;
const rowCount = 11;
const rowData = Array.from({ length: rowCount }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

const columnDefs = (sportMinWidth: number) => [
    { field: 'athlete', minWidth: 300 },
    { field: 'country', minWidth: 200 },
    { field: 'sport', minWidth: sportMinWidth },
];

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

describe('Overlay scrollbar visibility', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;
    let originalUseRealOffsetDimensions: boolean;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        originalUseRealOffsetDimensions = mockGridLayout.useRealOffsetDimensions;
        mockGridLayout.gridWidth = 655;
        mockGridLayout.gridHeight =
            mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * rowCount + scrollbarWidth / 2;
        mockGridLayout.nativeScrollbarWidth = 0;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.gridHeight = originalGridHeight;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
        mockGridLayout.useRealOffsetDimensions = originalUseRealOffsetDimensions;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('does not let a horizontal overlay scrollbar consume viewport layout height', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columnDefs(150),
            defaultColDef: {
                minWidth: 100,
                flex: 1,
            },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData,
            scrollbarWidth,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const horizontalScrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
        const verticalScrollbar = query<HTMLElement>('.ag-body-vertical-scroll');

        await waitFor(() => {
            expect(horizontalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(horizontalScrollbar.classList.contains('ag-invisible')).toBe(true);
            expect(verticalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(verticalScrollbar.classList.contains('ag-hidden')).toBe(true);
        });
        const viewportHeightWithoutHorizontalScroll = viewport.clientHeight;

        api.setGridOption('columnDefs', columnDefs(160));

        await waitFor(() => {
            expect(horizontalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(horizontalScrollbar.classList.contains('ag-invisible')).toBe(false);
            expect(horizontalScrollbar.style.height).toBe(`${scrollbarWidth}px`);
            expect(verticalScrollbar.classList.contains('ag-hidden')).toBe(true);
        });
        expect(viewport.clientHeight).toBe(viewportHeightWithoutHorizontalScroll);
    });
});
