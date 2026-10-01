import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    a: string;
    b: string;
}

const COLUMN_DEFS: ColDef<Row>[] = [
    { colId: 'l', field: 'a', pinned: 'left' },
    { colId: 'c', field: 'b' },
    { colId: 'r', field: 'a', pinned: 'right' },
];

// React buckets a row's cells into lanes itself, so it needs its own cover for print layout: the
// pinned lanes are not rendered there and a cell assigned to one would never appear.
describe('print layout in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test('pinned columns render in the centre flow', async () => {
        const rendered = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact<Row> rowData={[{ a: 'a1', b: 'b1' }]} columnDefs={COLUMN_DEFS} domLayout="print" />
            </div>
        );

        await waitFor(() => {
            const cells = rendered.container.querySelectorAll('[row-index="0"] [role="gridcell"]');
            expect(Array.from(cells).map((cell) => cell.getAttribute('col-id'))).toEqual(['l', 'c', 'r']);
        });
    });
});
