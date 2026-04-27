import { TextEditorModule } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Replace all row data
            api.setGridOption('rowData', [{ value: 'orange' }, { value: 'apple' }, { value: 'apple' }]);
            await asyncSetTimeout(10);

            expect(api.findGetTotalMatches()).toBe(2);
        });

        test('find updates when rows are added via transaction', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 'apple' }],
                getRowId: (params) => params.data.id,
            });

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(1);

            // Add more rows with matching values
            api.applyTransaction({
                add: [
                    { id: '2', value: 'apple' },
                    { id: '3', value: 'apple' },
                ],
            });
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

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(2);

            // Remove one apple row
            api.applyTransaction({ remove: [{ id: '1' }] });
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

            api.setGridOption('findSearchValue', 'orange');
            await asyncSetTimeout(1);
            expect(api.findGetTotalMatches()).toBe(0);

            // Update a row to have matching value
            api.applyTransaction({ update: [{ id: '2', value: 'orange' }] });
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

            api.setGridOption('findSearchValue', 'orange');
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

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);

            // Navigate to second match
            api.findNext();
            api.findNext();
            expect(api.findGetActiveMatch()!.numOverall).toBe(2);
            expect(api.findGetActiveMatch()!.node.data.id).toBe('2');

            // Add a row at the end - active match should still be valid
            api.applyTransaction({ add: [{ id: '4', value: 'apple' }] });
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

            api.setGridOption('findSearchValue', 'apple');
            await asyncSetTimeout(1);

            // Navigate to first match
            api.findNext();
            expect(api.findGetActiveMatch()!.node.data.id).toBe('1');

            // Remove the row with active match
            api.applyTransaction({ remove: [{ id: '1' }] });
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

            api.setGridOption('findSearchValue', 'apple');
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
