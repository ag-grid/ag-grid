import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

const ROW_DATA = [
    { country: 'UK', athlete: 'Alice' },
    { country: 'US', athlete: 'Frank' },
];

const getGridRole = (): string | null =>
    document.querySelector<HTMLElement>('[role="grid"], [role="treegrid"]')?.getAttribute('role') ?? null;

describe('grid container role reflects row grouping declared in the initial column defs', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    test('a grid grouped via colDef.rowGroup is a treegrid at first render', () => {
        gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            rowData: ROW_DATA,
        });

        expect(getGridRole()).toBe('treegrid');
    });

    test('an ungrouped grid stays a grid, and becomes a treegrid when grouping is applied via the API', () => {
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country' }, { field: 'athlete' }],
            rowData: ROW_DATA,
        });

        expect(getGridRole()).toBe('grid');

        api.setRowGroupColumns(['country']);
        expect(getGridRole()).toBe('treegrid');
    });
});
