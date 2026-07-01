import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    PaginationModule,
    PaginationPageNumbersModule,
    ValidationModule,
    getGridElement,
} from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name' }];

function makeRowData(count: number) {
    return Array.from({ length: count }, (_, i) => ({ name: `Row ${i + 1}` }));
}

function createPaginationGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: makeRowData(510),
        pagination: true,
        paginationPageSize: 10,
        paginationPanels: ['pageNumbers'],
        ...options,
    });
}

function getPagingPanel(api: ReturnType<typeof createPaginationGrid>): HTMLElement {
    return getGridElement(api)!.querySelector('.ag-paging-panel')!;
}

function getPageNumbersPanel(api: ReturnType<typeof createPaginationGrid>): HTMLElement {
    return getPagingPanel(api).querySelector('.ag-paging-page-numbers')!;
}

/** The rendered sequence, with ellipses represented as '…'. */
function getRenderedSequence(api: ReturnType<typeof createPaginationGrid>): string[] {
    return Array.from(getPageNumbersPanel(api).children).map((el) => el.textContent ?? '');
}

function getPageButton(api: ReturnType<typeof createPaginationGrid>, text: string): HTMLElement | null {
    return Array.from(getPageNumbersPanel(api).querySelectorAll<HTMLElement>('.ag-paging-page-number')).find(
        (el) => el.textContent === text
    )!;
}

