import { NumberEditorModule, TextEditorModule, setupAgTestIds } from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, clipboardUtils } from '../test-utils';

describe('showValuesAs copies the transformed value to the clipboard', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClipboardModule,
            CellSelectionModule,
            RowGroupingModule,
            ShowValuesAsModule,
            TextEditorModule,
            NumberEditorModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    test('copy puts the transformed percentage shown in the cell on the clipboard', async () => {
        const api = await gridMgr.createGridAndWait('sva-clipboard', {
            cellSelection: true,
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await new GridColumns(api, 'clipboard percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'clipboard percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        expect(
            api.getCellValue({
                rowNode: api.getRowNode('1')!,
                colKey: 'amount',
                useFormatter: true,
                transformValues: true,
            })
        ).toBe('25.00%');

        api.setFocusedCell(0, 'amount');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['amount'] });
        api.copyToClipboard();
        await asyncSetTimeout(1);
        expect(clipboardUtils.getText()).toBe('25.00%');
    });

    test('editing a showValuesAs cell operates on the raw value; the cell re-renders transformed', async () => {
        const api = await gridMgr.createGridAndWait('sva-edit', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', editable: true, showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ],
        });

        await new GridColumns(api, 'edit before').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal editable
        `);
        await new GridRows(api, 'edit before').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        const node1 = api.getRowNode('1')!;
        // The cell shows the transformed percentage, but the edit path sees the RAW value.
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', useFormatter: true, transformValues: true })).toBe(
            '25.00%'
        );
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(25);

        // Editing commits the raw value (grand total becomes 200)…
        node1.setDataValue('amount', 125);
        api.redrawRows(); // the edit updates aggregation but doesn't repaint node 2; redraw to read the new shares
        await new GridColumns(api, 'edit after — re-rendered transformed').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal editable
        `);
        await new GridRows(api, 'edit after — re-rendered transformed').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"62.50%"
            └── LEAF id:2 country:"B" amount:"37.50%"
        `);
        expect(node1.getDataValue('amount', 'value')).toBe(125);
        // …and the displayed transformed value re-renders to the new share (125 / 200).
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', transformValues: true })).toBeCloseTo(0.625);
    });
});
