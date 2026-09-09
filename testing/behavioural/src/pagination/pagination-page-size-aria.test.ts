import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, getGridElement } from 'ag-grid-community';

const COLUMN_DEFS = [{ field: 'name' }];
const ROW_DATA = Array.from({ length: 50 }, (_, i) => ({ name: `Row ${i + 1}` }));

function createPaginationGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        ...options,
    });
}

describe('paginationPageSize combobox aria-controls (WCAG 4.1.2)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('aria-controls references the list only while the picker is expanded', async () => {
        const api = createPaginationGrid(gridsManager);
        const wrapper = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-paging-page-size .ag-picker-field-wrapper'
        )!;

        // Precondition: this is the combobox the audit tool inspects.
        expect(wrapper.getAttribute('role')).toBe('combobox');

        // Collapsed at rest: no dangling idref — aria-controls must not point at an absent element.
        expect(wrapper.getAttribute('aria-expanded')).toBe('false');
        expect(wrapper.getAttribute('aria-controls')).toBeNull();

        // Expanded: aria-controls is set and resolves to an element present in the DOM.
        const display = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-paging-page-size .ag-picker-field-display'
        )!;
        await userEvent.setup().click(display);
        await asyncSetTimeout(0);

        expect(wrapper.getAttribute('aria-expanded')).toBe('true');
        const controlsId = wrapper.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        expect(document.getElementById(controlsId!)).not.toBeNull();
    });
});
