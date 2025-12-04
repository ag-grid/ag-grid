import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

import { TestGridsManager, applyTransactionChecked, isAgHtmlElementVisible, setRowDataChecked } from '../test-utils';

type DragHandleState = {
    displayed: boolean;
    visible: boolean;
    disabled: boolean;
};

const VisibleEnabledState: DragHandleState = { displayed: true, visible: true, disabled: false };
const VisibleDisabledState: DragHandleState = { displayed: true, visible: true, disabled: true };
const DisplayedHiddenState: DragHandleState = { displayed: true, visible: false, disabled: true };
const FullyHiddenState: DragHandleState = { displayed: false, visible: false, disabled: true };

function getDragHandle(element: Element): HTMLElement | null {
    return element.querySelector('.ag-drag-handle');
}

function getDragHandleState(element: Element): DragHandleState {
    const handle = getDragHandle(element);
    if (!handle) {
        return FullyHiddenState;
    }

    const classList = handle.classList;
    const displayed = !classList.contains('ag-hidden');
    const visible = displayed && !classList.contains('ag-invisible') && isAgHtmlElementVisible(handle);
    const disabled = classList.contains('ag-drag-handle-disabled');
    return { displayed, visible, disabled };
}

function expectHandleState(element: Element, expected: DragHandleState): void {
    expect(getDragHandleState(element)).toEqual(expected);
}

describe('isRowDrag and drag handle refresh', () => {
    let gridsManager: TestGridsManager;

    beforeEach(() => {
        gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowDragModule, PivotModule] });
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
        expect(callCount).toBeGreaterThanOrEqual(2);
        expectHandleState(element, VisibleEnabledState);

        callCount = 0;
        returnValue = false;
        applyTransactionChecked(api, {
            update: [
                { id: 'r1', a: 'X', b: 'x' },
                { id: 'r2', a: 'Y', b: 'y' },
            ],
        });

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, DisplayedHiddenState);

        callCount = 0;
        returnValue = true;
        setRowDataChecked(api, [
            { id: 'r1', a: 'A', b: 'a' },
            { id: 'r2', a: 'B', b: 'b' },
        ]);

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
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
        expectHandleState(element, FullyHiddenState);

        api.setGridOption('suppressRowDrag', false);

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
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

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleDisabledState);

        api.applyColumnState({ state: [{ colId: 'a', sort: null }], applyOrder: true });

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
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
        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleDisabledState);

        api.setFilterModel(null);
        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
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
        expectHandleState(element, VisibleEnabledState);
    });

    test('handle updates on pivot events', async () => {
        let callCount = 0;
        const isRowDrag = () => {
            callCount++;
            return true;
        };
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'a', colId: 'a', rowDrag: isRowDrag, enablePivot: true },
                { field: 'b', colId: 'b', enablePivot: true },
            ],
            rowData: [
                { id: 'r1', a: 'A', b: 'a' },
                { id: 'r2', a: 'B', b: 'b' },
            ],
            getRowId: (params) => params.data.id,
            rowDragManaged: true,
            refreshAfterGroupEdit: true,
        };
        const api = gridsManager.createGrid('testGrid', gridOptions);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;
        expectHandleState(element, VisibleEnabledState);

        callCount = 0;
        api.setGridOption('pivotMode', true);
        api.applyColumnState({ state: [{ colId: 'b', pivot: true }], applyOrder: true });

        expect(callCount).toBe(0);
        expectHandleState(element, FullyHiddenState);

        api.applyColumnState({ state: [{ colId: 'b', pivot: false }], applyOrder: true });
        api.setGridOption('pivotMode', false);

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
    });
});
