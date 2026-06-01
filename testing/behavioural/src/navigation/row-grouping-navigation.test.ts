import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GROUP_AUTO_COLUMN_ID, KeyCode, RenderApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    category: string;
    value: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'category', rowGroup: true, hide: true },
    { field: 'value', colId: 'value' },
];

// Expanded layout (groupDefaultExpanded: -1):
//   row 0: group A
//   row 1: leaf { category:'A', value:'v1' }
//   row 2: leaf { category:'A', value:'v2' }
//   row 3: group B
//   row 4: leaf { category:'B', value:'v3' }
const rowData: RowData[] = [
    { category: 'A', value: 'v1' },
    { category: 'A', value: 'v2' },
    { category: 'B', value: 'v3' },
];

describe('Row Grouping Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RenderApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // The groupCellRendererCtrl keydown listener is attached to eGridCell directly,
    // and cell renderer instances are created as p2 animation-frame tasks on first render.
    // We flush frames before dispatching so the listener is attached, then flush again
    // so the csrmExpansionService destroy-task debounce completes and row counts update.
    function dispatchEnterOnGroupCell(api: GridApi, rowIndex: number): void {
        api.flushAllAnimationFrames();
        const row = document.querySelector(`[row-index="${rowIndex}"]`);
        const cell = row?.querySelector(`[col-id="${GROUP_AUTO_COLUMN_ID}"]`) as HTMLElement | null;
        cell?.dispatchEvent(new KeyboardEvent('keydown', { key: KeyCode.ENTER, bubbles: true, cancelable: true }));
        api.flushAllAnimationFrames();
    }

    function createExpandedGrid(): GridApi<RowData> {
        return gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: -1,
        } as GridOptions<RowData>);
    }

    function createCollapsedGrid(): GridApi<RowData> {
        return gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: 0,
        } as GridOptions<RowData>);
    }

    test('down arrow from group row moves into first child', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('up arrow from first child moves back to group row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(1, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('down arrow from last child of one group moves to next group row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(2, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('up arrow from second group row moves to last child of first group', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(3, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('down arrow with collapsed group skips over hidden children', () => {
        // Collapsed layout: row 0 = group A, row 1 = group B
        const api = createCollapsedGrid();
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('up arrow with collapsed group skips over hidden children', () => {
        // Collapsed layout: row 0 = group A, row 1 = group B
        const api = createCollapsedGrid();
        api.setFocusedCell(1, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });

    test('Enter on collapsed group row expands it', () => {
        const api = createCollapsedGrid();
        expect(api.getDisplayedRowCount()).toBe(2);
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchEnterOnGroupCell(api, 0);
        // Group A expanded: group A + 2 children + group B = 4 rows
        expect(api.getDisplayedRowCount()).toBe(4);
        expect(api.getDisplayedRowAtIndex(0)?.expanded).toBe(true);
    });

    test('Enter on expanded group row collapses it', () => {
        const api = createExpandedGrid();
        expect(api.getDisplayedRowCount()).toBe(5);
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchEnterOnGroupCell(api, 0);
        // Group A collapsed: group A + group B + 1 child of B = 3 rows
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.getDisplayedRowAtIndex(0)?.expanded).toBe(false);
    });

    test('suppressEnterExpand prevents Enter from toggling group expansion', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            groupDefaultExpanded: 0,
            autoGroupColumnDef: { cellRendererParams: { suppressEnterExpand: true } },
        } as GridOptions<RowData>);
        await new GridColumns(api, `suppressEnterExpand prevents Enter from toggling group expansion setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `suppressEnterExpand prevents Enter from toggling group expansion setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF hidden id:0 category:"A" value:"v1"
            │ └── LEAF hidden id:1 category:"A" value:"v2"
            └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B"
            · └── LEAF hidden id:2 category:"B" value:"v3"
        `);

        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchEnterOnGroupCell(api, 0);
        expect(api.getDisplayedRowAtIndex(0)?.expanded).toBe(false);
        await new GridRows(api, `suppressEnterExpand prevents Enter from toggling group expansion final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-category-A ag-Grid-AutoColumn:"A"
                │ ├── LEAF hidden id:0 category:"A" value:"v1"
                │ └── LEAF hidden id:1 category:"A" value:"v2"
                └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B"
                · └── LEAF hidden id:2 category:"B" value:"v3"
            `
        );
    });

    test('ctrl+down moves to last displayed row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
        expect(getFocusedRowIndex(api)).toBe(4);
    });

    test('ctrl+up moves to first displayed row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(4, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Tab from group row auto-column moves to next column on same row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(0, GROUP_AUTO_COLUMN_ID);
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('value');
    });

    test('Tab from last column of group row wraps to auto-column of next row', () => {
        const api = createExpandedGrid();
        api.setFocusedCell(0, 'value');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe(GROUP_AUTO_COLUMN_ID);
    });
});
