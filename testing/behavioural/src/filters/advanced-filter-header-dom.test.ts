import { waitFor } from '@testing-library/dom';

import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('Advanced Filter Header DOM', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, AdvancedFilterModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [{ athlete: 'A', age: 1 }];

    afterEach(() => {
        gridsManager.reset();
    });

    const getElementY = (element: HTMLElement): number => {
        const transform = element.style.transform;
        if (transform) {
            const match = transform.match(/translateY\(([-\d.]+)px\)/);
            if (match) {
                return Number.parseFloat(match[1]);
            }
        }
        return Number.parseFloat(element.style.top || '0');
    };

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

    test('keeps pinned-top rows below advanced filter row', () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableAdvancedFilter: true,
            pinnedTopRowData: [{ athlete: 'Pinned Top', age: 99 }],
        });

        const topRowsSection = document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows');
        const advancedFilterHeader = topRowsSection?.querySelector<HTMLElement>('.ag-advanced-filter-header');
        const pinnedTopRow = topRowsSection?.querySelector<HTMLElement>('.ag-row.ag-row-pinned');

        expect(topRowsSection).toBeTruthy();
        expect(advancedFilterHeader).toBeTruthy();
        expect(pinnedTopRow).toBeTruthy();

        const advancedFilterTop = Number.parseFloat(advancedFilterHeader!.style.top || '0');
        const advancedFilterHeight = Number.parseFloat(advancedFilterHeader!.style.height || '0');
        const advancedFilterBottom = advancedFilterTop + advancedFilterHeight;

        // The pinned top container has a `top` that positions it below the header and advanced filter.
        // The row's own transform/top is container-relative (starts at 0).
        const pinnedTopContainer = topRowsSection?.querySelector<HTMLElement>('.ag-grid-pinned-top-rows-container');
        const containerTop = Number.parseFloat(pinnedTopContainer?.style.top || '0');
        const pinnedTopRowTop = containerTop + getElementY(pinnedTopRow!);

        // Pinned top rows must start at or below the advanced filter row.
        expect(pinnedTopRowTop).toBeGreaterThanOrEqual(advancedFilterBottom - 1);
    });
});
