import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';

const COLUMN_COUNT = 400;
const COLUMN_WIDTH = 100;

const columnDefs = Array.from({ length: COLUMN_COUNT }, (_, i) => ({ field: `c${i}`, width: COLUMN_WIDTH }));

describe('Column virtualisation in a container the browser has not laid out', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        // A real layout engine reporting a real zero width, as opposed to jsdom reporting nothing.
        mockGridLayout.gridWidth = 0;
        mockGridLayout.simulateRealLayoutEngine = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.simulateRealLayoutEngine = false;
    });

    afterEach(() => {
        mockGridLayout.gridWidth = 0;
        gridsManager.reset();
    });

    test('builds only the columns intersecting the viewport plus the buffer', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });

        await asyncSetTimeout(0);

        expect(api.getColumns()!.length).toBe(COLUMN_COUNT);

        // 100px columns against a zero-wide viewport and the 200px buffer: only c0, c1 and c2 intersect.
        const headerCells = document.querySelectorAll('.ag-header-cell').length;
        expect(headerCells).toBe(3);
        expect(api.getAllDisplayedVirtualColumns().length).toBe(3);
    });
});
