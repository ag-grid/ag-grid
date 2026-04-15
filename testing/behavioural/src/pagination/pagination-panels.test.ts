import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule, getGridElement } from 'ag-grid-community';
import { PaginationModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

const COLUMN_DEFS = [{ field: 'name' }];
const ROW_DATA = Array.from({ length: 50 }, (_, i) => ({ name: `Row ${i + 1}` }));

function createPaginationGrid(gridsManager: TestGridsManager, options: Partial<GridOptions> = {}) {
    return gridsManager.createGrid('myGrid', {
        columnDefs: COLUMN_DEFS,
        rowData: ROW_DATA,
        pagination: true,
        paginationPageSize: 10,
        ...options,
    });
}

function getPagingPanel(api: ReturnType<typeof createPaginationGrid>): HTMLElement | null {
    return getGridElement(api)!.querySelector('.ag-paging-panel');
}

function getChildElements(panel: HTMLElement): Element[] {
    return Array.from(panel.children).filter((el) => !el.classList.contains('ag-tab-guard'));
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

            // Page summary IDs
            const pageSummary = panel.querySelector('.ag-paging-page-summary-panel')!;
            const pageIds = Array.from(pageSummary.querySelectorAll('[id]')).map((el) => el.id);
            expect(pageIds.length).toBeGreaterThan(0);
            for (const id of pageIds) {
                expect(id).toMatch(new RegExp(`^${panelId}-`));
            }
        });

        test('page summary displays correct values', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api)!;
            const pageNumbers = panel.querySelectorAll('.ag-paging-page-summary-panel .ag-paging-number');
            expect(pageNumbers[0].textContent).toBe('1'); // current page
            expect(pageNumbers[1].textContent).toBe('5'); // total pages
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

        test('panel is hidden when paginationPanels: ["pageSize"] and paginationAutoPageSize: true', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationPanels: ['pageSize'],
                paginationAutoPageSize: true,
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
        });

        test('pageSize and pageSummary present when paginationPanels: ["pageSize", "pageSummary"]', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSize', 'pageSummary'] });
            const panel = getPagingPanel(api)!;
            expect(panel.querySelector('.ag-paging-page-size')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-page-summary-panel')).toBeTruthy();
            expect(panel.querySelector('.ag-paging-row-summary-panel')).toBeNull();
        });

        test('panel is hidden when paginationPanels is empty array', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: [] });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');
        });

        test('hidden components leave no residual DOM elements', () => {
            const api = createPaginationGrid(gridsManager, { paginationPanels: ['pageSummary'] });
            const panel = getPagingPanel(api)!;
            const children = getChildElements(panel);
            expect(children).toHaveLength(1);
            expect(children[0].classList.contains('ag-paging-page-summary-panel')).toBe(true);
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
    });

    describe('runtime option changes', () => {
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

        test('panel becomes visible when paginationAutoPageSize changes from true to false (pageSize-only panel)', () => {
            const api = createPaginationGrid(gridsManager, {
                paginationAutoPageSize: true,
                paginationPanels: ['pageSize'],
            });
            const panel = getPagingPanel(api)!;
            expect(panel).toHaveClass('ag-hidden');

            api.setGridOption('paginationAutoPageSize', false);

            expect(panel).not.toHaveClass('ag-hidden');
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

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("'paginationPanels' expects an array of panel names")
            );
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
