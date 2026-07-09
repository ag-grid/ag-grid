import type { GetRowIdParams, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createFakeServer } from '../../columnToolPanel/deferredPivotModeFakeServer';
import { GridColumns, GridRows, TestGridsManager, waitForEvent, waitForNoLoadingRows } from '../../test-utils';

/**
 * CHARACTERIZATION tests (golden-master) pinning the CURRENT behaviour of SSRM grand-total /
 * footer rows while in PIVOT mode. These tests document what the grid actually does today —
 * the `needsGrandTotal` request flag, `grandTotalRow` positioning (top / bottom) and the pivoted
 * aggregate values carried on the total row across the generated pivot-result columns. Any
 * assertion here reflects observed mechanics, not a specification: if behaviour looks buggy it is
 * still pinned as the baseline so a future change surfaces as a diff.
 */
describe('SSRM pivot grand total row (characterization)', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => {
        gridManager.reset();
    });

    interface OlympicRow {
        country: string;
        year: number;
        gold: number;
    }

    const rowData: OlympicRow[] = [
        { country: 'USA', year: 2000, gold: 1 },
        { country: 'USA', year: 2004, gold: 2 },
        { country: 'Russia', year: 2000, gold: 3 },
        { country: 'Russia', year: 2004, gold: 4 },
    ];

    // Column setup: country row-group, year pivot, gold summed.
    const columnDefs = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', pivot: true },
        { field: 'gold', aggFunc: 'sum' },
    ];

    // SSRM grouping requires a getRowId; group rows keyed by country, grand-total by its sentinel id.
    const getRowId = (params: GetRowIdParams): string => {
        const data = params.data as any;
        if (data?.id === GRAND_TOTAL_ROW_ID) {
            return GRAND_TOTAL_ROW_ID;
        }
        return [...(params.parentKeys ?? []), data.country].join('-');
    };

    // Wrap the Olympic pivot fake server so it honours needsGrandTotal: when requested, it computes
    // the pivoted aggregate over ALL rows (grouping stripped) and returns it as a grand-total row.
    function createPivotDatasourceWithGrandTotal(): {
        datasource: IServerSideDatasource;
        calls: { needsGrandTotal: boolean; groupKeys: string[]; pivotMode?: boolean; pivotColIds: string[] }[];
    } {
        const server = createFakeServer(rowData as any);
        const calls: {
            needsGrandTotal: boolean;
            groupKeys: string[];
            pivotMode?: boolean;
            pivotColIds: string[];
        }[] = [];
        const datasource: IServerSideDatasource = {
            getRows(params: IServerSideGetRowsParams) {
                const { request } = params;
                calls.push({
                    needsGrandTotal: params.needsGrandTotal,
                    groupKeys: [...request.groupKeys],
                    pivotMode: request.pivotMode,
                    pivotColIds: (request.pivotCols ?? []).map((c) => c.id),
                });

                const response = server.getData(request);
                const rows: any[] = [...response.rows];

                if (params.needsGrandTotal) {
                    // Pivoted grand total = aggregate over all rows with grouping removed.
                    const totalResponse = server.getData({ ...request, rowGroupCols: [], groupKeys: [] });
                    const totalRow = { ...(totalResponse.rows[0] ?? {}), id: GRAND_TOTAL_ROW_ID };
                    rows.push(totalRow);
                }

                setTimeout(() => {
                    params.success({
                        rowData: rows,
                        rowCount: response.lastRow,
                        pivotResultFields: response.pivotResultFields,
                    });
                }, 0);
            },
        };
        return { datasource, calls };
    }

    // Scenario 1: pivot mode + grandTotalRow:'bottom'. Pin the grand-total row, its position at the
    // bottom, the pivot flags on the request, and the pivoted total values / pivot result columns.
    test('grand total at bottom in pivot mode', async () => {
        const { datasource, calls } = createPivotDatasourceWithGrandTotal();
        const api = gridManager.createGrid(null, {
            columnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
            getRowId,
            grandTotalRow: 'bottom',
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Root store request carried pivot flags and needsGrandTotal.
        const rootCall = calls.find((c) => c.groupKeys.length === 0)!;
        expect(rootCall.pivotMode).toBe(true);
        expect(rootCall.pivotColIds).toEqual(['year']);
        expect(rootCall.needsGrandTotal).toBe(true);

        // Pivot result columns generated from the pivot key + value col.
        await new GridColumns(api, 'pivot grand total bottom columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── 2000_gold "Gold" width:200
            └─┬ "2004" GROUP
              └── 2004_gold "Gold" width:200
        `);

        // Grand total footer renders at the bottom. checkDom is disabled here because the pivoted
        // total values diverge between the row model and the rendered DOM (see assertions below):
        // the row-model / diagram reads null for the footer's pivot columns while the DOM renders
        // the aggregated numbers. This is a latent-bug-shaped discrepancy pinned as baseline.
        await new GridRows(api, 'pivot grand total bottom', { checkDom: false }).check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            ├── GROUP-leafGroup collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
        `);

        // The grand-total footer node exists, is a footer, and its raw data carries the pivoted
        // totals (2000 gold = 1+3 = 4, 2004 gold = 2+4 = 6) even though the diagram shows null.
        const grandTotal = api.getRowNode(GRAND_TOTAL_ROW_ID);
        expect(grandTotal?.footer).toBe(true);
        expect(grandTotal?.data?.['2000_gold']).toBe(4);
        expect(grandTotal?.data?.['2004_gold']).toBe(6);
    });

    // Scenario 2: grandTotalRow:'top' in pivot mode flips the total row to the top.
    test('grand total at top in pivot mode', async () => {
        const { datasource } = createPivotDatasourceWithGrandTotal();
        const api = gridManager.createGrid(null, {
            columnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
            getRowId,
            grandTotalRow: 'top',
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'pivot grand total top', { checkDom: false }).check(`
            ROOT id:<no-id>
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
            ├── GROUP-leafGroup collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            └── GROUP-leafGroup collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
        `);
    });

    // Scenario 3: grand total alongside an expanded row group in pivot mode — pin how group rows and
    // the grand total render together.
    test('grand total with expanded row group in pivot mode', async () => {
        const { datasource } = createPivotDatasourceWithGrandTotal();
        const api = gridManager.createGrid(null, {
            columnDefs,
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: datasource,
            getRowId,
            grandTotalRow: 'bottom',
            groupTotalRow: 'bottom',
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Collapsed groups + grand total.
        await new GridRows(api, 'pivot grand total groups collapsed', { checkDom: false }).check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            ├── GROUP-leafGroup collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
        `);

        // In pivot mode the sole row-group level (country) is a LEAF group: it is not expandable, so
        // setExpanded(true) is a no-op and no group-total rows appear despite groupTotalRow:'bottom'.
        const usa = api.getRowNode('USA')!;
        expect(usa.leafGroup).toBe(true);
        expect(usa.isExpandable()).toBe(false);
        usa.setExpanded(true);
        await waitForNoLoadingRows(api);
        expect(usa.expanded).toBe(false);

        // Rows are unchanged: leaf group stays collapsed, only the grand total footer is present.
        await new GridRows(api, 'pivot grand total group expanded', { checkDom: false }).check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:4
            ├── GROUP-leafGroup collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:1 2004_gold:2
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total "
        `);
    });
});
