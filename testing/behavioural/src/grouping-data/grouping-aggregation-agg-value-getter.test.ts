import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, applyTransactionChecked } from 'ag-test-utils';

import type { AggValueGetterParams, ColDef, GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    NumberFilterModule,
    RenderApiModule,
    getGridElement,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ShowValuesAsModule, TreeDataModule } from 'ag-grid-enterprise';

interface SaleRow {
    id: string;
    country: string;
    year: number;
    units: number;
    revenue: number;
    unitPrice: number;
}

const SALES: SaleRow[] = [
    { id: '1', country: 'Ireland', year: 2000, units: 1, revenue: 10, unitPrice: 10 },
    { id: '2', country: 'Ireland', year: 2000, units: 3, revenue: 60, unitPrice: 20 },
    { id: '3', country: 'Ireland', year: 2004, units: 1, revenue: 40, unitPrice: 40 },
    { id: '4', country: 'Italy', year: 2000, units: 4, revenue: 20, unitPrice: 5 },
];

const groupNode = (api: GridApi, id: string): IRowNode => {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`row ${id} not found`);
    }
    return node;
};

const cellValue = (api: GridApi, id: string, colKey: string) =>
    api.getCellValue({ rowNode: groupNode(api, id), colKey });

const renderedText = (api: GridApi, rowId: string, colId: string) =>
    getGridElement(api)!.querySelector(`.ag-row[row-id="${rowId}"] [col-id="${colId}"]`)?.textContent;

