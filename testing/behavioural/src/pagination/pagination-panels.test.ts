import { userEvent } from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ValidationModule, getGridElement } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

function getPagingPanel(api: ReturnType<typeof createPaginationGrid>): HTMLElement | null {
    return getGridElement(api)!.querySelector('.ag-paging-panel');
}

function getButtonIconName(panel: HTMLElement, ariaLabel: string): string | undefined {
    const btn = panel.querySelector<HTMLElement>(`[aria-label="${ariaLabel}"]`);
    const icon = btn?.querySelector<HTMLElement>('.ag-icon');
    // Icon class is "ag-icon ag-icon-{name}", extract the name
    return Array.from(icon?.classList ?? [])
        .find((cls) => cls.startsWith('ag-icon-'))
        ?.replace('ag-icon-', '');
}

function getChildElements(panel: HTMLElement): Element[] {
    return Array.from(panel.querySelector('.ag-paging-panel-content')!.children);
}

describe('paginationPanels', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('default behaviour (no paginationPanels config)', () => {
        test('renders all three components in default order: pageSize, rowSummary, pageSummary', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;

            expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();

            const children = getChildElements(panel);
            expect(children[0].classList.contains('ag-paging-page-size')).toBe(true);
            expect(children[1].classList.contains('ag-paging-row-summary-panel')).toBe(true);
            expect(children[2].classList.contains('ag-paging-page-summary-panel')).toBe(true);
        });

        test('panel is visible when pagination is enabled', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            expect(panel).not.toHaveClass('ag-hidden');
        });

        test('page navigation buttons work', () => {
            const api = createPaginationGrid(gridsManager);
            expect(api.paginationGetCurrentPage()).toBe(0);

            const panel = getPagingPanel(api)!;
            const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
            nextBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(1);

            const prevBtn = panel.querySelector<HTMLElement>('[aria-label="Previous Page"]')!;
            prevBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('row summary displays correct values', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const numbers = panel.querySelectorAll('.ag-paging-row-summary-panel-number');
            expect(numbers[0].textContent).toBe('1'); // first row
            expect(numbers[1].textContent).toBe('10'); // last row on page
            expect(numbers[2].textContent).toBe('50'); // total
        });

        test('row summary and page summary IDs share the same prefix as the pagination panel', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const panelId = panel.id;
            expect(panelId).toMatch(/^ag-\d+$/);

            // Row summary IDs
            const rowSummary = panel.querySelector('.ag-paging-row-summary-panel')!;
            const rowIds = Array.from(rowSummary.querySelectorAll('[id]')).map((el) => el.id);
            expect(rowIds.length).toBeGreaterThan(0);
            for (const id of rowIds) {
                expect(id).toMatch(new RegExp(`^${panelId}-`));
            }

            // Page summary IDs — exclude internal elements of the input number field,
            // which use their own component ID prefix for label/input wiring
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            const numberField = pageSummary.querySelector('.ag-number-field');
            const pageIds = Array.from(pageSummary.querySelectorAll('[id]'))
                .filter((el) => numberField == null || el === numberField || !numberField.contains(el))
                .map((el) => el.id);
            expect(pageIds.length).toBeGreaterThan(0);
            for (const id of pageIds) {
                expect(id).toMatch(new RegExp(`^${panelId}-`));
            }
        });

        test('LTR: navigation buttons use correct icon direction', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            expect(getButtonIconName(panel, 'First Page')).toBe('first');
            expect(getButtonIconName(panel, 'Previous Page')).toBe('previous');
            expect(getButtonIconName(panel, 'Next Page')).toBe('next');
            expect(getButtonIconName(panel, 'Last Page')).toBe('last');
        });

        test('RTL: navigation buttons swap icon direction', () => {
            const api = createPaginationGrid(gridsManager, { enableRtl: true });
            const panel = getPagingPanel(api)!;
            expect(getButtonIconName(panel, 'First Page')).toBe('last');
            expect(getButtonIconName(panel, 'Previous Page')).toBe('next');
            expect(getButtonIconName(panel, 'Next Page')).toBe('previous');
            expect(getButtonIconName(panel, 'Last Page')).toBe('first');
        });

        test('page summary displays correct values', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const pageNumbers = panel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number');
            expect((pageNumbers[0].querySelector('input') as HTMLInputElement).value).toBe('1'); // current page
            expect(pageNumbers[1].textContent).toBe('5'); // total pages
        });

        test('typing alone does not navigate', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            input.value = '3';
            input.dispatchEvent(new Event('input'));

            expect(api.paginationGetCurrentPage()).toBe(0);
        });

        test('Enter key navigates to typed page', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            input.value = '3';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(2);
        });

        test('blur navigates to typed page', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            input.value = '3';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('blur'));

            expect(api.paginationGetCurrentPage()).toBe(2);
        });

        test('Escape cancels edit and restores current page without navigating', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(1);

            input.value = '5';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(1);
            expect(input.value).toBe('2');
        });

        test('ArrowUp navigates to next page', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('ArrowDown navigates to previous page', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(2);

            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('invalid input resets to current page without navigating', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(1);

            input.value = '0';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(1);
            expect(input.value).toBe('2');
        });

        test('out-of-range input resets to current page without navigating', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(1);

            input.value = '99';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

            expect(api.paginationGetCurrentPage()).toBe(1);
            expect(input.value).toBe('2');
        });

        test('blurring with empty input resets to current page', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(2);

            input.value = '';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('blur'));

            expect(api.paginationGetCurrentPage()).toBe(2);
            expect(input.value).toBe('3');
        });

        test('page input has spinbutton role and correct ARIA attributes', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            expect(input.getAttribute('role')).toBe('spinbutton');
            expect(input.getAttribute('aria-valuenow')).toBe('1');
            expect(input.getAttribute('aria-valuemin')).toBe('1');
            expect(input.getAttribute('aria-valuemax')).toBe('5');
            expect(input.getAttribute('aria-label')).toContain('1');
        });

        test('ARIA attributes update when page changes', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const input = panel.querySelector<HTMLInputElement>('.ag-paging-page-summary-panel input')!;

            api.paginationGoToPage(3);

            expect(input.getAttribute('aria-valuenow')).toBe('4');
        });
    });

    describe('reordering', () => {
        test('renders components in configured order: pageSummary, rowSummary, pageSize', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['pageSummary', 'rowSummary', 'pageSize'],
            });
            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children[0].classList.contains('ag-paging-page-summary-panel')).toBe(true);
            expect(children[1].classList.contains('ag-paging-row-summary-panel')).toBe(true);
            expect(children[2].classList.contains('ag-paging-page-size')).toBe(true);
        });

        test('renders components in configured order: rowSummary, pageSize, pageSummary', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['rowSummary', 'pageSize', 'pageSummary'],
            });
            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children[0].classList.contains('ag-paging-row-summary-panel')).toBe(true);
            expect(children[1].classList.contains('ag-paging-page-size')).toBe(true);
            expect(children[2].classList.contains('ag-paging-page-summary-panel')).toBe(true);
        });

        test('page navigation still works after reordering', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['pageSummary', 'rowSummary', 'pageSize'],
            });
            const panel = getPagingPanel(api)!;
            const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
            nextBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(1);
        });

        test('row summary displays correct values after reordering', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['pageSummary', 'rowSummary'],
            });
            const panel = getPagingPanel(api)!;
            const numbers = panel.querySelectorAll('.ag-paging-row-summary-panel-number');
            expect(numbers[0].textContent).toBe('1');
            expect(numbers[1].textContent).toBe('10');
            expect(numbers[2].textContent).toBe('50');
        });
    });

    describe('hiding components', () => {
        test('only pageSummary present when paginationPanels: ["pageSummary"]', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSummary'] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeNull();
            expect(panel.querySelector('.ag-paging-page-size')).toBeNull();
        });

        test('only rowSummary present when paginationPanels: ["rowSummary"]', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['rowSummary'] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeNull();
            expect(panel.querySelector('.ag-paging-page-size')).toBeNull();
        });

        test('only pageSize present when paginationPanels: ["pageSize"]', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSize'] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeNull();
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeNull();
        });

        test('pageSize and pageSummary present when paginationPanels: ["pageSize", "pageSummary"]', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSize', 'pageSummary'] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeNull();
        });

        test('hidden components leave no residual DOM elements', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSummary'] });
            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children).toHaveLength(1);
            expect(children[0].classList.contains('ag-paging-page-summary-panel')).toBe(true);
        });

        test('empty array hides the pagination panel entirely', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: [] });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
            expect(getChildElements(panel)).toHaveLength(0);
        });
    });

    describe('interaction with other options', () => {
        test('suppressPaginationPanel: true hides panel regardless of paginationPanels config', () => {
            const api = createPaginationGrid(gridsManager, {
                suppressPaginationPanel: true,
                paginationPanels: ['pageSize', 'rowSummary', 'pageSummary'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
        });

        test('paginationPageSizeSelector: false with pageSize in paginationPanels hides page size selector', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: false,
                paginationPanels: ['pageSize', 'pageSummary'],
            });
            const panel = getPagingPanel(api)!;
            // Component is created but hidden so it can be shown if paginationPageSizeSelector changes at runtime
            const pageSizeEl = panel.querySelector('.ag-paging-page-size');
            expect(pageSizeEl).toBeTruthy();
            expect(pageSizeEl).toHaveClass('ag-hidden');
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
        });

        test('paginationAutoPageSize: true with pageSize in paginationPanels hides page size selector', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationAutoPageSize: true,
                paginationPanels: ['pageSize', 'pageSummary'],
            });
            const panel = getPagingPanel(api)!;
            // Component is created but hidden so it can be shown if paginationAutoPageSize changes at runtime
            const pageSizeEl = panel.querySelector<HTMLElement>('.ag-paging-page-size');
            expect(pageSizeEl).not.toBeNull();
            expect(pageSizeEl).toHaveClass('ag-hidden');
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
        });

        test('panel hides when only pageSize is configured and paginationPageSizeSelector is false', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: false,
                paginationPanels: ['pageSize'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
        });

        test('panel hides when only pageSize is configured and paginationAutoPageSize is true', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationAutoPageSize: true,
                paginationPanels: ['pageSize'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
        });

        test('panel becomes visible when paginationPageSizeSelector flips back to an array', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: false,
                paginationPanels: ['pageSize'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');

            api.setGridOption('paginationPageSizeSelector', [10, 20, 50]);

            expect(panel).not.toHaveClass('ag-hidden');
        });
    });

    describe('runtime option changes', () => {
        describe('pagination', () => {
            test('panel hides when pagination changes from true to false', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;
                expect(panel).not.toHaveClass('ag-hidden');

                api.setGridOption('pagination', false);

                expect(panel).toHaveClass('ag-hidden');
            });

            test('panel shows when pagination changes from false to true', () => {
                const api = createPaginationGrid(gridsManager, { pagination: false });
                const panel = getPagingPanel(api)!;
                expect(panel).toHaveClass('ag-hidden');

                api.setGridOption('pagination', true);

                expect(panel).not.toHaveClass('ag-hidden');
            });

            test('row summary updates after pagination is re-enabled', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;

                api.setGridOption('pagination', false);
                api.setGridOption('pagination', true);

                const numbers = panel.querySelectorAll('.ag-paging-row-summary-panel-number');
                expect(numbers[0].textContent).toBe('1');
                expect(numbers[2].textContent).toBe('50');
            });

            test('page navigation works after pagination is re-enabled', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;

                api.setGridOption('pagination', false);
                api.setGridOption('pagination', true);

                const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
                nextBtn.click();
                expect(api.paginationGetCurrentPage()).toBe(1);
            });
        });

        describe('suppressPaginationPanel', () => {
            test('panel hides when suppressPaginationPanel changes from false to true', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;
                expect(panel).not.toHaveClass('ag-hidden');

                api.setGridOption('suppressPaginationPanel', true);

                expect(panel).toHaveClass('ag-hidden');
            });

            test('panel shows when suppressPaginationPanel changes from true to false', () => {
                const api = createPaginationGrid(gridsManager, { suppressPaginationPanel: true });
                const panel = getPagingPanel(api)!;
                expect(panel).toHaveClass('ag-hidden');

                api.setGridOption('suppressPaginationPanel', false);

                expect(panel).not.toHaveClass('ag-hidden');
            });

            test('page size selector remains visible after panel is unsuppressed', () => {
                // suppressPaginationPanel hides the parent panel; the child's own visibility is
                // governed by paginationPageSizeSelector/paginationAutoPageSize only.
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;

                api.setGridOption('suppressPaginationPanel', true);
                api.setGridOption('suppressPaginationPanel', false);

                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass('ag-hidden');
            });
        });

        describe('paginationPageSizeSelector', () => {
            test('page size selector hides when paginationPageSizeSelector changes to false', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;

                api.setGridOption('paginationPageSizeSelector', false);

                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');
                // Other components keep the panel visible
                expect(panel).not.toHaveClass('ag-hidden');
            });

            test('page size selector shows when paginationPageSizeSelector changes from false to array', () => {
                const api = createPaginationGrid(gridsManager, { paginationPageSizeSelector: false });
                const panel = getPagingPanel(api)!;
                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');

                api.setGridOption('paginationPageSizeSelector', [10, 20, 50]);

                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass('ag-hidden');
            });
        });

        describe('paginationAutoPageSize', () => {
            test('page size selector appears when paginationAutoPageSize changes from true to false', () => {
                const api = createPaginationGrid(gridsManager, {
                    paginationAutoPageSize: true,
                    paginationPanels: ['pageSize', 'pageSummary'],
                });
                const panel = getPagingPanel(api)!;
                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');

                api.setGridOption('paginationAutoPageSize', false);

                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass('ag-hidden');
            });

            test('page size selector hides when paginationAutoPageSize changes from false to true', () => {
                const api = createPaginationGrid(gridsManager, {
                    paginationPanels: ['pageSize', 'pageSummary'],
                });
                const panel = getPagingPanel(api)!;
                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass('ag-hidden');

                api.setGridOption('paginationAutoPageSize', true);

                expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');
                // pageSummary keeps the panel visible
                expect(panel).not.toHaveClass('ag-hidden');
            });
        });

        describe('paginationPanels', () => {
            test('reorders components when paginationPanels changes', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;
                let children = getChildElements(panel);
                expect(children[0].classList.contains('ag-paging-page-size')).toBe(true);
                expect(children[2].classList.contains('ag-paging-page-summary-panel')).toBe(true);

                api.setGridOption('paginationPanels', ['pageSummary', 'rowSummary', 'pageSize']);

                children = getChildElements(panel);
                expect(children[0].classList.contains('ag-paging-page-summary-panel')).toBe(true);
                expect(children[1].classList.contains('ag-paging-row-summary-panel')).toBe(true);
                expect(children[2].classList.contains('ag-paging-page-size')).toBe(true);
            });

            test('hides components when removed from paginationPanels', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;
                expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
                expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeTruthy();

                api.setGridOption('paginationPanels', ['pageSummary']);

                expect(panel.querySelector('.ag-paging-page-size')).toBeNull();
                expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeNull();
                expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
            });

            test('empty array hides panel; non-empty array restores it', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;
                expect(panel).not.toHaveClass('ag-hidden');

                api.setGridOption('paginationPanels', []);
                expect(panel).toHaveClass('ag-hidden');
                expect(getChildElements(panel)).toHaveLength(0);

                api.setGridOption('paginationPanels', ['pageSummary']);
                expect(panel).not.toHaveClass('ag-hidden');
                expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
            });

            test('navigation still works after rebuild', () => {
                const api = createPaginationGrid(gridsManager);
                const panel = getPagingPanel(api)!;

                api.setGridOption('paginationPanels', ['pageSummary', 'rowSummary']);

                const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
                nextBtn.click();
                expect(api.paginationGetCurrentPage()).toBe(1);

                const numbers = panel.querySelectorAll('.ag-paging-row-summary-panel-number');
                expect(numbers[0].textContent).toBe('11');
                expect(numbers[1].textContent).toBe('20');
            });
        });
    });

    describe('suppressPageInput', () => {
        test('default (no config): page summary renders an input field', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).not.toBeNull();
        });

        test('string "pageSummary": page summary renders an input field', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSummary'] });
            const panel = getPagingPanel(api)!;
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).not.toBeNull();
        });

        test('{ type: "pageSummary" } with no suppressPageInput: renders an input field', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: [{ type: 'pageSummary' }],
            });
            const panel = getPagingPanel(api)!;
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).not.toBeNull();
        });

        test('suppressPageInput: true renders static span, not an input', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: [{ type: 'pageSummary', suppressPageInput: true }],
            });
            const panel = getPagingPanel(api)!;
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).toBeNull();
            const pageNumbers = pageSummary.querySelectorAll('.ag-paging-number');
            expect(pageNumbers[0].textContent).toBe('1'); // current page as static text
            expect(pageNumbers[1].textContent).toBe('5'); // total pages
        });

        test('suppressPageInput: true — navigation buttons still work', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: [{ type: 'pageSummary', suppressPageInput: true }],
            });
            const panel = getPagingPanel(api)!;
            const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
            nextBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(1);

            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            const pageNumbers = pageSummary.querySelectorAll('.ag-paging-number');
            expect(pageNumbers[0].textContent).toBe('2');
        });

        test('suppressPageInput: false renders an input field', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: [{ type: 'pageSummary', suppressPageInput: false }],
            });
            const panel = getPagingPanel(api)!;
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).not.toBeNull();
        });

        test('suppressPageInput: true mixed with other panels', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['rowSummary', { type: 'pageSummary', suppressPageInput: true }, 'pageSize'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            expect(pageSummary.querySelector('input')).toBeNull();
            expect(pageSummary.querySelectorAll('.ag-paging-number')[0].textContent).toBe('1');
        });
    });

    describe('object-based pageSize and rowSummary config', () => {
        function getPageSizeDisplayValue(panel: HTMLElement): string | undefined {
            return (
                panel.querySelector<HTMLElement>('.ag-paging-page-size .ag-picker-field-display')?.textContent ??
                undefined
            );
        }

        test('{ type: "pageSize" } renders the page size selector', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: [{ type: 'pageSize' }] });
            const panel = getPagingPanel(api)!;
            const pageSizeEl = panel.querySelector<HTMLElement>('.ag-paging-page-size');
            expect(pageSizeEl).toBeTruthy();
            expect(pageSizeEl).not.toHaveClass('ag-hidden');
        });

        test('{ type: "rowSummary" } renders the row summary', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: [{ type: 'rowSummary' }] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeTruthy();
            const numbers = panel.querySelectorAll('.ag-paging-row-summary-panel-number');
            expect(numbers[0].textContent).toBe('1');
            expect(numbers[2].textContent).toBe('50');
        });

        test('panel-level paginationPageSize overrides grid-level option', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSize: 20,
                paginationPanels: [{ type: 'pageSize', paginationPageSize: 50 }],
            });
            expect(api.paginationGetPageSize()).toBe(50);
            const panel = getPagingPanel(api)!;
            expect(getPageSizeDisplayValue(panel)).toBe('50');
        });

        test('grid-level paginationPageSize still applies when panel omits it', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSize: 20,
                paginationPanels: [{ type: 'pageSize' }],
            });
            expect(api.paginationGetPageSize()).toBe(20);
        });

        test('panel-level paginationPageSizeSelector: false hides selector despite grid-level array', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: [10, 20, 50],
                paginationPanels: [{ type: 'pageSize', paginationPageSizeSelector: false }, 'pageSummary'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');
        });

        test('panel-level paginationPageSizeSelector array shows selector despite grid-level false', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: false,
                paginationPanels: [{ type: 'pageSize', paginationPageSizeSelector: [10, 20, 50] }],
            });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass('ag-hidden');
        });

        test('panel-level config takes precedence over both grid-level options (ticket example)', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSize: 20,
                paginationPageSizeSelector: [10, 20, 50],
                paginationPanels: [
                    { type: 'pageSize', paginationPageSize: 100, paginationPageSizeSelector: [25, 50, 100] },
                ],
            });
            expect(api.paginationGetPageSize()).toBe(100);
            const panel = getPagingPanel(api)!;
            expect(getPageSizeDisplayValue(panel)).toBe('100');
        });

        test('panel-level paginationPageSize updates active page size and panel display when paginationPanels changes at runtime', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSize: 20,
                paginationPanels: ['pageSize'],
            });
            expect(api.paginationGetPageSize()).toBe(20);
            expect(getPageSizeDisplayValue(getPagingPanel(api)!)).toBe('20');

            api.setGridOption('paginationPanels', [{ type: 'pageSize', paginationPageSize: 50 }]);

            expect(api.paginationGetPageSize()).toBe(50);
            expect(getPageSizeDisplayValue(getPagingPanel(api)!)).toBe('50');
        });

        test('removing a panel page-size override preserves the user-selected page size', async () => {
            const userSession = userEvent.setup();
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: [10, 20, 50, 100],
                paginationPanels: [{ type: 'pageSize', paginationPageSize: 100 }],
            });
            expect(api.paginationGetPageSize()).toBe(100);

            const display = getPagingPanel(api)!.querySelector<HTMLElement>(
                '.ag-paging-page-size .ag-picker-field-display'
            )!;
            await userSession.click(display);
            await asyncSetTimeout(0);
            const option = Array.from(document.querySelectorAll('.ag-list-item')).find(
                (item) => item.textContent?.trim() === '50'
            );
            await userSession.click(option!);
            await asyncSetTimeout(0);
            expect(api.paginationGetPageSize()).toBe(50);

            api.setGridOption('paginationPanels', ['pageSize']);

            expect(api.paginationGetPageSize()).toBe(50);
            expect(getPageSizeDisplayValue(getPagingPanel(api)!)).toBe('50');
        });

        test('panel-level paginationPageSizeSelector: false hides the selector when paginationPanels changes at runtime', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPageSizeSelector: [10, 20, 50],
                paginationPanels: ['pageSize', 'pageSummary'],
            });
            expect(getPagingPanel(api)!.querySelector<HTMLElement>('.ag-paging-page-size')).not.toHaveClass(
                'ag-hidden'
            );

            api.setGridOption('paginationPanels', [
                { type: 'pageSize', paginationPageSizeSelector: false },
                'pageSummary',
            ]);

            expect(getPagingPanel(api)!.querySelector<HTMLElement>('.ag-paging-page-size')).toHaveClass('ag-hidden');
        });
    });

    describe('validation and edge cases', () => {
        const gridsManagerWithValidation = new TestGridsManager({
            modules: [ClientSideRowModelModule, PaginationModule, ValidationModule],
        });
        let consoleWarnSpy: MockInstance;

        beforeEach(() => {
            consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            gridsManagerWithValidation.reset();
        });

        afterEach(() => {
            gridsManagerWithValidation.reset();
            consoleWarnSpy.mockRestore();
        });

        test('duplicate items: only first occurrence is rendered', () => {
            const api = createPaginationGrid(gridsManagerWithValidation, {
                paginationPanels: ['pageSize', 'pageSize', 'pageSummary'],
            });

            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children).toHaveLength(2);
            expect(children[0].classList.contains('ag-paging-page-size')).toBe(true);
            expect(children[1].classList.contains('ag-paging-page-summary-panel')).toBe(true);
        });

        test('unrecognised items are ignored, warning logged', () => {
            const api = createPaginationGrid(gridsManagerWithValidation, {
                paginationPanels: ['pageSize', 'invalidName' as any, 'pageSummary'],
            });

            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children).toHaveLength(2);
            expect(children[0].classList.contains('ag-paging-page-size')).toBe(true);
            expect(children[1].classList.contains('ag-paging-page-summary-panel')).toBe(true);

            expect(
                consoleWarnSpy.mock.calls.some((c) =>
                    c.join(' ').includes('`paginationPanels` expects an array of panel names')
                )
            ).toBe(true);
        });

        test('single component pageSummary renders and functions correctly in isolation', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSummary'] });
            expect(api.paginationGetCurrentPage()).toBe(0);

            const panel = getPagingPanel(api)!;
            const nextBtn = panel.querySelector<HTMLElement>('[aria-label="Next Page"]')!;
            nextBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(1);

            const firstBtn = panel.querySelector<HTMLElement>('[aria-label="First Page"]')!;
            firstBtn.click();
            expect(api.paginationGetCurrentPage()).toBe(0);
        });
    });
});
