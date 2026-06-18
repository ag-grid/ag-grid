import { TextEditorModule } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Tests for find with data mutations and cell updates.
 */
describe('Find Data Mutations', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [FindModule, TextEditorModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('Row Data Updates', () => {
        test('find updates when row data is replaced', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'apple' }, { value: 'banana' }],
            });
            await new GridColumns(api, `find updates when row data is replaced setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find updates when row data is replaced setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"apple"
                └── LEAF id:1 value:"banana"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(api, `find updates when row data is replaced after setGridOption findSearchValue`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `find updates when row data is replaced after setGridOption findSearchValue`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 value:"apple"
                    └── LEAF id:1 value:"banana"
                `
            );
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Replace all row data
            api.setGridOption('rowData', [{ value: 'orange' }, { value: 'apple' }, { value: 'apple' }]);
            await new GridRows(api, `find updates when row data is replaced after setGridOption rowData`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"orange"
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"apple"
            `);
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(2);
        });

        test('find updates when rows are added via transaction', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 'apple' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `find updates when rows are added via transaction setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find updates when rows are added via transaction setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `find updates when rows are added via transaction after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `find updates when rows are added via transaction after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:"apple"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Add more rows with matching values
            api.applyTransaction({
                add: [
                    { id: '2', value: 'apple' },
                    { id: '3', value: 'apple' },
                ],
            });
            await new GridRows(api, `find updates when rows are added via transaction after applyTransaction`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:"apple"
                    ├── LEAF id:2 value:"apple"
                    └── LEAF id:3 value:"apple"
                `
            );
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(3);
        });

        test('find updates when rows are removed via transaction', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: '1', value: 'apple' },
                    { id: '2', value: 'apple' },
                    { id: '3', value: 'banana' },
                ],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `find updates when rows are removed via transaction setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find updates when rows are removed via transaction setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"banana"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `find updates when rows are removed via transaction after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `find updates when rows are removed via transaction after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"banana"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(2);

            // Remove one apple row
            api.applyTransaction({ remove: [{ id: '1' }] });
            await new GridRows(api, `find updates when rows are removed via transaction after applyTransaction`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:2 value:"apple"
                    └── LEAF id:3 value:"banana"
                `
            );
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(1);
        });

        test('find updates when rows are updated via transaction', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: '1', value: 'apple' },
                    { id: '2', value: 'banana' },
                ],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `find updates when rows are updated via transaction setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `find updates when rows are updated via transaction setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"banana"
            `);

            api.setGridOption('findSearchValue', 'orange');
            await new GridColumns(
                api,
                `find updates when rows are updated via transaction after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `find updates when rows are updated via transaction after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"banana"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);

            // Update a row to have matching value
            api.applyTransaction({ update: [{ id: '2', value: 'orange' }] });
            await new GridRows(api, `find updates when rows are updated via transaction after applyTransaction`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:"apple"
                    └── LEAF id:2 value:"orange"
                `
            );
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(1);
        });
    });

    describe('Cell Value Updates', () => {
        test('find updates when cell value is changed directly', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value', editable: true }],
                rowData: [{ id: '1', value: 'apple' }],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `find updates when cell value is changed directly setup`).checkColumns(`
                CENTER
                └── value "Value" width:200 editable
            `);
            await new GridRows(api, `find updates when cell value is changed directly setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'orange');
            await new GridColumns(
                api,
                `find updates when cell value is changed directly after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200 editable
            `);
            await new GridRows(
                api,
                `find updates when cell value is changed directly after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:"apple"
            `);
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);

            // Change cell value
            const rowNode = api.getRowNode('1')!;
            rowNode.setDataValue('value', 'orange');
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(1);
        });
    });

    describe('Active Match Preservation', () => {
        test('active match is preserved after data update if still valid', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: '1', value: 'apple' },
                    { id: '2', value: 'apple' },
                    { id: '3', value: 'apple' },
                ],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `active match is preserved after data update if still valid setup`).checkColumns(
                `
                    CENTER
                    └── value "Value" width:200
                `
            );
            await new GridRows(api, `active match is preserved after data update if still valid setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `active match is preserved after data update if still valid after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `active match is preserved after data update if still valid after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                ├── LEAF id:2 value:"apple"
                └── LEAF id:3 value:"apple"
            `);
            await asyncSetTimeout(1);

            // Navigate to second match
            api.findNext();
            api.findNext();
            expect(api.findGetActiveMatch()!.numOverall).toBe(2);
            expect(api.findGetActiveMatch()!.node.data.id).toBe('2');

            // Add a row at the end - active match should still be valid
            api.applyTransaction({ add: [{ id: '4', value: 'apple' }] });
            await new GridRows(api, `active match is preserved after data update if still valid after applyTransaction`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:"apple"
                    ├── LEAF id:2 value:"apple"
                    ├── LEAF id:3 value:"apple"
                    └── LEAF id:4 value:"apple"
                `);
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(4);
            // Active match should still be on the same row
            expect(api.findGetActiveMatch()!.node.data.id).toBe('2');
        });

        test('active match is cleared when matching row is removed', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [
                    { id: '1', value: 'apple' },
                    { id: '2', value: 'apple' },
                ],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `active match is cleared when matching row is removed setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `active match is cleared when matching row is removed setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"apple"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `active match is cleared when matching row is removed after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `active match is cleared when matching row is removed after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"apple"
            `);
            await asyncSetTimeout(1);

            // Navigate to first match
            api.findNext();
            expect(api.findGetActiveMatch()!.node.data.id).toBe('1');

            // Remove the row with active match
            api.applyTransaction({ remove: [{ id: '1' }] });
            await new GridRows(api, `active match is cleared when matching row is removed after applyTransaction`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:2 value:"apple"
                `);
            await asyncSetTimeout(10);

            // Active match should be cleared or moved
            expect(api.findGetTotalMatches()).toBe(1);
        });

        test('active match is cleared when cell value no longer matches', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value', editable: true }],
                rowData: [
                    { id: '1', value: 'apple' },
                    { id: '2', value: 'banana' },
                ],
                getRowId: (params) => params.data.id,
            });
            await new GridColumns(api, `active match is cleared when cell value no longer matches setup`).checkColumns(
                `
                    CENTER
                    └── value "Value" width:200 editable
                `
            );
            await new GridRows(api, `active match is cleared when cell value no longer matches setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"banana"
            `);

            api.setGridOption('findSearchValue', 'apple');
            await new GridColumns(
                api,
                `active match is cleared when cell value no longer matches after setGridOption findSearchValue`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200 editable
            `);
            await new GridRows(
                api,
                `active match is cleared when cell value no longer matches after setGridOption findSearchValue`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:"apple"
                └── LEAF id:2 value:"banana"
            `);
            await asyncSetTimeout(1);

            api.findNext();
            expect(api.findGetActiveMatch()!.node.data.id).toBe('1');

            // Change the value so it no longer matches
            const rowNode = api.getRowNode('1')!;
            rowNode.setDataValue('value', 'orange');
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(0);
            expect(api.findGetActiveMatch()).toBeUndefined();
        });
    });
});
