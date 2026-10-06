import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    PaginationModule,
    PinnedRowModule,
    ScrollApiModule,
} from 'ag-grid-community';
import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { grandTotalBorders } from './grandTotalRowBorderDom';

interface Row {
    id: string;
    value: number;
}

const isGrandTotal = (node: IRowNode) => !!node.footer && node.level === -1;

describe('grand total row border classes', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            PaginationModule,
            PinnedRowModule,
            RowGroupingModule,
            ScrollApiModule,
        ],
    });

    function createGrid(options: GridOptions<Row>, rowCount = 3): Promise<GridApi<Row>> {
        return gridsManager.createGridAndWait<Row>('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'value', aggFunc: 'sum' }],
            rowData: Array.from({ length: rowCount }, (_, i) => ({ id: `r${i}`, value: i })),
            getRowId: (params) => params.data.id,
            ...options,
        });
    }

    const borders = (api: GridApi) => grandTotalBorders(TestGridsManager.getHTMLElement(api)!);

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('inline border and the row above it follow row changes and grandTotalRow switches', async () => {
        const api = await createGrid({ grandTotalRow: 'bottom', suppressStickyTotalRow: 'grand' });
        expect(borders(api)).toEqual({ scrolling: ['r2 above-total', 'TOTAL border-top'] });

        api.applyTransaction({ add: [{ id: 'r3', value: 3 }] });
        await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['r3 above-total', 'TOTAL border-top'] }));

        api.setGridOption('grandTotalRow', 'top');
        await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL border-bottom'] }));

        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await waitFor(() => expect(borders(api)).toEqual({ 'pinnedBottom (at edge)': ['TOTAL border-top'] }));

        api.setGridOption('grandTotalRow', 'bottom');
        await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['r3 above-total', 'TOTAL border-top'] }));
    });

    describe('pagination', () => {
        const pagination: GridOptions<Row> = {
            suppressStickyTotalRow: 'grand',
            pagination: true,
            paginationPageSizeSelector: false,
        };

        test('no border on a bottom grand total that is alone on its page', async () => {
            const api = await createGrid({ ...pagination, grandTotalRow: 'bottom', paginationPageSize: 3 });
            api.paginationGoToPage(1);
            await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL'] }));
        });

        test('no border on a top grand total that is alone on its page', async () => {
            const api = await createGrid({ ...pagination, grandTotalRow: 'top', paginationPageSize: 1 });
            await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL'] }));
        });
    });

    describe('pinned', () => {
        test('pinnedBottom alone', async () => {
            const api = await createGrid({ enableRowPinning: true, grandTotalRow: 'pinnedBottom' });
            await waitFor(() => expect(borders(api)).toEqual({ 'pinnedBottom (at edge)': ['TOTAL border-top'] }));
        });

        test('pinnedBottom below manually pinned rows', async () => {
            const api = await createGrid({
                enableRowPinning: true,
                grandTotalRow: 'pinnedBottom',
                isRowPinned: (node) => (node.id === 'r0' ? 'bottom' : null),
            });
            await waitFor(() =>
                expect(borders(api)).toEqual({ pinnedBottom: ['b-bottom-r0 above-total', 'TOTAL border-top'] })
            );
        });

        test('pinnedTop alone', async () => {
            const api = await createGrid({ enableRowPinning: true, grandTotalRow: 'pinnedTop' });
            await waitFor(() => expect(borders(api)).toEqual({ 'pinnedTop (at edge)': ['TOTAL border-bottom'] }));
        });

        test('pinnedTop above manually pinned rows', async () => {
            const api = await createGrid({
                enableRowPinning: true,
                grandTotalRow: 'pinnedTop',
                isRowPinned: (node) => (node.id === 'r0' ? 'top' : null),
            });
            await waitFor(() => expect(borders(api)).toEqual({ pinnedTop: ['TOTAL border-bottom'] }));
        });

        // The pinned order follows grandTotalRow, so a grand total manually pinned to the other end lands on the
        // body side of the other pinned rows. The source grand total also stays inline, as with any pinned row.
        test("manually pinned to top with grandTotalRow: 'bottom'", async () => {
            const api = await createGrid({
                enableRowPinning: true,
                grandTotalRow: 'bottom',
                suppressStickyTotalRow: 'grand',
                isRowPinned: (node) => (node.id === 'r0' || isGrandTotal(node) ? 'top' : null),
            });
            await waitFor(() =>
                expect(borders(api)).toEqual({
                    'pinnedTop (at edge)': ['TOTAL border-bottom'],
                    scrolling: ['r2 above-total', 'TOTAL border-top'],
                })
            );
        });

        test("manually pinned to bottom with grandTotalRow: 'top'", async () => {
            const api = await createGrid({
                enableRowPinning: true,
                grandTotalRow: 'top',
                suppressStickyTotalRow: 'grand',
                isRowPinned: (node) => (node.id === 'r0' || isGrandTotal(node) ? 'bottom' : null),
            });
            await waitFor(() =>
                expect(borders(api)).toEqual({
                    'pinnedBottom (at edge)': ['TOTAL border-top'],
                    scrolling: ['TOTAL border-bottom'],
                })
            );
        });
    });

    describe('sticky', () => {
        beforeAll(() => {
            // happy-dom offset dimensions are 0 by default, so the grand total would always stick
            mockGridLayout.useRealOffsetDimensions = true;
        });

        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
        });

        test('the row above is only marked once the grand total is inline', async () => {
            const api = await createGrid({ grandTotalRow: 'bottom' }, 100);
            await waitFor(() => expect(borders(api)).toEqual({ 'stickyBottom (at edge)': ['TOTAL border-top'] }));

            api.ensureIndexVisible(100, 'bottom');
            await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['r99 above-total', 'TOTAL border-top'] }));
        });
    });
});
