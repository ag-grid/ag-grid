import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { TransposeModule } from 'ag-grid-enterprise';

interface Company {
    id: string;
    name: string;
    region: string;
    sector: string;
    revenue: number;
    profit: number;
}

const ROW_DATA: Company[] = [
    { id: 'a', name: 'Northwind', region: 'EMEA', sector: 'Retail', revenue: 400, profit: 40 },
    { id: 'b', name: 'Contoso', region: 'APAC', sector: 'Tech', revenue: 250, profit: 25 },
];

const COLUMN_DEFS: (ColDef<Company> | ColGroupDef<Company>)[] = [
    { field: 'name' },
    { headerName: 'Details', groupId: 'details', children: [{ field: 'region' }, { field: 'sector' }] },
    { field: 'revenue' },
    { field: 'profit' },
];

const fieldRows = (api: GridApi<Company>) =>
    Array.from({ length: api.getDisplayedRowCount() }, (_, i) =>
        api.getDisplayedRowAtIndex(i)!.id!.replace(/^ag-Grid-TransposeField(Group)?-/, (_m, g) => (g ? 'group:' : ''))
    );

describe('transpose column order', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, TransposeModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const create = (id: string) =>
        gridsManager.createGrid(id, {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            getRowId: (params) => params.data.id,
            transposeHeaderColId: 'name',
        });

    const displayed = (api: GridApi<Company>) => api.getAllDisplayedColumns().map((col) => col.getColId());
    const stateOrder = (api: GridApi<Company>) => api.getColumnState().map((state) => state.colId);

    test('moved column, then transpose on', () => {
        const api = create('moved');
        api.moveColumns(['profit'], 1);
        expect(displayed(api)).toEqual(['name', 'profit', 'region', 'sector', 'revenue']);
        api.setGridOption('transpose', true);
        expect(fieldRows(api)).toEqual(['profit', 'group:details', 'region', 'sector', 'revenue']);
        expect(stateOrder(api)).toEqual(['name', 'profit', 'region', 'sector', 'revenue']);
    });

    test('a move made before transposing survives toggling off', () => {
        const api = create('toggle-off');
        api.moveColumns(['profit'], 1);
        api.setGridOption('transpose', true);
        api.setGridOption('transpose', false);
        expect(displayed(api)).toEqual(['name', 'profit', 'region', 'sector', 'revenue']);
    });

    test('order set through column state, then transpose on', () => {
        const api = create('state');
        api.applyColumnState({
            state: [
                { colId: 'name' },
                { colId: 'revenue' },
                { colId: 'sector' },
                { colId: 'region' },
                { colId: 'profit' },
            ],
            applyOrder: true,
        });
        api.setGridOption('transpose', true);
        expect(fieldRows(api)).toEqual(['revenue', 'group:details', 'sector', 'region', 'profit']);
    });

    test('hidden column, then transpose on', () => {
        const api = create('hidden');
        api.setColumnsVisible(['sector'], false);
        api.setGridOption('transpose', true);
        expect(fieldRows(api)).toEqual(['group:details', 'region', 'revenue', 'profit']);
    });

    test('moved while transposed via the API', async () => {
        const api = create('moved-transposed');
        api.setGridOption('transpose', true);
        const recordCols = displayed(api);
        const moved: string[] = [];
        api.addEventListener('columnMoved', (event) => moved.push(event.column!.getColId()));
        api.moveColumns(['profit'], 1);
        await waitFor(() => expect(moved).toEqual(['profit']));
        expect(fieldRows(api)).toEqual(['profit', 'group:details', 'region', 'sector', 'revenue']);
        expect(displayed(api)).toEqual(recordCols);
        expect(stateOrder(api)).toEqual(['name', 'profit', 'region', 'sector', 'revenue']);
        api.setGridOption('transpose', false);
        expect(displayed(api)).toEqual(['name', 'profit', 'region', 'sector', 'revenue']);
    });

    test('order set through column state while transposed', () => {
        const api = create('state-transposed');
        api.moveColumns(['profit'], 1);
        api.setGridOption('transpose', true);
        api.applyColumnState({ state: [{ colId: 'revenue' }, { colId: 'name' }], applyOrder: true });
        expect(fieldRows(api)).toEqual(['revenue', 'profit', 'group:details', 'region', 'sector']);
        api.setGridOption('transpose', false);
        expect(displayed(api)).toEqual(['revenue', 'name', 'profit', 'region', 'sector']);
    });

    test('column moved out of its group keeps its field row in the group', () => {
        const api = create('split');
        api.moveColumns(['sector'], 4);
        expect(displayed(api)).toEqual(['name', 'region', 'revenue', 'profit', 'sector']);
        api.setGridOption('transpose', true);
        expect(fieldRows(api)).toEqual(['group:details', 'region', 'sector', 'revenue', 'profit']);
    });

    test('the order survives toggling transpose off and on', () => {
        const api = create('lifecycle');
        api.setGridOption('transpose', true);
        api.moveColumns(['revenue'], 0);
        api.setGridOption('transpose', false);
        api.setGridOption('transpose', true);
        expect(fieldRows(api)).toEqual(['revenue', 'group:details', 'region', 'sector', 'profit']);
    });
});
