import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
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

    test('the border side follows grandTotalRow switches', async () => {
        const api = await createGrid({ grandTotalRow: 'bottom', suppressStickyTotalRow: 'grand' });
        expect(borders(api)).toEqual({ scrolling: ['TOTAL border-top'] });

        api.setGridOption('grandTotalRow', 'top');
        await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL border-bottom'] }));

        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await waitFor(() => expect(borders(api)).toEqual({ pinnedBottom: ['TOTAL border-top'] }));

        api.setGridOption('grandTotalRow', 'pinnedTop');
        await waitFor(() => expect(borders(api)).toEqual({ pinnedTop: ['TOTAL border-bottom'] }));

        api.setGridOption('grandTotalRow', 'bottom');
        await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL border-top'] }));
    });

    // The source grand total stays inline, as with any pinned row.
    test.each([
        { grandTotalRow: 'bottom', pinned: 'top', expected: { pinnedTop: 'border-bottom', scrolling: 'border-top' } },
        {
            grandTotalRow: 'top',
            pinned: 'bottom',
            expected: { pinnedBottom: 'border-top', scrolling: 'border-bottom' },
        },
    ] as const)(
        "manually pinned to $pinned with grandTotalRow: '$grandTotalRow'",
        async ({ grandTotalRow, pinned, expected }) => {
            const api = await createGrid({
                enableRowPinning: true,
                grandTotalRow,
                suppressStickyTotalRow: 'grand',
                isRowPinned: (node) => (isGrandTotal(node) ? pinned : null),
            });
            const expectedBorders = Object.fromEntries(
                Object.entries(expected).map(([container, side]) => [container, [`TOTAL ${side}`]])
            );
            await waitFor(() => expect(borders(api)).toEqual(expectedBorders));
        }
    );

    describe('sticky', () => {
        beforeAll(() => {
            // happy-dom offset dimensions are 0 by default, so the grand total would always stick
            mockGridLayout.useRealOffsetDimensions = true;
        });

        afterAll(() => {
            mockGridLayout.useRealOffsetDimensions = false;
        });

        test('a sticky grand total has the same border side as the inline one', async () => {
            const api = await createGrid({ grandTotalRow: 'bottom' }, 100);
            await waitFor(() => expect(borders(api)).toEqual({ stickyBottom: ['TOTAL border-top'] }));

            api.ensureIndexVisible(100, 'bottom');
            await waitFor(() => expect(borders(api)).toEqual({ scrolling: ['TOTAL border-top'] }));
        });
    });
});
