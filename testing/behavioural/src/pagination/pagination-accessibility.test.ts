import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { GridApi, GridOptions, IDatasource, IGetRowsParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    LocaleModule,
    PaginationModule,
    RenderApiModule,
    getGridElement,
} from 'ag-grid-community';

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

const getPagingPanel = (api: GridApi) => getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-panel')!;

/** The grid's live region is the root wrapper's direct child. Zero-width spaces are stripped from its text. */
const getLiveRegionText = (api: GridApi): string =>
    (
        getGridElement(api)!.querySelector('.ag-root-wrapper > .ag-aria-description-container')?.textContent ?? ''
    ).replaceAll('\u200B', '');

const waitForAnnouncement = (api: GridApi, expected: string) =>
    waitFor(() => expect(getLiveRegionText(api)).toContain(expected));

/** `beans` is private on `RowNode`; reaching the announcement bean through it is the only route from a test. */
const getAriaAnnounce = (api: GridApi) => (api.getDisplayedRowAtIndex(0) as any).beans.ariaAnnounce;

describe('pagination accessibility', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, InfiniteRowModelModule, LocaleModule, PaginationModule, RenderApiModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    describe('navigation landmark', () => {
        test('paging panel is a nav element labelled "Grid pagination" by default', () => {
            const api = createPaginationGrid(gridsManager);
            const panel = getPagingPanel(api);

            expect(panel.tagName).toBe('NAV');
            expect(panel.getAttribute('aria-label')).toBe('Grid pagination');
        });

        test('paging panel label honours ariaPaginationPanelLabel localeText', () => {
            const api = createPaginationGrid(gridsManager, {
                localeText: { ariaPaginationPanelLabel: 'Orders pagination' },
            });

            expect(getPagingPanel(api).getAttribute('aria-label')).toBe('Orders pagination');
        });
    });

    describe('page size selector description', () => {
        const getDescription = (api: GridApi) => {
            const combobox = getGridElement(api)!.querySelector<HTMLElement>(
                '.ag-paging-page-size .ag-picker-field-wrapper'
            )!;
            expect(combobox.getAttribute('role')).toBe('combobox');
            const describedBy = combobox.getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            return document.getElementById(describedBy!);
        };

        test('combobox aria-describedby resolves to the default description', () => {
            const api = createPaginationGrid(gridsManager);

            expect(getDescription(api)?.textContent).toBe('Changing the page size updates the rows shown in the grid');
        });

        test('description honours ariaPageSizeSelectorDescription localeText', () => {
            const api = createPaginationGrid(gridsManager, {
                localeText: { ariaPageSizeSelectorDescription: 'Changes how many orders are listed' },
            });

            expect(getDescription(api)?.textContent).toBe('Changes how many orders are listed');
        });
    });

    describe('row summary announcement', () => {
        test('announces a full sentence after changing page with no localeText', async () => {
            const api = createPaginationGrid(gridsManager);

            api.paginationGoToNextPage();

            await waitForAnnouncement(api, 'Showing records 11 to 20 of 50');
            const text = getLiveRegionText(api);
            expect(text).toContain('Page 2 of 5');
            expect(text).not.toContain('${variable}');
        });

        test('honours ariaPaginationRowSummary localeText', async () => {
            const api = createPaginationGrid(gridsManager, {
                localeText: { ariaPaginationRowSummary: 'Rows ${variable}-${variable} / ${variable}' },
            });

            await waitForAnnouncement(api, 'Rows 1-10 / 50');
        });

        test('does not repeat the row announcement on unrelated refreshes', async () => {
            const api = createPaginationGrid(gridsManager);
            await waitForAnnouncement(api, 'Showing records 1 to 10 of 50');

            const spy = vi.spyOn(getAriaAnnounce(api), 'announceValue');
            const rowCalls = () => spy.mock.calls.filter(([, key]) => key === 'paginationRow');

            api.refreshCells({ force: true });
            api.setGridOption('columnDefs', [{ field: 'name', headerName: 'Name' }]);
            await asyncSetTimeout(0);
            expect(rowCalls()).toHaveLength(0);

            api.paginationGoToNextPage();
            await asyncSetTimeout(0);
            expect(rowCalls()).toEqual([['Showing records 11 to 20 of 50', 'paginationRow']]);
        });
    });

    describe('row summary announcement with unknown total (infinite row model)', () => {
        const createInfiniteGrid = (datasource: IDatasource) =>
            gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_DEFS,
                rowModelType: 'infinite',
                datasource,
                pagination: true,
                paginationPageSize: 10,
                paginationPageSizeSelector: [10, 20],
                cacheBlockSize: 100,
            });

        test('announces "total unknown" once a page is loaded without a known last row', async () => {
            const api = createInfiniteGrid({
                getRows: (params: IGetRowsParams) => {
                    const rows = Array.from({ length: params.endRow - params.startRow }, (_, i) => ({
                        name: `Row ${params.startRow + i + 1}`,
                    }));
                    params.successCallback(rows, -1);
                },
            });

            await waitForAnnouncement(api, 'Showing records 1 to 10, total unknown');
            expect(getLiveRegionText(api)).not.toContain('more');
        });

        test('announces "Loading records from 1" while the first block is pending', async () => {
            const api = createInfiniteGrid({ getRows: () => {} });

            await waitForAnnouncement(api, 'Loading records from 1');
            expect(getLiveRegionText(api)).not.toContain('?');
        });
    });
});
