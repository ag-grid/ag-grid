import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PaginationModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

/**
 * Issue: with `suppressPaginationPanel: true` the grid still validates `paginationPageSizeSelector`.
 *
 * Setup: ClientSideRowModel + Pagination, `pagination: true`, `suppressPaginationPanel: true`,
 * `paginationPageSize: 10` (not in the default selector [20, 50, 100]) and `paginationPageSizeSelector`
 * left at its default. The application supplies its own pagination controls.
 *
 * Expected: no warnings about `paginationPageSizeSelector`. `suppressPaginationPanel` hides the built-in
 * pagination panel (see the GridOptions API documentation of `suppressPaginationPanel`), so no page size
 * selector is shown and there is nothing to validate.
 *
 * Actual: warnings #94 ("paginationPageSize=10, but 10 is not included in the default
 * paginationPageSizeSelector=[20, 50, 100]") and #95 ("Either set paginationPageSizeSelector to an array
 * that includes 10 or to false ...") are logged, because the page size selector is built and validated
 * regardless of whether the panel is suppressed.
 *
 * Reported on: AG Grid React 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent using React 35.1.0 in June 2026
 * searched for "paginationPageSize paginationPageSizeSelector validation warning custom pagination controls
 * suppressPaginationPanel".
 */
describe('suppressPaginationPanel does not trigger page size selector warnings', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PaginationModule, ValidationModule],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('no selector warnings on creation', () => {
        enableDevValidations({ throwOn: [] as any });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        gridsManager.createGrid('grid', {
            columnDefs: [{ field: 'id' }],
            rowData: Array.from({ length: 50 }, (_, i) => ({ id: i })),
            pagination: true,
            suppressPaginationPanel: true,
            paginationPageSize: 10,
        });

        const output = () => warnSpy.mock.calls.flat().join('\n');
        const selectorWarnings = output()
            .split('\n')
            .filter((line) => /warning #9[45]\b/.test(line) || line.includes('paginationPageSizeSelector'));
        expect(selectorWarnings).toEqual([]);
    });
});
