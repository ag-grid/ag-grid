import { TestGridsManager } from 'ag-test-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

describe('cellDataType inference with sparse leading rows', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = (rowData: any[], field = 'year') =>
        gridsManager.createGrid('grid', {
            columnDefs: [{ field }],
            rowData,
        });

    const inferredType = (api: ReturnType<typeof gridsManager.createGrid>, field = 'year') =>
        api.getColumn(field)!.getColDef().cellDataType;

    test('row 0 holding a value infers from it', () => {
        const api = createGrid([{ year: 2000 }, { year: null }]);

        expect(inferredType(api)).toBe('number');
    });

    test('row 0 empty infers from a later row', () => {
        const api = createGrid([{ year: null }, { year: undefined }, { year: 2000 }]);

        expect(inferredType(api)).toBe('number');
        expect(api.getColumn('year')!.getColDef().cellEditor).toBe('agNumberCellEditor');
    });

    test('a missing field in the leading rows infers from a later row', () => {
        const api = createGrid([{}, { year: 'first' }]);

        expect(inferredType(api)).toBe('text');
    });

    test('the first value found wins over differently typed later rows', () => {
        const api = createGrid([{ year: null }, { year: 'first' }, { year: 2000 }]);

        expect(inferredType(api)).toBe('text');
    });

    test('a column with no values anywhere falls back to no data type', () => {
        const api = createGrid([{ year: null }, { year: null }]);

        expect(inferredType(api)).toBe(false);
    });

    test('dot notation fields are scanned the same way', () => {
        const api = createGrid([{ nested: { year: null } }, { nested: { year: 2000 } }], 'nested.year');

        expect(inferredType(api, 'nested.year')).toBe('number');
    });

    test('row data set after grid init infers from a later row', () => {
        const api = createGrid([]);

        expect(inferredType(api)).toBe(false);

        api.setGridOption('rowData', [{ year: null }, { year: 2000 }]);

        expect(inferredType(api)).toBe('number');
    });

    test('empty rows in the row data are skipped', () => {
        const api = createGrid([null, { year: 2000 }]);

        expect(inferredType(api)).toBe('number');
    });
});
