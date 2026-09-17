import { GridColumns, GridRows, TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GROUP_AUTO_COLUMN_ID, RowDragModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

describe('ag-grid row highlight', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('row highlight', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { id: '2', country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { id: '3', country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { id: '4', country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { id: '5', country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country' }, { field: 'year' }, { field: 'athlete' }],
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `row highlight setup`).checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── year "Year" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, `row highlight setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            ├── LEAF id:2 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            ├── LEAF id:3 country:"Ireland" year:"2001" athlete:"Alan Turing"
            ├── LEAF id:4 country:"Italy" year:"2000" athlete:"Donald Knuth"
            └── LEAF id:5 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);
        const element = TestGridsManager.getHTMLElement(api)!;

        const getRowHighlight = () => {
            const { row, dropIndicatorPosition } = api.getRowDropPositionIndicator();
            return { id: row?.id, position: dropIndicatorPosition };
        };

        const node1 = api.getRowNode('1')!;
        const node2 = api.getRowNode('2')!;
        const node3 = api.getRowNode('3')!;

        // Initial state
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // Null or undefined params

        api.setRowDropPositionIndicator(null);
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setRowDropPositionIndicator(undefined);
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // clear

        for (const row of [null, undefined]) {
            for (const position of ['none', 'above', 'below'] as const) {
                api.setRowDropPositionIndicator({ row, dropIndicatorPosition: position });
                expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
                expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });
            }
        }

        // set

        api.setRowDropPositionIndicator({ row: node1, dropIndicatorPosition: 'above' });
        expect(getRowHighlight()).toEqual({ id: '1', position: 'above' });
        expect(getElementHighlight(element)).toEqual({ id: '1', position: 'above' });

        api.setRowDropPositionIndicator({ row: node1, dropIndicatorPosition: 'below' });
        expect(getRowHighlight()).toEqual({ id: '1', position: 'below' });
        expect(getElementHighlight(element)).toEqual({ id: '1', position: 'below' });

        api.setRowDropPositionIndicator({ row: node2, dropIndicatorPosition: 'below' });
        expect(getRowHighlight()).toEqual({ id: '2', position: 'below' });
        expect(getElementHighlight(element)).toEqual({ id: '2', position: 'below' });

        api.setRowDropPositionIndicator({ row: node3, dropIndicatorPosition: 'above' });
        expect(getRowHighlight()).toEqual({ id: '3', position: 'above' });
        expect(getElementHighlight(element)).toEqual({ id: '3', position: 'above' });

        // remove the highlighted node

        api.setGridOption(
            'rowData',
            rowData.filter((data) => data.id !== '3')
        );
        await new GridRows(api, `row highlight after setGridOption rowData`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            ├── LEAF id:2 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            ├── LEAF id:4 country:"Italy" year:"2000" athlete:"Donald Knuth"
            └── LEAF id:5 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);

        expect(node3.rowIndex).toBeNull();
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setRowDropPositionIndicator({ row: node3, dropIndicatorPosition: 'below' });
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // set and clear

        for (const position of ['none', 'above', 'below'] as const) {
            api.setRowDropPositionIndicator({ row: node1, dropIndicatorPosition: 'below' });
            api.setRowDropPositionIndicator({ row: null, dropIndicatorPosition: position });
            expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
            expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });
        }
    });
});

function getElementHighlight(element: HTMLElement) {
    const above = element.querySelector('.ag-row-highlight-above');
    const below = element.querySelector('.ag-row-highlight-below');
    expect(!!(above && below)).toBe(false); // There cannot be both above and below highlights at the same time
    return {
        id: (above || below)?.getAttribute('row-id'),
        position: above ? 'above' : below ? 'below' : 'none',
    };
}

describe('ag-grid row highlight indent is suppressed in the centre section when the group column is pinned', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        {
            id: 'root',
            name: 'Root',
            children: [
                { id: 'a', name: 'A', children: [{ id: 'a1', name: 'A1' }] },
                { id: 'b', name: 'B' },
            ],
        },
    ];

    const createGrid = (
        id: string,
        autoGroupColumnDef: GridOptions['autoGroupColumnDef'],
        gridOptions?: Partial<GridOptions>
    ) =>
        gridsManager.createGrid(id, {
            columnDefs: [{ field: 'type' }],
            autoGroupColumnDef: { headerName: 'Name', field: 'name', rowDrag: true, ...autoGroupColumnDef },
            treeData: true,
            treeDataChildrenField: 'children',
            rowDragManaged: true,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: ({ data }) => data.id,
            ...gridOptions,
        });

    const getIndentState = (api: GridApi, rowId: string) => {
        const rowElement = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            `.ag-row[row-id="${rowId}"]`
        )!;
        expect(rowElement).toBeTruthy();
        const indentActive = rowElement.classList.contains('ag-row-highlight-indent');
        const suppressed = rowElement.classList.contains('ag-row-highlight-indent-pinned');
        // The suppression class only ever qualifies an active indent.
        expect(suppressed && !indentActive).toBe(false);
        return {
            centreIndented: indentActive && !suppressed,
            level: rowElement.style.getPropertyValue('--ag-row-highlight-level') || '0',
        };
    };

    test('auto group column unpinned — the centre section keeps its level indent', () => {
        const api = createGrid('unpinned', {});

        api.setRowDropPositionIndicator({ row: api.getRowNode('a')!, dropIndicatorPosition: 'below' });
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: true, level: '1' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a1')!, dropIndicatorPosition: 'above' });
        expect(getIndentState(api, 'a1')).toEqual({ centreIndented: true, level: '2' });
    });

    test('auto group column pinned left — the centre section is not indented at any level (AG-18372 TC1)', () => {
        const api = createGrid('pinnedLeft', { pinned: 'left' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a')!, dropIndicatorPosition: 'below' });
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: false, level: '1' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a1')!, dropIndicatorPosition: 'above' });
        expect(getIndentState(api, 'a1')).toEqual({ centreIndented: false, level: '2' });
    });

    test('auto group column pinned right — the centre section is not indented at any level (AG-18372 TC2)', () => {
        const api = createGrid('pinnedRight', { pinned: 'right' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a')!, dropIndicatorPosition: 'below' });
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: false, level: '1' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a1')!, dropIndicatorPosition: 'above' });
        expect(getIndentState(api, 'a1')).toEqual({ centreIndented: false, level: '2' });
    });

    test('print layout keeps the centre indent although the group column reports a pinned side', () => {
        const api = createGrid('printLayout', { pinned: 'left' }, { domLayout: 'print' });

        api.setRowDropPositionIndicator({ row: api.getRowNode('a')!, dropIndicatorPosition: 'below' });
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: true, level: '1' });
    });

    test('pinning and unpinning the auto group column while the indicator is shown re-evaluates the indent', () => {
        const api = createGrid('repin', {});

        api.setRowDropPositionIndicator({ row: api.getRowNode('a')!, dropIndicatorPosition: 'below' });
        expect(getIndentState(api, 'a').centreIndented).toBe(true);

        api.setColumnsPinned([GROUP_AUTO_COLUMN_ID], 'left');
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: false, level: '1' });

        api.setColumnsPinned([GROUP_AUTO_COLUMN_ID], null);
        expect(getIndentState(api, 'a')).toEqual({ centreIndented: true, level: '1' });
    });
});
