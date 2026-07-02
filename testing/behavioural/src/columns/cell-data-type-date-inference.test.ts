import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

// A column whose first data set holds date-prefixed filename strings (e.g. `2025-05-23T11-08-35.rtf`)
// must not be auto-inferred as a date/datetime type. If it were, the sticky inferred type would
// render later non-conforming strings as blank cells once the rowData is swapped.
describe('cellDataType inference for date-prefixed filename strings', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const FIRST_SET = [{ file: '2025-05-23T11-08-35.rtf' }, { file: '2025-05-24T09-01-02.rtf' }];
    const SECOND_SET = [
        { file: '2025-06-01T15-22-09.rtf' },
        { file: '2025-06-02T08-44-17.rtf' },
        { file: '2025-06-03T18-05-51.rtf' },
        { file: '2025-06-04T07-33-40.rtf' },
    ];

    const renderedValues = (api: ReturnType<typeof gridsManager.createGrid>): (string | null | undefined)[] => {
        const values: (string | null | undefined)[] = [];
        api.forEachNode((node) => {
            values.push(api.getCellValue({ rowNode: node, colKey: 'file', useFormatter: true }));
        });
        return values;
    };

    test('infers text and renders both data sets regardless of load order', () => {
        const api = gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'file' }],
            rowData: FIRST_SET,
        });

        expect(api.getColumn('file')!.getColDef().cellDataType).toBe('text');
        expect(renderedValues(api)).toEqual(FIRST_SET.map((r) => r.file));

        api.setGridOption('rowData', SECOND_SET);

        expect(renderedValues(api)).toEqual(SECOND_SET.map((r) => r.file));
    });
});
