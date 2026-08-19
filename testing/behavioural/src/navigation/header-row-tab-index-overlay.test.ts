import { TestGridsManager } from 'ag-test-utils';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

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
