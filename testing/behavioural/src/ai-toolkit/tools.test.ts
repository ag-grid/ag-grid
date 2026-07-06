import { ClientSideRowModelModule } from 'ag-grid-community';
import { AiToolkitModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name' }, { field: 'age' }, { field: 'country' }];
const ROW_DATA = [
    { name: 'Bob', age: 30, country: 'US' },
    { name: 'Al', age: 20, country: 'UK' },
    { name: 'Cy', age: 25, country: 'US' },
];

describe('AI toolkit tools', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    describe('getTools', () => {
        test('returns state tools in the function-calling shape', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: true, enableRowGroup: true },
            });

            const tools = api.getTools();
            const names = tools.map((tool) => tool.name);
            expect(names).toContain('update_sort');
            expect(names).toContain('update_row_group');
            expect(names).toContain('update_column_visibility');

            const sortTool = tools.find((tool) => tool.name === 'update_sort')!;
            expect(typeof sortTool.description).toBe('string');
            const parameters = sortTool.parameters as any;
            expect(parameters.type).toBe('object');
            expect(parameters.properties.sortModel).toBeDefined();
        });

        test('exclude and include narrow the tool set', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: true, enableRowGroup: true },
            });

            const excluded = api.getTools({ exclude: ['update_sort'] }).map((tool) => tool.name);
            expect(excluded).not.toContain('update_sort');

            const included = api.getTools({ include: ['update_sort'] }).map((tool) => tool.name);
            expect(included).toEqual(['update_sort']);
        });

        test('omits a tool whose feature is unavailable', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: false },
            });

            expect(api.getTools().map((tool) => tool.name)).not.toContain('update_sort');
        });
    });

    describe('applyToolCall', () => {
        test('applies a sort and reorders the rows', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: true },
            });

            const result = api.applyToolCall('update_sort', {
                sortModel: [{ colId: 'age', sort: 'asc', type: 'default' }],
            });

            expect(result.ok).toBe(true);
            expect(api.getState().sort?.sortModel[0]).toMatchObject({ colId: 'age', sort: 'asc' });
            expect(api.getDisplayedRowAtIndex(0)!.data.name).toBe('Al');
            expect(api.getDisplayedRowAtIndex(2)!.data.name).toBe('Bob');
        });

        test('a partial update leaves other active state untouched', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: true, enableRowGroup: true },
            });

            expect(api.applyToolCall('update_row_group', { groupColIds: ['country'] }).ok).toBe(true);
            expect(
                api.applyToolCall('update_sort', { sortModel: [{ colId: 'age', sort: 'desc', type: 'default' }] }).ok
            ).toBe(true);

            const state = api.getState();
            expect(state.rowGroup?.groupColIds).toEqual(['country']);
            expect(state.sort?.sortModel[0]).toMatchObject({ colId: 'age', sort: 'desc' });
        });

        test('an unknown tool returns an error result', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
            });

            const result = api.applyToolCall('does_not_exist', {});
            expect(result.ok).toBe(false);
            expect(result.error).toContain('does_not_exist');
        });
    });

    describe('applyToolCalls', () => {
        test('applies a batch and returns a result per call in input order', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowData: ROW_DATA,
                defaultColDef: { sortable: true, enableRowGroup: true },
            });

            const results = api.applyToolCalls([
                { name: 'update_sort', args: { sortModel: [{ colId: 'age', sort: 'asc', type: 'default' }] } },
                { name: 'update_row_group', args: { groupColIds: ['country'] } },
            ]);

            expect(results.map((result) => result.ok)).toEqual([true, true]);

            const state = api.getState();
            expect(state.sort?.sortModel[0]).toMatchObject({ colId: 'age', sort: 'asc' });
            expect(state.rowGroup?.groupColIds).toEqual(['country']);
        });
    });
});
