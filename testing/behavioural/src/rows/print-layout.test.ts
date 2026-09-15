import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import { ClientSideRowModelModule } from 'ag-grid-community';

interface Row {
    id: string;
    a: string;
    b: string;
}

const ROW_DATA: Row[] = [
    { id: 'r1', a: 'a1', b: 'b1' },
    { id: 'r2', a: 'a2', b: 'b2' },
];

/**
 * Print layout flows every column through the centre lane and detaches the pinned lanes, so a cell
 * routed by what it is pinned to lands in a container that is not in the document.
 */
describe('print layout', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pinned columns render in the centre flow', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'l', field: 'a', pinned: 'left' },
                { colId: 'c', field: 'b' },
                { colId: 'r', field: 'a', pinned: 'right' },
            ],
            rowData: ROW_DATA,
            getRowId: (params) => params.data.id,
            domLayout: 'print',
        });
        await asyncSetTimeout(0);

        const root = TestGridsManager.getHTMLElement(api)!;
        const colIds = Array.from(root.querySelectorAll('.ag-row[row-index="0"] .ag-cell')).map((cell) =>
            cell.getAttribute('col-id')
        );

        expect(colIds).toEqual(['l', 'c', 'r']);
    });

    // Switching into print layout orphans the pinned ctrls: they are removed from the lanes but were
    // left alive and unreachable for the life of the row.
    test('switching to print layout leaves no cell rendered twice', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'l', field: 'a', pinned: 'left' },
                { colId: 'c', field: 'b' },
                { colId: 'r', field: 'a', pinned: 'right' },
            ],
            rowData: ROW_DATA,
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);

        api.setGridOption('domLayout', 'print');
        await asyncSetTimeout(0);

        const root = TestGridsManager.getHTMLElement(api)!;
        const colIds = Array.from(root.querySelectorAll('.ag-row[row-index="0"] .ag-cell')).map((cell) =>
            cell.getAttribute('col-id')
        );

        expect(colIds).toEqual(['l', 'c', 'r']);
    });
});
