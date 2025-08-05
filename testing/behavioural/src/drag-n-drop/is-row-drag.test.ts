import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

function isDragHandleVisible(element: Element): boolean {
    return isAgHtmlElementVisible(element.querySelector('.ag-drag-handle'));
}

describe('isRowDrag and drag handle refresh', () => {
    let gridsManager: TestGridsManager;

    beforeEach(() => {
        gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowDragModule] });
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('isRowDrag is called on refresh and handle updates', async () => {
        let callCount = 0;
        let returnValue = true;
        const isRowDrag = () => {
            callCount++;
            return returnValue;
        };
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a', colId: 'a', rowDrag: isRowDrag }],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        const element = TestGridsManager.getHTMLElement(api)!;
        expect(callCount).toBe(2);
        expect(isDragHandleVisible(element)).toBe(true);

        callCount = 0;
        returnValue = false;
        api.applyTransaction({
            update: [
                { id: 'r1', a: 'X', b: 'x' },
                { id: 'r2', a: 'Y', b: 'y' },
            ],
        });

        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(false);

        callCount = 0;
        returnValue = true;
        api.setGridOption('rowData', [
            { id: 'r1', a: 'A', b: 'a' },
            { id: 'r2', a: 'B', b: 'b' },
        ]);

        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(true);
    });

    test('handle updates on suppressRowDrag property change', async () => {
        let callCount = 0;
        const isRowDrag = () => {
            callCount++;
            return true;
        };
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a', colId: 'a', rowDrag: isRowDrag }],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        const element = TestGridsManager.getHTMLElement(api)!;

        callCount = 0;
        api.setGridOption('suppressRowDrag', true);

        expect(callCount).toBe(0);
        expect(isDragHandleVisible(element)).toBe(false);

        api.setGridOption('suppressRowDrag', false);

        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(true);
    });

    test('handle updates on sortChanged event', async () => {
        let callCount = 0;
        const isRowDrag = () => {
            callCount++;
            return true;
        };
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a', colId: 'a', rowDrag: isRowDrag }],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
            rowDragManaged: true,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;
        callCount = 0;

        api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }], applyOrder: true });

        expect(callCount).toBe(0);
        expect(isDragHandleVisible(element)).toBe(false);

        api.applyColumnState({ state: [{ colId: 'a', sort: null }], applyOrder: true });

        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(true);
    });

    test('handle updates on filterChanged event', async () => {
        let callCount = 0;
        const isRowDrag = () => {
            callCount++;
            return true;
        };
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a', colId: 'a', rowDrag: isRowDrag, filter: true }],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
            rowDragManaged: true,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;

        callCount = 0;
        api.setFilterModel({ a: { filterType: 'text', type: 'contains', filter: 'A' } });
        expect(callCount).toBe(0);
        expect(isDragHandleVisible(element)).toBe(false);

        api.setFilterModel(null);
        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(true);
    });

    test('handle updates on newColumnsLoaded event', async () => {
        let callCount = 0;
        const isRowDrag = () => {
            callCount++;
            return true;
        };
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a', colId: 'a', rowDrag: isRowDrag }],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        const element = TestGridsManager.getHTMLElement(api)!;
        callCount = 0;
        api.setGridOption('columnDefs', [{ field: 'b', colId: 'b', rowDrag: isRowDrag }]);

        expect(callCount).toBeGreaterThan(0);
        expect(isDragHandleVisible(element)).toBe(true);
    });
});
