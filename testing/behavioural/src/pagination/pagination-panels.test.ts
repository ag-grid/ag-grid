import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, ValidationModule, getGridElement } from 'ag-grid-community';

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

function getButtonIconName(panel: HTMLElement, ariaLabel: string): string | undefined {
    const btn = panel.querySelector<HTMLElement>(`[aria-label="${ariaLabel}"]`);
    const icon = btn?.querySelector<HTMLElement>('.ag-icon');
    // Icon class is "ag-icon ag-icon-{name}", extract the name
    return Array.from(icon?.classList ?? [])
        .find((cls) => cls.startsWith('ag-icon-'))
        ?.replace('ag-icon-', '');
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
