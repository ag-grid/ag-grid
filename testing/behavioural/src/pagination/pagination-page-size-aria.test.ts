import { fireEvent } from '@testing-library/dom';
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

describe('paginationPageSize combobox aria-activedescendant (WCAG 4.1.2)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function getActiveOptionText(combobox: HTMLElement): string | null {
        const activeId = combobox.getAttribute('aria-activedescendant');
        if (activeId == null) {
            return null;
        }
        const option = document.getElementById(activeId);
        expect(option?.getAttribute('role')).toBe('option');
        expect(option?.getAttribute('aria-selected')).toBe('true');
        return option!.textContent!.trim();
    }

    test('references the highlighted option while the list is open', () => {
        const api = createPaginationGrid(gridsManager, { paginationPageSize: 100 });
        const combobox = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-paging-page-size .ag-picker-field-wrapper'
        )!;

        expect(combobox.getAttribute('aria-activedescendant')).toBeNull();

        fireEvent.keyDown(combobox, { key: 'Enter' });
        expect(combobox.getAttribute('aria-expanded')).toBe('true');
        expect(getActiveOptionText(combobox)).toBe('100');

        const options = Array.from(document.querySelectorAll<HTMLElement>('.ag-select-list [role=option]'));
        const ids = options.map((option) => option.id);
        expect(ids.every((id) => id.length > 0)).toBe(true);
        expect(new Set(ids).size).toBe(options.length);

        const steps: [string, string][] = [
            ['ArrowUp', '50'],
            ['ArrowUp', '20'],
            ['ArrowDown', '50'],
            ['Home', '10'],
            ['End', '100'],
        ];
        for (const [key, expected] of steps) {
            fireEvent.keyDown(combobox, { key });
            expect(getActiveOptionText(combobox)).toBe(expected);
        }

        fireEvent.mouseOver(options.find((option) => option.textContent?.trim() === '20')!);
        expect(getActiveOptionText(combobox)).toBe('20');

        fireEvent.mouseLeave(document.querySelector<HTMLElement>('.ag-select-list')!);
        expect(combobox.getAttribute('aria-activedescendant')).toBeNull();

        fireEvent.keyDown(combobox, { key: 'ArrowUp' });
        expect(getActiveOptionText(combobox)).toBe('100');

        fireEvent.keyDown(combobox, { key: 'Escape' });
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
        expect(combobox.getAttribute('aria-activedescendant')).toBeNull();
    });
});
