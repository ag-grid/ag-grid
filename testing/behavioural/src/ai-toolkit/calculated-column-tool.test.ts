import { ClientSideRowModelModule } from 'ag-grid-community';
import { AiToolkitModule, CalculatedColumnsModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

const COLUMN_DEFS = [{ field: 'gold' }, { field: 'silver' }];
const ROW_DATA = [
    { gold: 3, silver: 1 },
    { gold: 1, silver: 4 },
];

describe('AI toolkit add_calculated_column tool', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AiToolkitModule, CalculatedColumnsModule],
    });

    afterEach(() => gridsManager.reset());

    test('is offered only when calculated columns are enabled', () => {
        const enabled = gridsManager.createGrid('enabledGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
        });
        expect(enabled.getTools().map((tool) => tool.name)).toContain('add_calculated_column');

        const disabled = gridsManager.createGrid('disabledGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
        });
        expect(disabled.getTools().map((tool) => tool.name)).not.toContain('add_calculated_column');
    });

    test('creates a calculated column that computes values', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
        });

        const result = api.applyToolCall('add_calculated_column', {
            colId: 'total',
            headerName: 'Total',
            calculatedExpression: '[gold] + [silver]',
            cellDataType: 'number',
        });

        expect(result.ok).toBe(true);
        await asyncSetTimeout(1);

        expect(api.getColumn('total')).toBeTruthy();
        const node = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: node, colKey: 'total', useFormatter: false })).toBe(4);
    });

    test('rejects duplicate ids, invalid expressions, and missing fields', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
        });

        const duplicate = api.applyToolCall('add_calculated_column', {
            colId: 'gold',
            headerName: 'Clash',
            calculatedExpression: '[silver]',
        });
        expect(duplicate.ok).toBe(false);
        expect(duplicate.error).toContain('gold');

        const invalid = api.applyToolCall('add_calculated_column', {
            colId: 'bad',
            headerName: 'Bad',
            calculatedExpression: '[gold] +',
        });
        expect(invalid.ok).toBe(false);

        const missing = api.applyToolCall('add_calculated_column', {
            colId: 'x',
            headerName: '',
            calculatedExpression: '',
        });
        expect(missing.ok).toBe(false);
    });

    test('config-before-state ordering lets a batch sort on a newly created column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
            defaultColDef: { sortable: true },
        });

        // update_sort is listed first, but it references a column add_calculated_column makes;
        // the config tool must run first for the sort to stick.
        const results = api.applyToolCalls([
            { name: 'update_sort', args: { sortModel: [{ colId: 'total', sort: 'desc', type: 'default' }] } },
            {
                name: 'add_calculated_column',
                args: {
                    colId: 'total',
                    headerName: 'Total',
                    calculatedExpression: '[gold] + [silver]',
                    cellDataType: 'number',
                },
            },
        ]);

        expect(results.map((result) => result.ok)).toEqual([true, true]);
        await asyncSetTimeout(1);

        expect(api.getColumn('total')).toBeTruthy();
        expect(api.getState().sort?.sortModel[0]).toMatchObject({ colId: 'total', sort: 'desc' });
    });
});
