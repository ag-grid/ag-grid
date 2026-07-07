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

    test('a retry after a sibling failure re-applies the created column as a no-op', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
        });

        const scoreArgs = {
            colId: 'score',
            headerName: 'Score',
            calculatedExpression: '[gold] + [silver]',
            cellDataType: 'number',
        };

        // Turn 1: one column applies, a sibling with a bad expression fails.
        expect(api.applyToolCall('add_calculated_column', scoreArgs).ok).toBe(true);
        expect(
            api.applyToolCall('add_calculated_column', {
                colId: 'ratio',
                headerName: 'Ratio',
                calculatedExpression: '[gold] /',
                cellDataType: 'number',
            }).ok
        ).toBe(false);

        // Turn 2 (retry): the model re-emits the whole plan. The already-created column must be a
        // no-op success rather than a collision, and the fixed sibling now applies.
        expect(api.applyToolCall('add_calculated_column', scoreArgs).ok).toBe(true);
        expect(
            api.applyToolCall('add_calculated_column', {
                colId: 'ratio',
                headerName: 'Ratio',
                calculatedExpression: '[gold] / [silver]',
                cellDataType: 'number',
            }).ok
        ).toBe(true);

        await asyncSetTimeout(1);

        const columnDefs = api.getColumnDefs() ?? [];
        const countById = (id: string) =>
            columnDefs.filter((colDef) => (colDef as { colId?: string }).colId === id).length;
        expect(countById('score')).toBe(1);
        expect(countById('ratio')).toBe(1);
    });

    test('reusing an existing column id with a different expression still errors', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
        });

        expect(
            api.applyToolCall('add_calculated_column', {
                colId: 'score',
                headerName: 'Score',
                calculatedExpression: '[gold] + [silver]',
                cellDataType: 'number',
            }).ok
        ).toBe(true);

        const clash = api.applyToolCall('add_calculated_column', {
            colId: 'score',
            headerName: 'Score',
            calculatedExpression: '[bronze]',
            cellDataType: 'number',
        });
        expect(clash.ok).toBe(false);
        expect(clash.error).toContain('score');
    });

    test('a newly created column can be referenced by a following tool call', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            calculatedColumns: true,
            defaultColDef: { sortable: true },
        });

        expect(
            api.applyToolCall('add_calculated_column', {
                colId: 'total',
                headerName: 'Total',
                calculatedExpression: '[gold] + [silver]',
                cellDataType: 'number',
            }).ok
        ).toBe(true);
        expect(
            api.applyToolCall('update_sort', { sortModel: [{ colId: 'total', sort: 'desc', type: 'default' }] }).ok
        ).toBe(true);

        await asyncSetTimeout(1);

        expect(api.getColumn('total')).toBeTruthy();
        expect(api.getState().sort?.sortModel[0]).toMatchObject({ colId: 'total', sort: 'desc' });
    });
});
