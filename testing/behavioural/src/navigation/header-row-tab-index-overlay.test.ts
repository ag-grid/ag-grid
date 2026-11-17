import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ScrollApiModule, getGridElement } from 'ag-grid-community';

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'age' }];

function headerRowTabIndexes(): (string | null)[] {
    return Array.from(document.querySelectorAll('.ag-header-row')).map((el) => el.getAttribute('tabindex'));
}

describe('header row tabindex and exclusive overlays', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('header rows rejoin the tab order once an exclusive overlay is hidden', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

        expect(headerRowTabIndexes()).toEqual([null]);

        api.setGridOption('loading', false);

        expect(headerRowTabIndexes()).toEqual(['0']);
    });

    test('header rows leave the tab order while an exclusive overlay is shown', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ athlete: 'a', age: 1 }] });

        expect(headerRowTabIndexes()).toEqual(['0']);

        api.setGridOption('loading', true);

        expect(headerRowTabIndexes()).toEqual([null]);
    });

    test('suppressHeaderFocus keeps header rows out of the tab order', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ athlete: 'a', age: 1 }],
            suppressHeaderFocus: true,
        });

        expect(headerRowTabIndexes()).toEqual([null]);

        api.setGridOption('suppressHeaderFocus', false);

        expect(headerRowTabIndexes()).toEqual(['0']);
    });
});

/** Each header row as assistive technology and the tab order see it. */
const headerRows = (api: GridApi) =>
    Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-header-row')).map((row) => ({
        ariaRowIndex: row.getAttribute('aria-rowindex'),
        ariaHidden: row.getAttribute('aria-hidden'),
        tabIndex: row.getAttribute('tabindex'),
        cells: row.querySelectorAll('[role="columnheader"]').length,
    }));

const emptyRow = (ariaRowIndex: string) => ({ ariaRowIndex, ariaHidden: 'true', tabIndex: null, cells: 0 });
const rowWithCells = (ariaRowIndex: string, cells: number, tabIndex: string | null = '0') => ({
    ariaRowIndex,
    ariaHidden: null,
    tabIndex,
    cells,
});

const currencyGroup: ColGroupDef = {
    headerName: 'Currency',
    children: [
        { field: 'usd', hide: true },
        { field: 'eur', hide: true },
    ],
};

describe('header rows without cells', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ScrollApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('the padding-only row of a group whose columns are all hidden is hidden from assistive technology until a column shows', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'make' }, currencyGroup],
            rowData: [{ make: 'Tesla', usd: 1, eur: 2 }],
        });

        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);

        api.setColumnsVisible(['usd'], true);
        expect(headerRows(api)).toEqual([rowWithCells('1', 1), rowWithCells('2', 2)]);

        api.setColumnsVisible(['usd'], false);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);
    });

    test('a column header whose header does not span keeps a padding cell, so its row stays exposed', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'make', suppressSpanHeaderHeight: true }, currencyGroup],
            rowData: [{ make: 'Tesla' }],
        });

        expect(headerRows(api)).toEqual([rowWithCells('1', 1), rowWithCells('2', 1)]);
    });

    test('hidePaddedHeaderRows removes the padding-only row instead, and the row returns hidden when turned off', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'make' }, currencyGroup],
            rowData: [{ make: 'Tesla' }],
            hidePaddedHeaderRows: true,
        });

        expect(headerRows(api)).toEqual([rowWithCells('1', 1)]);

        api.setGridOption('hidePaddedHeaderRows', false);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);
    });

    test('with every column hidden, no header row is exposed', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'make', hide: true }, currencyGroup],
            rowData: [{ make: 'Tesla' }],
        });

        expect(headerRows(api)).toEqual([emptyRow('1'), emptyRow('2')]);

        api.setColumnsVisible(['make'], true);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);
    });

    test('an empty row stays out of the tab order when an exclusive overlay or suppressHeaderFocus is turned off', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'make' }, currencyGroup],
            rowData: [{ make: 'Tesla' }],
            suppressHeaderFocus: true,
        });

        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1, null)]);

        api.setGridOption('suppressHeaderFocus', false);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);

        api.setGridOption('loading', true);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1, null)]);

        api.setGridOption('loading', false);
        expect(headerRows(api)).toEqual([emptyRow('1'), rowWithCells('2', 1)]);

        api.setGridOption('suppressHeaderFocus', true);
        api.setColumnsVisible(['usd'], true);
        expect(headerRows(api)).toEqual([rowWithCells('1', 1, null), rowWithCells('2', 2, null)]);
    });

    test('a group row is hidden while the viewport shows only ungrouped columns, and exposed while it shows the group', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = [];
        for (let i = 0; i < 30; ++i) {
            columnDefs.push({ field: `c${i}`, width: 120 });
        }
        columnDefs.push({ groupId: 'g', children: [{ field: 'x', width: 120 }] });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);

        const groupRow = () => headerRows(api)[0];
        expect(groupRow()).toEqual(emptyRow('1'));

        api.ensureColumnVisible('x');
        await asyncSetTimeout(0);
        expect(groupRow()).toEqual(rowWithCells('1', 1));

        api.ensureColumnVisible('c0');
        await asyncSetTimeout(0);
        expect(groupRow()).toEqual(emptyRow('1'));
    });
});
