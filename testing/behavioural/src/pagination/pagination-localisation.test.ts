import { AG_GRID_LOCALE_JA_JP, AG_GRID_LOCALE_ZH_CN } from '@ag-grid-community/locale';
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions, IDatasource, IGetRowsParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    LocaleModule,
    PaginationModule,
    PaginationPageNumbersModule,
    getGridElement,
} from 'ag-grid-community';

const COLUMN_DEFS = [{ field: 'name' }];
const ROW_DATA = Array.from({ length: 50 }, (_, i) => ({ name: `Row ${i + 1}` }));

const getPageSummary = (api: GridApi) =>
    getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-page-summary-panel .ag-paging-description')!;

/** The page input's wrapper holds whitespace of its own, so runs of whitespace are collapsed. */
const getPageSummaryText = (api: GridApi) => getPageSummary(api).textContent!.replace(/\s+/g, ' ').trim();

const getPageInput = (api: GridApi) => getPageSummary(api).querySelector<HTMLInputElement>('input')!;

/** The page number input and total, in DOM order. */
const getPageSummaryRefs = (api: GridApi) =>
    Array.from(getPageSummary(api).querySelectorAll<HTMLElement>(':scope > .ag-paging-number'), (el) => el.dataset.ref);

const getRowSummary = (api: GridApi) =>
    getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-row-summary-content')!;

/** The data-refs of the number spans, in DOM order. */
const getNumberRefs = (api: GridApi) =>
    Array.from(getRowSummary(api).querySelectorAll<HTMLElement>('.ag-paging-row-summary-panel-number'), (span) => [
        span.dataset.ref,
        span.textContent,
    ]);

/** Zero-width spaces are stripped from the live region's text. */
const getLiveRegionText = (api: GridApi): string =>
    (
        getGridElement(api)!.querySelector('.ag-root-wrapper > .ag-aria-description-container')?.textContent ?? ''
    ).replaceAll('​', '');

const waitForAnnouncement = (api: GridApi, expected: string) =>
    waitFor(() => expect(getLiveRegionText(api)).toContain(expected));

const unknownTotalDatasource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
        const rows = Array.from({ length: params.endRow - params.startRow }, (_, i) => ({
            name: `Row ${params.startRow + i + 1}`,
        }));
        params.successCallback(rows, -1);
    },
};

