import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

interface RowData {
    id: string;
    value: { label: string };
}

const ROW_DATA: RowData[] = [
    { id: '1', value: { label: 'Alpha' } },
    { id: '2', value: { label: 'Beta' } },
];

// When a column's data type is inferred as 'object', the grid warns if no Value Formatter is provided
// (needed to display the value) or no Value Parser is provided on editable columns (needed to parse
// edited values back to objects).
//
// The hint to also set `cellDataType: 'object'` explicitly is only included in the Value Parser
// warning, because setting a `valueParser` blocks inference — meaning the grid will no longer infer
// 'object' automatically and the type must be declared. Setting a `valueFormatter` does not block
// inference, so no explicit `cellDataType` is needed in that case.
describe('object cellDataType validation warnings', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, TextEditorModule] });

    let warnSpy: ReturnType<typeof vitest.spyOn>;

    beforeEach(() => {
        gridsManager.reset();
        warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
        gridsManager.reset();
    });

    test('warns about missing valueFormatter when cellDataType=object is inferred', () => {
        gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'value' }],
            rowData: ROW_DATA,
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining(
                'Cell data type is `object` (inferred) but no Value `Formatter` has been provided for column "value"'
            ),
            expect.any(String)
        );
        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("  - `colDef.cellDataType = 'object'`"),
            expect.any(String)
        );
    });

    test('warns about missing valueFormatter when cellDataType=object is set explicitly on colDef - no inference hint', () => {
        gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'value', cellDataType: 'object' }],
            rowData: ROW_DATA,
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object` but no Value `Formatter` has been provided'),
            expect.any(String)
        );
        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('(inferred)'),
            expect.any(String)
        );
    });

    test('warns about missing valueFormatter when cellDataType=object is set on defaultColDef - no inference hint', () => {
        gridsManager.createGrid('grid', {
            defaultColDef: { cellDataType: 'object' },
            columnDefs: [{ field: 'value' }],
            rowData: ROW_DATA,
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object` but no Value `Formatter` has been provided'),
            expect.any(String)
        );
        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('(inferred)'),
            expect.any(String)
        );
    });

    test('warns about missing valueParser when cellDataType=object is inferred and column is editable, includes hint to set explicitly', () => {
        gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'value', editable: true }],
            rowData: ROW_DATA,
        });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object` (inferred) but no Value `Parser` has been provided'),
            expect.any(String)
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("  - `colDef.cellDataType = 'object'`"),
            expect.any(String)
        );
    });

    test('no warning when a custom valueFormatter is provided for inferred object type', () => {
        gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'value', valueFormatter: (p) => p.value?.label ?? '' }],
            rowData: ROW_DATA,
        });

        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object`'),
            expect.any(String)
        );
    });

    test('no warning when valueFormatter and valueParser are both provided for editable inferred object type', () => {
        gridsManager.createGrid('grid', {
            columnDefs: [
                {
                    field: 'value',
                    editable: true,
                    valueFormatter: (p) => p.value?.label ?? '',
                    valueParser: (p) => ({ label: p.newValue }),
                },
            ],
            rowData: ROW_DATA,
        });

        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Cell data type is `object`'),
            expect.any(String)
        );
    });
});
