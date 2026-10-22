import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';

import type { GridApi, GridOptions, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ROW_NUMBERS_COLUMN_ID, getGridElement } from 'ag-grid-community';
import { RowNumbersModule } from 'ag-grid-enterprise';

class RowNumberRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('span');

    public init(params: ICellRendererParams): void {
        this.eGui.textContent = `#${params.value}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }
}

describe('Row numbers row resizer', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, RowNumbersModule] });

    const createGrid = async (gridOptions: GridOptions): Promise<GridApi> => {
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'sport' }],
            rowData: [{ sport: 'tennis' }, { sport: 'golf' }],
            ...gridOptions,
        });
        await waitForEvent('firstDataRendered', api);
        await asyncSetTimeout(0);
        return api;
    };

    const rowNumberCell = (api: GridApi) =>
        getGridElement(api)!.querySelector<HTMLElement>(`.ag-row[row-index="0"] [col-id="${ROW_NUMBERS_COLUMN_ID}"]`)!;

    afterEach(() => {
        gridMgr.reset();
    });

    test('a custom row number renderer keeps the row resizer', async () => {
        const api = await createGrid({
            rowNumbers: { enableRowResizer: true, cellRenderer: RowNumberRenderer },
        });

        expect(rowNumberCell(api).textContent).toBe('#1');
        expect(rowNumberCell(api).querySelector('.ag-row-numbers-resizer')).not.toBeNull();
    });
});