describe('pagination localisation', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            InfiniteRowModelModule,
            LocaleModule,
            PaginationModule,
            PaginationPageNumbersModule,
        ],
    });

    const createGrid = (options: Partial<GridOptions> = {}) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: COLUMN_DEFS,
            rowData: ROW_DATA,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: false,
            ...options,
        });

    const createInfiniteGrid = (datasource: IDatasource, options: Partial<GridOptions> = {}) =>
        createGrid({ rowData: undefined, rowModelType: 'infinite', datasource, cacheBlockSize: 100, ...options });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('visible row summary', () => {
        test('en-US is unchanged', () => {
            const api = createGrid();

            expect(getRowSummary(api).textContent).toBe('1 to 10 of 50');
            expect(getNumberRefs(api)).toEqual([
                ['lbFirstRowOnPage', '1'],
                ['lbLastRowOnPage', '10'],
                ['lbRecordCount', '50'],
            ]);
        });

        test('ja-JP puts the total first and keeps the number spans', () => {
            const api = createGrid({ localeText: AG_GRID_LOCALE_JA_JP });

            expect(getRowSummary(api).textContent).toBe('全50件中 1～10件');
            expect(getNumberRefs(api)).toEqual([
                ['lbRecordCount', '50'],
                ['lbFirstRowOnPage', '1'],
                ['lbLastRowOnPage', '10'],
            ]);
            expect(getRowSummary(api).querySelector('[data-ref="lbRecordCount"]')!.id).toMatch(/-row-count$/);
        });

        test('zh-CN reads as one phrase', () => {
            const api = createGrid({ localeText: AG_GRID_LOCALE_ZH_CN });

            expect(getRowSummary(api).textContent).toBe('第 1 至 10 条，共 50 条');
        });

        test('ja-JP unknown total leaves out the count rather than framing "more" as a total', async () => {
            const api = createInfiniteGrid(unknownTotalDatasource, { localeText: AG_GRID_LOCALE_JA_JP });

            await waitFor(() => expect(getRowSummary(api).textContent).toBe('1～10件（総件数不明）'));
            expect(getRowSummary(api).textContent).not.toContain('もっと');
            expect(getRowSummary(api).querySelector('[data-ref="lbRecordCount"]')).toBeNull();
        });

        test('ja-JP unknown total while the first block loads', async () => {
            const api = createInfiniteGrid({ getRows: () => {} }, { localeText: AG_GRID_LOCALE_JA_JP });

            await waitFor(() => expect(getRowSummary(api).textContent).toBe('1～?件（総件数不明）'));
        });

        test('en-US unknown total is unchanged', async () => {
            const api = createInfiniteGrid(unknownTotalDatasource);

            await waitFor(() => expect(getRowSummary(api).textContent).toBe('1 to 10 of more'));
        });

        test('a localeText with only "to" and "of" reads as before', () => {
            const api = createGrid({ localeText: { to: 'à', of: 'sur' } });

            expect(getRowSummary(api).textContent).toBe('1 à 10 sur 50');
        });

        test('a custom value written with ${variable} fills as plain text without number spans', () => {
            const api = createGrid({
                localeText: { paginationRowSummary: '${variable} - ${variable} / ${variable}' },
            });

            expect(getRowSummary(api).textContent).toBe('1 - 10 / 50');
            expect(getNumberRefs(api)).toEqual([]);
        });

        test('a repeated token gets one span and renders the repeat as text', () => {
            const api = createGrid({ localeText: { paginationRowSummary: '${first} (${first}) of ${count}' } });

            expect(getRowSummary(api).textContent).toBe('1 (1) of 50');
            expect(getNumberRefs(api)).toEqual([
                ['lbFirstRowOnPage', '1'],
                ['lbRecordCount', '50'],
            ]);
        });

        test('formatted values are inserted literally', () => {
            const api = createGrid({ paginationNumberFormatter: ({ value }) => `$&${value}` });

            expect(getRowSummary(api).textContent).toBe('$&1 to $&10 of $&50');
        });

        test('a getLocaleText callback that upper-cases the default still fills the tokens', async () => {
            const api = createGrid({ getLocaleText: ({ defaultValue }) => defaultValue.toUpperCase() });

            expect(getRowSummary(api).textContent).toBe('1 TO 10 OF 50');
            await waitForAnnouncement(api, 'PAGE 1 OF 5');
            expect(getLiveRegionText(api)).not.toContain('${');
        });
    });

    describe('visible page summary', () => {
        test('en-US is unchanged', () => {
            const api = createGrid();

            expect(getPageSummaryText(api)).toBe('Page of 5');
            expect(getPageSummaryRefs(api)).toEqual(['lbCurrentInput', 'lbTotal']);
            expect(getPageInput(api).getAttribute('aria-label')).toBe('Page number, 1 of 5');
        });

        test('a translation can put the total before the page input, and phrase the input label', () => {
            const api = createGrid({
                localeText: {
                    paginationPageSummary: '全${total}ページ中 ${page}ページ目',
                    ariaPaginationPageInputLabel: 'ページ番号、${total}ページ中${page}ページ目',
                },
            });

            expect(getPageSummaryText(api)).toBe('全5ページ中 ページ目');
            expect(getPageSummaryRefs(api)).toEqual(['lbTotal', 'lbCurrentInput']);
            expect(getPageInput(api).getAttribute('aria-label')).toBe('ページ番号、5ページ中1ページ目');
        });

        test('a repeated token is filled with the current value as the page changes', async () => {
            const api = createGrid({
                localeText: { paginationPageSummary: 'Page ${page} of ${total} (page ${page})' },
            });

            expect(getPageSummaryText(api)).toBe('Page of 5 (page 1)');
            expect(getPageSummaryRefs(api)).toEqual(['lbCurrentInput', 'lbTotal']);

            api.paginationGoToNextPage();

            await waitFor(() => expect(getPageSummaryText(api)).toBe('Page of 5 (page 2)'));
        });

        test.each([
            {
                order: 'the total moves before the input',
                unknownTotal: 'Page ${page} of ${total}',
                known: '${total} pages, page ${page}',
                before: 'Page of more',
                after: '5 pages, page',
            },
            {
                order: 'the input moves before the total',
                unknownTotal: '${total}: page ${page}',
                known: 'Page ${page} of ${total}',
                before: 'more: page',
                after: 'Page of 5',
            },
        ])('the page input keeps focus when the total becomes known and $order', async (phrases) => {
            const api = createInfiniteGrid(unknownTotalDatasource, {
                localeText: {
                    paginationPageSummaryUnknownTotal: phrases.unknownTotal,
                    paginationPageSummary: phrases.known,
                },
            });
            await waitFor(() => expect(getPageSummaryText(api)).toBe(phrases.before));
            const input = getPageInput(api);
            input.focus();

            api.setRowCount(50, true);

            await waitFor(() => expect(getPageSummaryText(api)).toBe(phrases.after));
            expect(document.activeElement).toBe(input);
        });
    });

    describe('announcements', () => {
        test('ja-JP row and page announcements, joined by the Japanese separator', async () => {
            const api = createGrid({ localeText: AG_GRID_LOCALE_JA_JP });

            await waitForAnnouncement(api, '5ページ中1ページ目');
            expect(getLiveRegionText(api)).toContain('1～10件目のレコードを表示中（全50件）。5ページ中1ページ目');
        });

        test('en-US keeps ". " between announcements', async () => {
            const api = createGrid();

            await waitForAnnouncement(api, 'Showing records 1 to 10 of 50. Page 1 of 5');
        });

        test('ja-JP page announcement with an unknown total', async () => {
            const api = createInfiniteGrid(unknownTotalDatasource, { localeText: AG_GRID_LOCALE_JA_JP });

            await waitForAnnouncement(api, '1ページ目');
            expect(getLiveRegionText(api)).not.toContain('ページ中');
        });

        test('a localeText with only "page" and "of" reads as before', async () => {
            const api = createGrid({ localeText: { page: 'Seite', of: 'von' } });

            await waitForAnnouncement(api, 'Seite 1 von 5');
        });

        describe('page numbers panel', () => {
            const pageNumbers: Partial<GridOptions> = { paginationPanels: ['pageNumbers'] };

            test('en-US', async () => {
                const api = createGrid(pageNumbers);

                await waitForAnnouncement(api, 'Page 1 of 5');
            });

            test('ja-JP', async () => {
                const api = createGrid({ ...pageNumbers, localeText: AG_GRID_LOCALE_JA_JP });

                await waitForAnnouncement(api, '5ページ中1ページ目');
            });

            test('unknown total leaves the total out', async () => {
                const api = createInfiniteGrid(unknownTotalDatasource, pageNumbers);

                await waitForAnnouncement(api, 'Page 1');
                expect(getLiveRegionText(api)).not.toContain('Page 1 of');
            });

            test('ja-JP unknown total', async () => {
                const api = createInfiniteGrid(unknownTotalDatasource, {
                    ...pageNumbers,
                    localeText: AG_GRID_LOCALE_JA_JP,
                });

                await waitForAnnouncement(api, '1ページ目');
                expect(getLiveRegionText(api)).not.toContain('ページ中');
            });
        });
    });
});
