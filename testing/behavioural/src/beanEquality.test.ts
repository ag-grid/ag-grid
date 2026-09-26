import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, ColumnApiModule, RowApiModule } from 'ag-grid-community';

// Pins the bean equality tester `ag-test-utils` installs: without it, a bean inside a `toMatchObject`
// expectation walks the whole grid graph and the first test runs for minutes.
describe('grid objects in expectations', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule, RowApiModule] });

    afterEach(() => gridsManager.reset());

    test('match by identity against each other, and by shape against a plain object', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
        });
        const colA = api.getColumn('a')!;
        const rowNode = api.getDisplayedRowAtIndex(0)!;

        expect({ column: colA, rowNode }).toMatchObject({ column: colA, rowNode });

        expect(colA).toMatchObject({ colId: 'a' });
        expect(rowNode).toMatchObject({ rowIndex: 0, data: { a: 1, b: 2 } });
        expect(colA).not.toMatchObject({ colId: 'b' });
        expect(colA).not.toMatchObject(api.getColumn('b')!);
    });
});
