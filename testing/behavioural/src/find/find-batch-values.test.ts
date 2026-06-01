import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

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
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

        // Edit the first cell via UI to change 'apple' to 'orange'
        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'orange{Enter}');
        await asyncSetTimeout(10); // Wait for debounced refresh

        // The data should still be 'apple' (not committed)
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        expect(rowNode.data.a).toBe('apple');

        // But getCellValue with from: 'batch' should return the pending value
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('orange');

        // Find should automatically update - 'orange' should now be found
        // WITHOUT manually clearing the search value
        // The find service should listen to cellEditingStopped and refresh when batch editing is active
        expect(api.findGetTotalMatches()).toBe(1);

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
        await asyncSetTimeout(1);
        expect(api.findGetTotalMatches()).toBe(0);

        // Cancel the batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(10); // Wait for refresh after cancel

        // After cancel, find should automatically reflect the original committed values
        expect(api.findGetTotalMatches()).toBe(1);

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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);

        // Change value via setDataValue API (not UI editing)
        // Use 'paste' as eventSource to ensure it's treated as an API call during batch mode
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'orange', 'paste');
        await asyncSetTimeout(10); // Wait for debounced refresh

        // The data should still be 'apple' (not committed)
        expect(rowNode.data.a).toBe('apple');

        // But getCellValue with from: 'batch' should return the pending value
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('orange');

        // Find should automatically update - 'orange' should now be found
        // WITHOUT manually clearing the search value
        expect(api.findGetTotalMatches()).toBe(1);

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
        await asyncSetTimeout(1);
        expect(api.findGetTotalMatches()).toBe(0);

        // Cancel the batch edit
        api.cancelBatchEdit();
        await asyncSetTimeout(10); // Wait for refresh after cancel

        // After cancel, find should automatically reflect the original committed values
        expect(api.findGetTotalMatches()).toBe(1);

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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'changed{Enter}');
        await asyncSetTimeout(10); // Wait for debounced refresh

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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);
        expect(api.findGetTotalMatches()).toBe(0);

        // Commit the batch edit
        api.commitBatchEdit();
        await asyncSetTimeout(10); // Wait for refresh after commit

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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'newvalue{Enter}');
        await asyncSetTimeout(10); // Wait for debounced refresh

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
        await asyncSetTimeout(1);
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
        await asyncSetTimeout(1);
        expect(api.findGetTotalMatches()).toBe(0);

        api.cancelBatchEdit();
    });
});
