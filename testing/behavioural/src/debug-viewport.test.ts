import { describe, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager } from './test-utils';

describe('Debug page navigation', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    test('page down debug', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a', colId: 'a' }],
            rowData: [{ a: 'a0' }, { a: 'a1' }, { a: 'a2' }, { a: 'a3' }],
        });

        // try getDisplayedRowAtIndex to get rowTop
        for (let i = 0; i <= 3; i++) {
            const row = api.getDisplayedRowAtIndex(i);
            console.log(`Row ${i}: rowTop=${(row as any)?.rowTop}, rowHeight=${(row as any)?.rowHeight}`);
        }

        gridsManager.reset();
    });
});
