import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    NumberEditorModule,
    PinnedRowModule,
    RowApiModule,
    TextEditorModule,
} from 'ag-grid-community';
import { RowGroupingModule, TransposeModule } from 'ag-grid-enterprise';

interface Company {
    id: string;
    name: string;
    region: string;
    revenue: number;
    profit: number;
}

const makeRowData = (): Company[] => [
    { id: 'a', name: 'Northwind', region: 'EMEA', revenue: 400, profit: 40 },
    { id: 'b', name: 'Contoso', region: 'APAC', revenue: 250, profit: 25 },
    { id: 'c', name: 'Fabrikam', region: 'AMER', revenue: 900, profit: 90 },
];

const TOTAL = 'ag-Grid-TransposeTotal';
const fieldRow = (colId: string) => `ag-Grid-TransposeField-${colId}`;

describe('transpose totals column', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            NumberEditorModule,
            PinnedRowModule,
            RowApiModule,
            RowGroupingModule,
            TextEditorModule,
            TransposeModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    const create = async (extra: GridOptions<Company> = {}) => {
        const api: GridApi<Company> = await gridsManager.createGridAndWait('totals', {
            columnDefs: [
                { field: 'name' },
                { field: 'region' },
                { field: 'revenue', aggFunc: 'sum', editable: true },
                { field: 'profit', aggFunc: 'avg' },
            ],
            rowData: makeRowData(),
            getRowId: (params) => params.data.id,
            transpose: true,
            transposeHeaderColId: 'name',
            suppressColumnVirtualisation: true,
            ...extra,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const cell = (colId: string, recordColId: string) =>
            gridDiv.querySelector<HTMLElement>(`[row-id="${fieldRow(colId)}"] [col-id="${recordColId}"]`);
        const colIds = () => api.getAllDisplayedColumns().map((col) => col.getColId());
        return { api, gridDiv, cell, colIds };
    };

    test('no grand total row means no totals column', async () => {
        const { colIds } = await create();
        expect(colIds()).not.toContain(TOTAL);
    });

    test("bottom: the totals column comes last and shows the grand total row's aggregates", async () => {
        const { api, cell, colIds, gridDiv } = await create({ grandTotalRow: 'bottom' });
        expect(colIds().at(-1)).toBe(TOTAL);
        expect(api.getColumn(TOTAL)!.getPinned()).toBeNull();
        await waitFor(() => expect(cell('revenue', TOTAL)?.textContent).toBe('1550'));
        expect(cell('profit', TOTAL)?.textContent).toBe('51.666666666666664');
        expect(cell('region', TOTAL)?.textContent).toBe('');
        expect(gridDiv.querySelector(`.ag-header-cell[col-id="${TOTAL}"]`)?.textContent).toContain('Total');
        expect(gridDiv.querySelector(`.ag-header-cell[col-id="${TOTAL}"] .ag-transpose-record-checkbox`)).toBeNull();
    });

    test('top: the totals column comes first, after the field names', async () => {
        const { colIds } = await create({ grandTotalRow: 'top' });
        expect(colIds()[1]).toBe(TOTAL);
    });

    test('pinned: the totals column is pinned at the same end, and no pinned row is shown', async () => {
        const { api, colIds, gridDiv } = await create({ grandTotalRow: 'pinnedBottom' });
        expect(api.getColumn(TOTAL)!.getPinned()).toBe('right');
        expect(colIds().at(-1)).toBe(TOTAL);
        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(gridDiv.querySelectorAll('.ag-floating-bottom .ag-row').length).toBe(0);
        api.setGridOption('grandTotalRow', 'pinnedTop');
        await waitFor(() => expect(api.getColumn(TOTAL)!.getPinned()).toBe('left'));
        expect(api.getPinnedTopRowCount()).toBe(0);
    });

    test('the total follows edits to a record', async () => {
        const { api, cell } = await create({ grandTotalRow: 'bottom' });
        api.getRowNode('b')!.setDataValue('revenue', 350);
        await waitFor(() => expect(cell('revenue', TOTAL)?.textContent).toBe('1650'));
    });

    test('the total follows a transaction', async () => {
        const { api, cell } = await create({ grandTotalRow: 'bottom' });
        await waitFor(() => expect(cell('revenue', TOTAL)?.textContent).toBe('1550'));
        api.applyTransaction({ update: [{ ...makeRowData()[1], revenue: 350 }] });
        await waitFor(() => expect(cell('revenue', TOTAL)?.textContent).toBe('1650'));
    });

    test('a totals cell is not editable', async () => {
        const { api } = await create({ grandTotalRow: 'bottom' });
        let rowIndex = -1;
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            if (api.getDisplayedRowAtIndex(i)?.id === fieldRow('revenue')) {
                rowIndex = i;
            }
        }
        expect(rowIndex).toBeGreaterThanOrEqual(0);
        api.startEditingCell({ rowIndex, colKey: TOTAL });
        expect(api.getCellEditorInstances()).toHaveLength(0);
    });

    test('turning the grand total row off removes the totals column', async () => {
        const { api, colIds } = await create({ grandTotalRow: 'bottom' });
        api.setGridOption('grandTotalRow', undefined);
        await waitFor(() => expect(colIds()).not.toContain(TOTAL));
    });

    test('turning transpose off shows the grand total row again', async () => {
        const { api } = await create({ grandTotalRow: 'pinnedBottom' });
        api.setGridOption('transpose', false);
        await waitFor(() => expect(api.getPinnedBottomRowCount()).toBe(1));
    });

    test('turning transpose on unpins the grand total row and adds the totals column', async () => {
        const { api, colIds } = await create({ grandTotalRow: 'pinnedBottom', transpose: false });
        await waitFor(() => expect(api.getPinnedBottomRowCount()).toBe(1));
        api.setGridOption('transpose', true);
        await waitFor(() => expect(api.getPinnedBottomRowCount()).toBe(0));
        expect(colIds().at(-1)).toBe(TOTAL);
    });
});
