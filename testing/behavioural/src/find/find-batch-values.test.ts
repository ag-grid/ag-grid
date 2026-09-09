import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridColumns, GridRows, TestGridsManager, waitForInput } from 'ag-test-utils';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, FindModule } from 'ag-grid-enterprise';

/**
 * Tests for find functionality using batch values (AG-16448).
 * The find service should automatically update results when batch pending values change,
 * by listening to cellEditingStopped events during batch editing.
 */
describe('Find with Batch Values', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TextEditorModule, BatchEditModule, FindModule],
    });

    beforeAll(() => setupAgTestIds());

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    test('find automatically updates when batch pending value is created via UI editing', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [
                { id: '0', a: 'apple' },
                { id: '1', a: 'banana' },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via UI editing setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `find automatically updates when batch pending value is created via UI editing setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"apple"
                └── LEAF id:1 a:"banana"
            `);

        // Set up find to search for 'orange' - initially 0 matches
        api.setGridOption('findSearchValue', 'orange');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);

        // Start batch edit
        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));

        // Edit the first cell via UI to change 'apple' to 'orange'
        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'orange{Enter}');

        // The data should still be 'apple' (not committed), and find should automatically update -
        // 'orange' should now be found WITHOUT manually clearing the search value. The find service
        // listens to cellEditingStopped and refreshes (debounced) when batch editing is active.
        await waitFor(() => {
            const rowNode = api.getDisplayedRowAtIndex(0)!;
            expect(rowNode.data.a).toBe('apple');
            // getCellValue with from: 'batch' should return the pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('orange');
            expect(api.findGetTotalMatches()).toBe(1);
        });

        // Now search for 'apple' - should no longer be found
        api.setGridOption('findSearchValue', 'apple');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue #2`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 a:⏳"orange" "apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);

        // Cancel the batch edit
        api.cancelBatchEdit();

        // After cancel, find should automatically reflect the original committed values (debounced refresh)
        await waitFor(() => expect(api.findGetTotalMatches()).toBe(1));

        api.setGridOption('findSearchValue', 'orange');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue #3`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via UI editing after setGridOption findSearchValue #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);
    });

    test('find automatically updates when batch pending value is created via setDataValue API', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [
                { id: '0', a: 'apple' },
                { id: '1', a: 'banana' },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via setDataValue  setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via setDataValue  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"apple"
            └── LEAF id:1 a:"banana"
        `);

        // Set up find to search for 'orange' - initially 0 matches
        api.setGridOption('findSearchValue', 'orange');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);

        // Start batch edit
        api.startBatchEdit();

        // Change value via setDataValue API (not UI editing)
        // Use 'paste' as eventSource to ensure it's treated as an API call during batch mode
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'orange', 'paste');

        // The data should still be 'apple' (not committed), and find should automatically update -
        // 'orange' should now be found WITHOUT manually clearing the search value (debounced refresh).
        await waitFor(() => {
            expect(rowNode.data.a).toBe('apple');
            // getCellValue with from: 'batch' should return the pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('orange');
            expect(api.findGetTotalMatches()).toBe(1);
        });

        // Now search for 'apple' - should no longer be found
        api.setGridOption('findSearchValue', 'apple');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue #2`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 a:⏳"orange" "apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);

        // Cancel the batch edit
        api.cancelBatchEdit();

        // After cancel, find should automatically reflect the original committed values (debounced refresh)
        await waitFor(() => expect(api.findGetTotalMatches()).toBe(1));

        api.setGridOption('findSearchValue', 'orange');
        await new GridColumns(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue #3`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch pending value is created via setDataValue  after setGridOption findSearchValue #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"apple"
            └── LEAF id:1 a:"banana"
        `);
        expect(api.findGetTotalMatches()).toBe(0);
    });

    test('find automatically updates when batch edit is committed', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `find automatically updates when batch edit is committed setup`).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `find automatically updates when batch edit is committed setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'changed{Enter}');

        // Wait for the debounced refresh to pick up the new batch pending value before reading it.
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a', from: 'batch' })).toBe(
                'changed'
            )
        );

        // During batch edit, find should use batch values - automatically updated
        api.setGridOption('findSearchValue', 'changed');
        await new GridColumns(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"changed" "initial"
        `);
        expect(api.findGetTotalMatches()).toBe(1);

        api.setGridOption('findSearchValue', 'initial');
        await new GridColumns(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #2`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #2`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"changed" "initial"
        `);
        expect(api.findGetTotalMatches()).toBe(0);

        // Commit the batch edit
        api.commitBatchEdit();

        // Wait for the debounced refresh to pick up the committed value before reading it.
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('changed'));

        // After commit, find should still find 'changed' (now the committed value)
        api.setGridOption('findSearchValue', 'changed');
        await new GridColumns(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #3`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #3`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"changed"
        `);
        expect(api.findGetTotalMatches()).toBe(1);

        api.setGridOption('findSearchValue', 'initial');
        await new GridColumns(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #4`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `find automatically updates when batch edit is committed after setGridOption findSearchValue #4`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"changed"
        `);
        expect(api.findGetTotalMatches()).toBe(0);
    });

    test('find uses batch values with value formatters', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellEditor: 'agTextCellEditor',
                    valueFormatter: (params) => `formatted:${params.value}`,
                },
            ],
            rowData: [{ id: '0', a: 'test' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `find uses batch values with value formatters setup`).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `find uses batch values with value formatters setup`).check(`
            ROOT id:ROOT_NODE_ID a:"formatted:undefined"
            └── LEAF id:0 a:"formatted:test"
        `);

        // Initially, find the formatted value
        api.setGridOption('findSearchValue', 'formatted:test');
        await new GridColumns(api, `find uses batch values with value formatters after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `find uses batch values with value formatters after setGridOption findSearchValue`)
            .check(`
                ROOT id:ROOT_NODE_ID a:"formatted:undefined"
                └── LEAF id:0 a:"formatted:test"
            `);
        expect(api.findGetTotalMatches()).toBe(1);

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'newvalue{Enter}');

        // Wait for the debounced refresh to pick up the new (unformatted) batch pending value.
        await waitFor(() =>
            expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'a', from: 'batch' })).toBe(
                'newvalue'
            )
        );

        // Find should use the formatted batch value - automatically updated
        api.setGridOption('findSearchValue', 'formatted:newvalue');
        await new GridColumns(
            api,
            `find uses batch values with value formatters after setGridOption findSearchValue #2`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `find uses batch values with value formatters after setGridOption findSearchValue #2`)
            .check(`
                ROOT id:ROOT_NODE_ID a:"formatted:undefined"
                └── LEAF ⏳ id:0 a:⏳"formatted:newvalue" "formatted:test"
            `);
        expect(api.findGetTotalMatches()).toBe(1);

        // The old formatted value should not be found
        api.setGridOption('findSearchValue', 'formatted:test');
        await new GridColumns(
            api,
            `find uses batch values with value formatters after setGridOption findSearchValue #3`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `find uses batch values with value formatters after setGridOption findSearchValue #3`)
            .check(`
                ROOT id:ROOT_NODE_ID a:"formatted:undefined"
                └── LEAF ⏳ id:0 a:⏳"formatted:newvalue" "formatted:test"
            `);
        expect(api.findGetTotalMatches()).toBe(0);

        api.cancelBatchEdit();
    });
});
