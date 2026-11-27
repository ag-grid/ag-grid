import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

describe('caseInsensitiveSort', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const codes = ['b', 'AA', 'az', 'aa', 'B', 'Aa', 'AZ'];
    const caseInsensitiveOrder = ['AA', 'aa', 'Aa', 'az', 'AZ', 'b', 'B'];
    const defaultOrder = ['AA', 'AZ', 'Aa', 'B', 'aa', 'az', 'b'];

    /** Values of `colId` in display order, after sorting `colId` in `direction`. */
    function sortedValues(api: GridApi, colId: string, direction: 'asc' | 'desc' = 'asc'): unknown[] {
        api.applyColumnState({ state: [{ colId, sort: direction }], defaultState: { sort: null } });
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(api.getCellValue({ rowNode: node, colKey: colId })));
        return values;
    }

    function displayedValues(api: GridApi): unknown[] {
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.code));
        return values;
    }

    function createGrid(id: string, options: Partial<GridOptions>, colDef: ColDef = {}): GridApi {
        return gridMgr.createGrid(id, {
            columnDefs: [{ field: 'code', ...colDef }],
            rowData: codes.map((code) => ({ code })),
            ...options,
        });
    }

    test('sorts without regard to case, keeping the original order of values that differ only in case', () => {
        const api = createGrid('ci-col', {}, { caseInsensitiveSort: true });

        expect(sortedValues(api, 'code')).toEqual(caseInsensitiveOrder);
        // values that differ only in case keep their original order descending too
        expect(sortedValues(api, 'code', 'desc')).toEqual(['b', 'B', 'az', 'AZ', 'AA', 'aa', 'Aa']);
    });

    test('defaultColDef.caseInsensitiveSort applies to every column', () => {
        const api = createGrid('ci-default-col-def', { defaultColDef: { caseInsensitiveSort: true } });

        expect(sortedValues(api, 'code')).toEqual(caseInsensitiveOrder);
    });

    test('colDef.caseInsensitiveSort = false on a column overrides defaultColDef', () => {
        const api = createGrid(
            'ci-col-off',
            { defaultColDef: { caseInsensitiveSort: true } },
            { caseInsensitiveSort: false }
        );

        expect(sortedValues(api, 'code')).toEqual(defaultOrder);
    });

    test('the default sort is unchanged', () => {
        const api = createGrid('ci-default', {});

        expect(sortedValues(api, 'code')).toEqual(defaultOrder);
    });

    test('changing colDef.caseInsensitiveSort at runtime sorts again', () => {
        const api = createGrid('ci-col-runtime', {});
        expect(sortedValues(api, 'code')).toEqual(defaultOrder);

        api.setGridOption('columnDefs', [{ field: 'code', sort: 'asc', caseInsensitiveSort: true }]);
        expect(displayedValues(api)).toEqual(caseInsensitiveOrder);

        api.setGridOption('columnDefs', [{ field: 'code', sort: 'asc', caseInsensitiveSort: false }]);
        expect(displayedValues(api)).toEqual(defaultOrder);
    });

    test('changing defaultColDef.caseInsensitiveSort at runtime sorts again', () => {
        const api = createGrid('ci-default-col-def-runtime', {});
        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });
        expect(displayedValues(api)).toEqual(defaultOrder);

        api.setGridOption('defaultColDef', { caseInsensitiveSort: true });
        expect(displayedValues(api)).toEqual(caseInsensitiveOrder);
    });

    test('combined with accentedSort, uses the locale rules and still takes accents into account', () => {
        const values = ['b', 'À', 'a', 'A', 'à', 'B'];
        const api = gridMgr.createGrid('ci-accented', {
            columnDefs: [{ field: 'code', caseInsensitiveSort: true }],
            rowData: values.map((code) => ({ code })),
            accentedSort: true,
        });

        // a and A are equal and keep their order, and so are à and À; à sorts after a
        expect(sortedValues(api, 'code')).toEqual(['a', 'A', 'À', 'à', 'b', 'B']);
    });

    test("combined with accentedSort `sensitivity: 'case'`, ignores case and accents", () => {
        const values = ['b', 'à', 'A', 'a'];
        const api = gridMgr.createGrid('ci-accented-case', {
            columnDefs: [
                { field: 'code', caseInsensitiveSort: true, accentedSort: { options: { sensitivity: 'case' } } },
            ],
            rowData: values.map((code) => ({ code })),
        });

        expect(sortedValues(api, 'code')).toEqual(['à', 'A', 'a', 'b']);
    });

    test('a case-insensitive column follows a change to the accentedSort grid option', () => {
        const values = ['b', 'À', 'a', 'A', 'à', 'B'];
        const api = gridMgr.createGrid('ci-grid-accented-runtime', {
            columnDefs: [{ field: 'code', caseInsensitiveSort: true }],
            rowData: values.map((code) => ({ code })),
        });
        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });
        // lowercased code point order puts accented letters after every unaccented one
        expect(displayedValues(api)).toEqual(['a', 'A', 'b', 'B', 'À', 'à']);

        api.setGridOption('accentedSort', true);
        expect(displayedValues(api)).toEqual(['a', 'A', 'À', 'à', 'b', 'B']);
    });
});