describe('pagination pageNumbers panel', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, PaginationPageNumbersModule, ValidationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('renders when configured and works alongside other panels', () => {
        const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageNumbers', 'pageSummary'] });
        const panel = getPagingPanel(api);
        expect(panel.querySelector('.ag-paging-page-numbers')).toBeTruthy();
        expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
    });

    test('shows all page numbers without ellipsis when total pages fit', () => {
        const api = createPaginationGrid(gridsManager, { rowData: makeRowData(50) });
        expect(api.paginationGetTotalPages()).toBe(5);
        expect(getRenderedSequence(api)).toEqual(['1', '2', '3', '4', '5']);
    });

    test('renders start, middle and end truncation patterns', () => {
        const api = createPaginationGrid(gridsManager);
        expect(api.paginationGetTotalPages()).toBe(51);

        // near the start the window expands to a fixed block: 1 2 3 4 5 … 51
        expect(getRenderedSequence(api)).toEqual(['1', '2', '3', '4', '5', '…', '51']);

        api.paginationGoToPage(1);
        expect(getRenderedSequence(api)).toEqual(['1', '2', '3', '4', '5', '…', '51']);

        api.paginationGoToPage(9);
        expect(getRenderedSequence(api)).toEqual(['1', '…', '9', '10', '11', '…', '51']);

        api.paginationGoToPage(49);
        expect(getRenderedSequence(api)).toEqual(['1', '…', '47', '48', '49', '50', '51']);
    });

    test('clicking a page number navigates to that page', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        getPageButton(api, '11')!.click();

        expect(api.paginationGetCurrentPage()).toBe(10);
    });

    test('current page is a focusable disabled button indicated with aria-current', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        const current = getPageNumbersPanel(api).querySelector('.ag-paging-page-number-current')!;
        expect(current.textContent).toBe('10');
        expect(current.getAttribute('aria-current')).toBe('page');
        expect(current.getAttribute('role')).toBe('button');
        expect(current.getAttribute('aria-disabled')).toBe('true');
        expect(current.getAttribute('tabindex')).toBe('0');
        expect(current.hasAttribute('data-page')).toBe(false);
    });

    test('current page can receive keyboard focus', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        const current = getPageNumbersPanel(api).querySelector<HTMLElement>('.ag-paging-page-number-current')!;
        current.focus();

        expect(document.activeElement).toBe(current);
    });

    test('keeps focus on the new current page after activating a page number by keyboard', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        const target = getPageButton(api, '11')!;
        target.focus();
        expect(document.activeElement).toBe(target);

        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(api.paginationGetCurrentPage()).toBe(10);
        const current = getPageNumbersPanel(api).querySelector<HTMLElement>('.ag-paging-page-number-current')!;
        expect(current.textContent).toBe('11');
        expect(document.activeElement).toBe(current);
    });

    test('clicking the current page does not dispatch a page change event', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        const onPaginationChanged = vi.fn();
        api.addEventListener('paginationChanged', onPaginationChanged);

        getPageNumbersPanel(api).querySelector<HTMLElement>('.ag-paging-page-number-current')!.click();

        expect(api.paginationGetCurrentPage()).toBe(9);
        expect(onPaginationChanged).not.toHaveBeenCalled();
    });

    test('ellipsis is non-interactive', () => {
        const api = createPaginationGrid(gridsManager);
        api.paginationGoToPage(9);

        const ellipsis = getPageNumbersPanel(api).querySelector<HTMLElement>('.ag-paging-page-number-ellipsis')!;
        expect(ellipsis.getAttribute('aria-hidden')).toBe('true');
        expect(ellipsis.hasAttribute('data-page')).toBe(false);

        ellipsis.click();
        expect(api.paginationGetCurrentPage()).toBe(9);
    });

    test('renders a single non-interactive item when only one page exists', () => {
        const api = createPaginationGrid(gridsManager, { rowData: makeRowData(5) });
        expect(api.paginationGetTotalPages()).toBe(1);

        const items = getPageNumbersPanel(api).children;
        expect(items).toHaveLength(1);
        expect(items[0].textContent).toBe('1');
        expect(items[0].hasAttribute('data-page')).toBe(false);
    });

    test('renders previous and next arrows that navigate', () => {
        const api = createPaginationGrid(gridsManager);
        const panel = getPagingPanel(api);
        const prev = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Previous Page"]')!;
        const next = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Next Page"]')!;
        expect(prev).toBeTruthy();
        expect(next).toBeTruthy();

        next.click();
        expect(api.paginationGetCurrentPage()).toBe(1);

        prev.click();
        expect(api.paginationGetCurrentPage()).toBe(0);
    });

    test('renders first and last arrows that jump to the first and last page', () => {
        const api = createPaginationGrid(gridsManager);
        const panel = getPagingPanel(api);
        const first = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="First Page"]')!;
        const last = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Last Page"]')!;
        expect(first).toBeTruthy();
        expect(last).toBeTruthy();

        last.click();
        expect(api.paginationGetCurrentPage()).toBe(50);

        first.click();
        expect(api.paginationGetCurrentPage()).toBe(0);
    });

    test('first/previous disabled on the first page, next/last disabled on the last page', () => {
        const api = createPaginationGrid(gridsManager);
        const panel = getPagingPanel(api);
        const first = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="First Page"]')!;
        const prev = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Previous Page"]')!;
        const next = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Next Page"]')!;
        const last = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Last Page"]')!;

        expect(first).toHaveClass('ag-disabled');
        expect(prev).toHaveClass('ag-disabled');
        expect(next).not.toHaveClass('ag-disabled');
        expect(last).not.toHaveClass('ag-disabled');

        api.paginationGoToPage(50);
        expect(first).not.toHaveClass('ag-disabled');
        expect(prev).not.toHaveClass('ag-disabled');
        expect(next).toHaveClass('ag-disabled');
        expect(last).toHaveClass('ag-disabled');
    });

    test('clicking a disabled arrow does not change the page', () => {
        const api = createPaginationGrid(gridsManager);
        const panel = getPagingPanel(api);
        const prev = panel.querySelector<HTMLElement>('.ag-paging-page-numbers-panel [aria-label="Previous Page"]')!;

        prev.click();
        expect(api.paginationGetCurrentPage()).toBe(0);
    });

    test('recomputes visible pages when the page size changes', () => {
        const api = createPaginationGrid(gridsManager, { rowData: makeRowData(50) });
        expect(getRenderedSequence(api)).toEqual(['1', '2', '3', '4', '5']);

        api.setGridOption('paginationPageSize', 25);

        expect(api.paginationGetTotalPages()).toBe(2);
        expect(getRenderedSequence(api)).toEqual(['1', '2']);
    });

    test('clamps current page to the last page when data shrinks below it', () => {
        const api = createPaginationGrid(gridsManager, { rowData: makeRowData(50) });
        api.paginationGoToPage(4);
        expect(api.paginationGetCurrentPage()).toBe(4);

        api.setGridOption('rowData', makeRowData(20));

        expect(api.paginationGetTotalPages()).toBe(2);
        expect(api.paginationGetCurrentPage()).toBe(1);
        expect(getRenderedSequence(api)).toEqual(['1', '2']);
        expect(getPageNumbersPanel(api).querySelector('.ag-paging-page-number-current')!.textContent).toBe('2');
    });
});
