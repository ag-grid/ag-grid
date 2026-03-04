import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('Advanced Filter Header DOM', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, AdvancedFilterModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [{ athlete: 'A', age: 1 }];

    afterEach(() => {
        gridsManager.reset();
    });

    test('does not render advanced filter header when disabled', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        });

        expect(document.querySelector('.ag-advanced-filter-header')).toBeNull();
    });

    test('mounts and unmounts advanced filter header when toggled', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        });

        expect(document.querySelector('.ag-advanced-filter-header')).toBeNull();

        api.setGridOption('enableAdvancedFilter', true);
        await waitFor(() => expect(document.querySelector('.ag-advanced-filter-header')).not.toBeNull());

        api.setGridOption('enableAdvancedFilter', false);
        await waitFor(() => expect(document.querySelector('.ag-advanced-filter-header')).toBeNull());
    });
});