describe('colDef.aggValueGetter', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            TreeDataModule,
            PivotModule,
            ShowValuesAsModule,
            NumberFilterModule,
            CsvExportModule,
            RenderApiModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const createGrid = (columnDefs: ColDef<SaleRow>[], options: GridOptions<SaleRow> = {}) =>
        gridsManager.createGrid('agg-value-getter', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                ...columnDefs,
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: SALES,
            ...options,
        });

    test('transforms the aggregate on group rows and the grand total, while parents aggregate raw aggregates', async () => {
        const api = createGrid(
            [{ field: 'revenue', aggFunc: 'sum', aggValueGetter: (params) => (params.aggValue as number) * 2 }],
            { grandTotalRow: 'bottom' }
        );

        // the getter doubles each level once: Ireland is 2 * (70 + 40), not 2 * (140 + 80)
        await new GridRows(api, 'doubled aggregates').check(`
            ROOT id:ROOT_NODE_ID revenue:260
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" revenue:220
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000 revenue:140
            │ │ ├── LEAF id:1 country:"Ireland" year:2000 revenue:10
            │ │ └── LEAF id:2 country:"Ireland" year:2000 revenue:60
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2004 ag-Grid-AutoColumn:2004 revenue:80
            │ · └── LEAF id:3 country:"Ireland" year:2004 revenue:40
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" revenue:40
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:2000 revenue:40
            │ · └── LEAF id:4 country:"Italy" year:2000 revenue:20
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " revenue:260
        `);
        // the stored aggregate is untouched
        expect(groupNode(api, 'row-group-country-Ireland').aggData.revenue).toBe(110);
        expect(groupNode(api, 'row-group-country-Ireland').getDataValue('revenue', 'data-raw')).toBeUndefined();
    });

    test('derives a weighted average from other aggregates, keeping the avg aggFunc for parents', () => {
        const calls: AggValueGetterParams[] = [];
        const api = createGrid([
            { field: 'units', aggFunc: 'sum' },
            { field: 'revenue', aggFunc: 'sum' },
            {
                field: 'unitPrice',
                aggFunc: 'avg',
                aggValueGetter: (params) => {
                    calls.push(params);
                    return params.aggData!.revenue / params.aggData!.units;
                },
            },
        ]);

        expect(cellValue(api, 'row-group-country-Ireland-year-2000', 'unitPrice')).toBe(70 / 4);
        expect(cellValue(api, 'row-group-country-Ireland', 'unitPrice')).toBe(110 / 5);
        expect(cellValue(api, '1', 'unitPrice')).toBe(10);
        // the parent's avg still weights each child group by its count, so it is the plain average of leaves
        const ireland = groupNode(api, 'row-group-country-Ireland');
        expect(ireland.aggData.unitPrice.value).toBeCloseTo(70 / 3);

        const params = calls.find((p) => p.node === ireland)!;
        expect(params.aggFunc).toBe('avg');
        expect(params.aggValue).toBe(ireland.aggData.unitPrice);
        expect(params.value).toBe(ireland.aggData.unitPrice);
        expect(params.aggData).toBe(ireland.aggData);
        expect(params.colDef.field).toBe('unitPrice');
        expect(params.column.getColId()).toBe('unitPrice');
        expect(params.data).toBeUndefined();
    });

    test('is not called for leaf rows, group columns, non-aggregated columns or open groups shown on their total row', () => {
        const getter = vi.fn((params: AggValueGetterParams) => params.value);
        const api = createGrid(
            [
                { field: 'revenue', aggFunc: 'sum', aggValueGetter: getter },
                { field: 'units', aggValueGetter: getter },
            ],
            {
                autoGroupColumnDef: { aggValueGetter: getter },
                groupTotalRow: 'bottom',
            }
        );
        // repaint only: no sort, filter or API read, so every call comes from a rendered cell
        getter.mockClear();
        api.refreshCells({ force: true });

        expect(getter).toHaveBeenCalled();
        for (const [params] of getter.mock.calls) {
            expect(params.column.getColId()).toBe('revenue');
            expect(params.node!.footer).toBe(true);
        }
    });

    test('is not called for pivot result columns', () => {
        const getter = vi.fn((params: AggValueGetterParams) => (params.aggValue as number) * 100);
        const api = gridsManager.createGrid('agg-value-getter-pivot', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'revenue', aggFunc: 'sum', aggValueGetter: getter },
            ],
            pivotMode: true,
            getRowId: ({ data }) => data.id,
            rowData: SALES,
        });

        const pivotCols = api.getPivotResultColumns()!;
        const ireland = groupNode(api, 'row-group-country-Ireland');
        expect(pivotCols.map((col) => api.getCellValue({ rowNode: ireland, colKey: col }))).toEqual([70, 40]);
        expect(pivotCols[0].getColDef().aggValueGetter).toBeUndefined();
        expect(getter).not.toHaveBeenCalled();
    });

    test('sorting, filtering, CSV export and getCellValue all read the returned value', () => {
        // negating the sum reverses the order a sort on the raw aggregate would give
        const api = createGrid(
            [
                {
                    field: 'revenue',
                    aggFunc: 'sum',
                    filter: 'agNumberColumnFilter',
                    aggValueGetter: (params) => -(params.aggValue as number),
                },
            ],
            { groupAggFiltering: true }
        );

        api.applyColumnState({ state: [{ colId: 'revenue', sort: 'asc' }] });
        const topLevel: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group && node.level === 0) {
                topLevel.push(node.key!);
            }
        });
        expect(topLevel).toEqual(['Ireland', 'Italy']);

        api.setFilterModel({ revenue: { filterType: 'number', type: 'lessThan', filter: -50 } });
        const shownGroups: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group) {
                shownGroups.push(node.id!);
            }
        });
        // Ireland (-110) passes, which keeps its children; on the raw aggregates no group would
        expect(shownGroups).toEqual([
            'row-group-country-Ireland',
            'row-group-country-Ireland-year-2000',
            'row-group-country-Ireland-year-2004',
        ]);
        api.setFilterModel(null);

        expect(cellValue(api, 'row-group-country-Italy', 'revenue')).toBe(-20);
        const csv = api.getDataAsCsv({ suppressQuotes: true, columnKeys: ['revenue'] })!;
        expect(csv.split('\r\n')).toEqual(['sum(Revenue)', '-110', '-70', '10', '60', '-40', '40', '-20', '-20', '20']);
    });

    test('cells reading other aggregates refresh when those aggregates change', async () => {
        const api = createGrid([
            { field: 'units', aggFunc: 'sum' },
            { field: 'revenue', aggFunc: 'sum' },
            {
                field: 'unitPrice',
                aggFunc: 'avg',
                aggValueGetter: (params) => params.aggData!.revenue / params.aggData!.units,
            },
        ]);
        await waitFor(() => expect(renderedText(api, 'row-group-country-Italy', 'unitPrice')).toBe('5'));

        // only revenue changes, so unitPrice's own aggregate is unchanged
        applyTransactionChecked(api, { update: [{ ...SALES[3], revenue: 40 }] });

        await waitFor(() => expect(renderedText(api, 'row-group-country-Italy', 'unitPrice')).toBe('10'));
    });

    test('Show Values As reads totals through the getter', () => {
        const api = gridsManager.createGrid('agg-value-getter-show-values-as', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'revenue',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    aggValueGetter: (params) => (params.aggValue as number) * 2,
                },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: SALES,
        });

        // the grand total is 2 * 130: groups divide their doubled value by it, leaves their own value
        expect(groupNode(api, 'row-group-country-Ireland').getDataValue('revenue', 'transformed')).toBeCloseTo(
            220 / 260
        );
        expect(groupNode(api, '1').getDataValue('revenue', 'transformed')).toBeCloseTo(10 / 260);
    });

    test('is called for tree data parents and not for leaves', () => {
        const getter = vi.fn((params: AggValueGetterParams) => `${params.aggValue}!`);
        const api = gridsManager.createGrid('agg-value-getter-tree', {
            columnDefs: [{ field: 'revenue', aggFunc: 'sum', aggValueGetter: getter }],
            treeData: true,
            getDataPath: (data) => data.path,
            getRowId: ({ data }) => data.id,
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'a', path: ['a'], revenue: 0 },
                { id: 'b', path: ['a', 'b'], revenue: 5 },
                { id: 'c', path: ['a', 'c'], revenue: 7 },
            ],
        });

        expect(api.getCellValue({ rowNode: api.getRowNode('a')!, colKey: 'revenue' })).toBe('12!');
        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'revenue' })).toBe(5);
        for (const [params] of getter.mock.calls) {
            expect(params.node!.id).toBe('a');
        }
    });
});
