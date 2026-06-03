import { ClientSideRowModelModule, RowDragModule, TextFilterModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    isAgHtmlElementVisible,
    setRowDataChecked,
} from '../test-utils';

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
        gridsManager = new TestGridsManager({
            modules: [TextFilterModule, ClientSideRowModelModule, RowDragModule, PivotModule],
        });
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
        await new GridColumns(api, `isRowDrag is called on refresh and handle updates setup`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `isRowDrag is called on refresh and handle updates setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
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
        await new GridRows(api, `isRowDrag is called on refresh and handle updates final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
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
        await new GridColumns(api, `handle updates on suppressRowDrag property change setup`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on suppressRowDrag property change setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
        const element = TestGridsManager.getHTMLElement(api)!;

        callCount = 0;
        api.setGridOption('suppressRowDrag', true);
        await new GridColumns(
            api,
            `handle updates on suppressRowDrag property change after setGridOption suppressRowDrag`
        ).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on suppressRowDrag property change after setGridOption suppressRowDrag`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 a:"A"
                └── LEAF id:r2 a:"B"
            `);

        expect(callCount).toBe(0);
        expectHandleState(element, FullyHiddenState);

        api.setGridOption('suppressRowDrag', false);
        await new GridColumns(
            api,
            `handle updates on suppressRowDrag property change after setGridOption suppressRowDrag #2`
        ).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(
            api,
            `handle updates on suppressRowDrag property change after setGridOption suppressRowDrag #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);

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
        await new GridColumns(api, `handle updates on sortChanged event setup`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on sortChanged event setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;
        callCount = 0;

        api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }], applyOrder: true });
        await new GridColumns(api, `handle updates on sortChanged event after applyColumnState`).checkColumns(`
            CENTER
            └── a "A" width:200 sort:desc
        `);
        await new GridRows(api, `handle updates on sortChanged event after applyColumnState`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r2 a:"B"
            └── LEAF id:r1 a:"A"
        `);

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleDisabledState);

        api.applyColumnState({ state: [{ colId: 'a', sort: null }], applyOrder: true });
        await new GridColumns(api, `handle updates on sortChanged event after applyColumnState #2`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on sortChanged event after applyColumnState #2`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);

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
        await new GridColumns(api, `handle updates on filterChanged event setup`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on filterChanged event setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;

        callCount = 0;
        api.setFilterModel({ a: { filterType: 'text', type: 'contains', filter: 'A' } });
        await new GridRows(api, `handle updates on filterChanged event after setFilterModel`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:"A"
        `);
        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleDisabledState);

        api.setFilterModel(null);
        await new GridRows(api, `handle updates on filterChanged event after setFilterModel #2`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
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
        await new GridColumns(api, `handle updates on newColumnsLoaded event setup`).checkColumns(`
            CENTER
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on newColumnsLoaded event setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A"
            └── LEAF id:r2 a:"B"
        `);
        const element = TestGridsManager.getHTMLElement(api)!;
        callCount = 0;
        api.setGridOption('columnDefs', [{ field: 'b', colId: 'b', rowDrag: isRowDrag }]);
        await new GridColumns(api, `handle updates on newColumnsLoaded event after setGridOption columnDefs`)
            .checkColumns(`
                CENTER
                └── b "B" width:200
            `);
        await new GridRows(api, `handle updates on newColumnsLoaded event after setGridOption columnDefs`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 b:"a"
            └── LEAF id:r2 b:"b"
        `);

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
        await new GridColumns(api, `handle updates on pivot events setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);
        await new GridRows(api, `handle updates on pivot events setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"A" b:"a"
            └── LEAF id:r2 a:"B" b:"b"
        `);
        expect(callCount).toBeGreaterThan(0);
        const element = TestGridsManager.getHTMLElement(api)!;
        expectHandleState(element, VisibleEnabledState);

        callCount = 0;
        api.setGridOption('pivotMode', true);
        await new GridColumns(api, `handle updates on pivot events after setGridOption pivotMode`).checkColumns(``);
        await new GridRows(api, `handle updates on pivot events after setGridOption pivotMode`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.applyColumnState({ state: [{ colId: 'b', pivot: true }], applyOrder: true });
        await new GridColumns(api, `handle updates on pivot events after applyColumnState`).checkColumns(`
            CENTER
            ├─┬ "a" GROUP
            │ └── pivot_b_a_ "-" width:200
            └─┬ "b" GROUP
              └── pivot_b_b_ "-" width:200
        `);
        await new GridRows(api, `handle updates on pivot events after applyColumnState`).check(`
            ROOT id:ROOT_NODE_ID
        `);

        expect(callCount).toBe(0);
        expectHandleState(element, FullyHiddenState);

        api.applyColumnState({ state: [{ colId: 'b', pivot: false }], applyOrder: true });
        await new GridColumns(api, `handle updates on pivot events after applyColumnState #2`).checkColumns(``);
        await new GridRows(api, `handle updates on pivot events after applyColumnState #2`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        api.setGridOption('pivotMode', false);
        await new GridColumns(api, `handle updates on pivot events after setGridOption pivotMode #2`).checkColumns(`
            CENTER
            ├── b "B" width:200
            └── a "A" width:200
        `);
        await new GridRows(api, `handle updates on pivot events after setGridOption pivotMode #2`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 b:"a" a:"A"
            └── LEAF id:r2 b:"b" a:"B"
        `);

        expect(callCount).toBeGreaterThan(0);
        expectHandleState(element, VisibleEnabledState);
    });
});
