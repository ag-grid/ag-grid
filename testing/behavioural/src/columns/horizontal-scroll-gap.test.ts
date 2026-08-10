import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

const rowData = [{ a: 'a', b: 'b' }];

const hasNoGapClass = (): boolean => {
    const root = document.querySelector<HTMLElement>('.ag-root');
    expect(root, 'Expected .ag-root to be rendered').not.toBeNull();
    return root!.classList.contains('ag-body-horizontal-content-no-gap');
};

describe('Horizontal scroll gap with a vertical scrollbar showing', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('reports a gap when the columns fit with less than a scrollbar width to spare', async () => {
        // 580px of columns in a 585px usable viewport (600px minus the 15px vertical scrollbar): the
        // 5px gap at the grid edge must be detected even though it is narrower than the scrollbar.
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', pinned: 'left', width: 100 },
                { field: 'b', width: 480 },
            ],
            rowData,
            alwaysShowVerticalScroll: true,
            scrollbarWidth: 15,
        });

        await asyncSetTimeout(0);

        expect(hasNoGapClass()).toBe(false);
    });

    test('reports no gap when the columns reach the usable viewport edge', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', pinned: 'left', width: 100 },
                { field: 'b', width: 500 },
            ],
            rowData,
            alwaysShowVerticalScroll: true,
            scrollbarWidth: 15,
        });

        await asyncSetTimeout(0);

        expect(hasNoGapClass()).toBe(true);
    });
});
