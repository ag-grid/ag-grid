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

    function createGrid(id: string, options: Partial<GridOptions>, colDef: ColDef = {}): GridApi {
        return gridMgr.createGrid(id, {
            columnDefs: [{ field: 'code', ...colDef }],
            rowData: codes.map((code) => ({ code })),
            ...options,
        });
    }

    test('sorts without regard to case, keeping the original order of values that differ only in case', () => {
        const api = createGrid('ci-grid', { caseInsensitiveSort: true });

        expect(sortedValues(api, 'code')).toEqual(caseInsensitiveOrder);
        // values that differ only in case keep their original order descending too
        expect(sortedValues(api, 'code', 'desc')).toEqual(['b', 'B', 'az', 'AZ', 'AA', 'aa', 'Aa']);
    });

    test('the default sort is unchanged', () => {
        const api = createGrid('ci-default', {});

        expect(sortedValues(api, 'code')).toEqual(defaultOrder);
    });

    test('changing the grid option at runtime sorts again', () => {
        const api = createGrid('ci-runtime', {});
        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });

        const displayed = () => {
            const values: unknown[] = [];
            api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.code));
            return values;
        };
        expect(displayed()).toEqual(defaultOrder);

        api.setGridOption('caseInsensitiveSort', true);
        expect(displayed()).toEqual(caseInsensitiveOrder);

        api.setGridOption('caseInsensitiveSort', false);
        expect(displayed()).toEqual(defaultOrder);
    });

    test('setting accentedSort and caseInsensitiveSort in one update sorts again with both', () => {
        // the column's own accentedSort makes its comparator depend on the caseInsensitiveSort grid option only
        const api = createGrid('ci-batched', {}, { accentedSort: false });
        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });

        api.updateGridOptions({ accentedSort: true, caseInsensitiveSort: true });
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.code));
        expect(values).toEqual(caseInsensitiveOrder);
    });

    test('an update that sets rowData before caseInsensitiveSort sorts the new rows with it', () => {
        const api = createGrid('ci-row-data-first', {});
        api.applyColumnState({ state: [{ colId: 'code', sort: 'asc' }] });

        // rowData is applied first and sorts the rows before the caseInsensitiveSort event is raised
        api.updateGridOptions({ rowData: [...codes].reverse().map((code) => ({ code })), caseInsensitiveSort: true });
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.code));
        expect(values).toEqual(['Aa', 'aa', 'AA', 'AZ', 'az', 'B', 'b']);
    });

    test('colDef.caseInsensitiveSort overrides the grid option for that column', () => {
        const onApi = createGrid('ci-col-on', {}, { caseInsensitiveSort: true });
        expect(sortedValues(onApi, 'code')).toEqual(caseInsensitiveOrder);

        const offApi = createGrid('ci-col-off', { caseInsensitiveSort: true }, { caseInsensitiveSort: false });
        expect(sortedValues(offApi, 'code')).toEqual(defaultOrder);
    });

    test('changing colDef.caseInsensitiveSort at runtime sorts again', () => {
        const api = createGrid('ci-col-runtime', {});
        expect(sortedValues(api, 'code')).toEqual(defaultOrder);

        api.setGridOption('columnDefs', [{ field: 'code', sort: 'asc', caseInsensitiveSort: true }]);
        const values: unknown[] = [];
        api.forEachNodeAfterFilterAndSort((node) => values.push(node.data.code));
        expect(values).toEqual(caseInsensitiveOrder);
    });

    test('combined with accentedSort, uses the locale rules and still takes accents into account', () => {
        const values = ['b', 'À', 'a', 'A', 'à', 'B'];
        const api = gridMgr.createGrid('ci-accented', {
            columnDefs: [{ field: 'code' }],
            rowData: values.map((code) => ({ code })),
            accentedSort: true,
            caseInsensitiveSort: true,
        });

        // a and A are equal and keep their order, and so are à and À; à sorts after a
        expect(sortedValues(api, 'code')).toEqual(['a', 'A', 'À', 'à', 'b', 'B']);
    });

    test("combined with accentedSort `sensitivity: 'case'`, ignores case and accents", () => {
        const values = ['b', 'à', 'A', 'a'];
        const api = gridMgr.createGrid('ci-accented-case', {
            columnDefs: [{ field: 'code' }],
            rowData: values.map((code) => ({ code })),
            accentedSort: { options: { sensitivity: 'case' } },
            caseInsensitiveSort: true,
        });

        expect(sortedValues(api, 'code')).toEqual(['à', 'A', 'a', 'b']);
    });

    test('a column with its own accentedSort still follows the caseInsensitiveSort grid option', () => {
        const api = createGrid('ci-own-accented', { caseInsensitiveSort: true }, { accentedSort: true });
        expect(sortedValues(api, 'code')).toEqual(caseInsensitiveOrder);

        api.setGridOption('caseInsensitiveSort', false);
        // accentedSort only: localeCompare puts lowercase first in most locales, so case variants no longer tie
        expect(sortedValues(api, 'code')).toEqual([...codes].sort((a, b) => a.localeCompare(b)));
    });
});
