import { AgChartsCommunityModule } from 'ag-charts-community';

import type { GetDetailRowDataParams, GridApi, GridOptions, Module, ValueFormatterParams } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    MasterDetailModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SetFilterModule,
    SparklinesModule,
    StatusBarModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

export type ToolbarControl =
    | { kind: 'button'; label: string; onClick: (api: GridApi) => void }
    | { kind: 'search'; placeholder: string; onInput: (api: GridApi, value: string) => void };

export interface SolutionExampleDefinition {
    /** Only the modules the example uses, so a Community-only example registers no Enterprise module. */
    modules: Module[];
    gridOptions: GridOptions;
    toolbar?: ToolbarControl[];
    /** Starts live updates once the grid is ready; returns the function that stops them. */
    start?: (api: GridApi) => () => void;
}

/** A seeded generator, so the sample data is the same on every load. */
const seededRandom = (seed = 7) => {
    let state = seed;
    const next = () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
    return {
        int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
        pick: <T>(items: T[]): T => items[Math.floor(next() * items.length)],
        next,
    };
};

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money = ({ value }: ValueFormatterParams) => (value == null ? '' : usd.format(value));
const moneyWhole = ({ value }: ValueFormatterParams) => (value == null ? '' : usdWhole.format(value));
const count = ({ value }: ValueFormatterParams) => (value == null ? '' : value.toLocaleString('en-US'));
const twoDecimals = ({ value }: ValueFormatterParams) => (value == null ? '' : value.toFixed(2));

const trading = (): SolutionExampleDefinition => {
    const { int, next } = seededRandom();
    const symbols: Array<[string, string, number]> = [
        ['AAPL', 'Apple', 190],
        ['MSFT', 'Microsoft', 410],
        ['NVDA', 'NVIDIA', 120],
        ['AMZN', 'Amazon', 180],
        ['GOOGL', 'Alphabet', 165],
        ['META', 'Meta', 500],
        ['TSLA', 'Tesla', 240],
        ['JPM', 'JPMorgan', 200],
        ['V', 'Visa', 275],
        ['XOM', 'Exxon Mobil', 115],
    ];
    const rows = symbols.map(([symbol, name, price]) => ({ symbol, name, price, change: 0, qty: int(100, 2000) }));

    return {
        modules: [AllCommunityModule],
        gridOptions: {
            rowData: rows,
            getRowId: ({ data }) => data.symbol,
            asyncTransactionWaitMillis: 50,
            columnDefs: [
                { field: 'symbol', width: 110 },
                { field: 'name', flex: 1 },
                { field: 'price', valueFormatter: money, enableCellChangeFlash: true, type: 'rightAligned' },
                {
                    field: 'change',
                    cellRenderer: 'agAnimateShowChangeCellRenderer',
                    valueFormatter: twoDecimals,
                    type: 'rightAligned',
                },
                { field: 'qty', headerName: 'Quantity', valueFormatter: count, type: 'rightAligned' },
                {
                    headerName: 'Value',
                    valueGetter: ({ data }) => data.price * data.qty,
                    valueFormatter: moneyWhole,
                    enableCellChangeFlash: true,
                    type: 'rightAligned',
                },
            ],
        },
        start: (api) => {
            const timer = setInterval(() => {
                const update = [];
                for (let i = 0; i < 3; i++) {
                    const index = int(0, rows.length - 1);
                    const row = rows[index];
                    const change = +((next() - 0.5) * row.price * 0.01).toFixed(2);
                    rows[index] = { ...row, price: +(row.price + change).toFixed(2), change };
                    update.push(rows[index]);
                }
                api.applyTransactionAsync({ update });
            }, 400);
            return () => clearInterval(timer);
        },
    };
};

const inventory = (): SolutionExampleDefinition => {
    const { int, pick } = seededRandom();
    const categories = ['Electronics', 'Furniture', 'Stationery', 'Kitchen', 'Outdoor'];
    const products = [
        'Laptop stand',
        'USB-C hub',
        'Desk lamp',
        'Office chair',
        'Notebook A5',
        'Water bottle',
        'Monitor arm',
        'Cable tray',
        'Coffee grinder',
        'Camping stove',
        'Keyboard',
        'Whiteboard',
        'Bookshelf',
        'Kettle',
        'Headphones',
        'Tent',
        'Desk mat',
        'Planner',
        'Blender',
        'Lantern',
    ];

    return {
        modules: [AllCommunityModule],
        gridOptions: {
            rowData: products.map((product, i) => ({
                sku: `SKU-${1000 + i}`,
                product,
                category: pick(categories),
                stock: int(0, 140),
                reorder: 20,
                price: int(8, 320) + 0.99,
            })),
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 20],
            columnDefs: [
                { field: 'sku', headerName: 'SKU', width: 110 },
                { field: 'product', flex: 1, filter: true },
                { field: 'category', filter: true },
                {
                    field: 'stock',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    type: 'rightAligned',
                    cellClassRules: { 'solution-example-low': ({ value, data }) => value < data.reorder },
                },
                { field: 'reorder', headerName: 'Reorder at', type: 'rightAligned' },
                { field: 'price', valueFormatter: money, type: 'rightAligned' },
            ],
        },
        toolbar: [
            {
                kind: 'search',
                placeholder: 'Search products',
                onInput: (api, value) => api.setGridOption('quickFilterText', value),
            },
        ],
    };
};

const largeDatasets = (): SolutionExampleDefinition => {
    const regions = ['North', 'South', 'East', 'West'];
    const products = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];
    const rows = Array.from({ length: 100_000 }, (_, i) => ({
        id: i + 1,
        region: regions[i % 4],
        product: products[(i * 7) % 5],
        units: (i * 37) % 500,
        revenue: ((i * 7919) % 100000) / 10,
    }));

    return {
        modules: [AllCommunityModule],
        gridOptions: {
            rowData: rows,
            getRowId: ({ data }) => String(data.id),
            columnDefs: [
                { field: 'id', headerName: 'ID', width: 100 },
                { field: 'region', filter: true },
                { field: 'product', filter: true },
                { field: 'units', type: 'rightAligned', filter: 'agNumberColumnFilter' },
                { field: 'revenue', valueFormatter: money, type: 'rightAligned', flex: 1 },
            ],
        },
    };
};

const pivotTables = (): SolutionExampleDefinition => {
    const { int } = seededRandom();
    const rows = ['North', 'South', 'East', 'West'].flatMap((region) =>
        ['Laptops', 'Monitors', 'Phones', 'Tablets'].flatMap((product) =>
            ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => ({ region, product, quarter, revenue: int(20, 180) * 1000 }))
        )
    );

    return {
        modules: [AllCommunityModule, PivotModule, ColumnsToolPanelModule, RowGroupingPanelModule],
        gridOptions: {
            rowData: rows,
            pivotMode: true,
            sideBar: 'columns',
            pivotPanelShow: 'always',
            autoGroupColumnDef: { minWidth: 180 },
            defaultColDef: { flex: 1, minWidth: 110, enableRowGroup: true, enablePivot: true, enableValue: true },
            columnDefs: [
                { field: 'region', rowGroup: true },
                { field: 'product' },
                { field: 'quarter', pivot: true },
                { field: 'revenue', aggFunc: 'sum', valueFormatter: moneyWhole },
            ],
        },
    };
};

const portfolioManagement = (): SolutionExampleDefinition => {
    const { int, next } = seededRandom();
    const holdings: Array<[string, string]> = [
        ['AAPL', 'Equity'],
        ['MSFT', 'Equity'],
        ['NVDA', 'Equity'],
        ['VOO', 'ETF'],
        ['VXUS', 'ETF'],
        ['US10Y', 'Bond'],
        ['US2Y', 'Bond'],
        ['BTC', 'Crypto'],
    ];
    const rows = holdings.map(([ticker, assetClass]) => {
        const history: number[] = [];
        let value = int(50, 150);
        for (let i = 0; i < 20; i++) {
            value = Math.max(5, value + (next() - 0.48) * 10);
            history.push(+value.toFixed(2));
        }
        return { ticker, assetClass, value: int(5, 90) * 1000, pnl: int(-4000, 9000), history };
    });

    return {
        modules: [AllCommunityModule, RowGroupingModule, SparklinesModule.with(AgChartsCommunityModule)],
        gridOptions: {
            rowData: rows,
            groupDefaultExpanded: 1,
            grandTotalRow: 'bottom',
            autoGroupColumnDef: { headerName: 'Holding', minWidth: 180 },
            columnDefs: [
                { field: 'assetClass', rowGroup: true, hide: true },
                { field: 'ticker', width: 110 },
                { field: 'value', aggFunc: 'sum', valueFormatter: moneyWhole, type: 'rightAligned' },
                {
                    field: 'pnl',
                    headerName: 'P&L',
                    aggFunc: 'sum',
                    valueFormatter: moneyWhole,
                    type: 'rightAligned',
                    cellClassRules: {
                        'solution-example-up': ({ value }) => value >= 0,
                        'solution-example-down': ({ value }) => value < 0,
                    },
                },
                {
                    field: 'history',
                    headerName: 'Last 20 days',
                    cellRenderer: 'agSparklineCellRenderer',
                    cellRendererParams: { sparklineOptions: { type: 'line' } },
                    flex: 1,
                    minWidth: 160,
                },
            ],
        },
    };
};

const TASK_STATUSES = ['Not started', 'In progress', 'Blocked', 'Done'];

const projectManagement = (): SolutionExampleDefinition => ({
    modules: [AllCommunityModule, TreeDataModule],
    gridOptions: {
        rowData: [
            { path: ['Website relaunch'], owner: 'Priya', status: 'In progress', due: '2026-11-30' },
            { path: ['Website relaunch', 'Design'], owner: 'Sam', status: 'Done', due: '2026-10-10' },
            { path: ['Website relaunch', 'Build'], owner: 'Ana', status: 'In progress', due: '2026-11-15' },
            {
                path: ['Website relaunch', 'Build', 'Comparison pages'],
                owner: 'Ana',
                status: 'In progress',
                due: '2026-11-01',
            },
            {
                path: ['Website relaunch', 'Build', 'Migration guides'],
                owner: 'Leo',
                status: 'Not started',
                due: '2026-11-12',
            },
            { path: ['Website relaunch', 'QA'], owner: 'Kim', status: 'Not started', due: '2026-11-25' },
            { path: ['Data platform'], owner: 'Omar', status: 'Blocked', due: '2026-12-20' },
            { path: ['Data platform', 'API'], owner: 'Omar', status: 'Blocked', due: '2026-12-01' },
            { path: ['Data platform', 'Dashboards'], owner: 'Priya', status: 'Not started', due: '2026-12-15' },
        ],
        treeData: true,
        getDataPath: (data) => data.path,
        groupDefaultExpanded: -1,
        autoGroupColumnDef: { headerName: 'Task', minWidth: 260 },
        defaultColDef: { flex: 1 },
        columnDefs: [
            { field: 'owner', editable: true },
            {
                field: 'status',
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: { values: TASK_STATUSES },
                cellClass: ({ value }) =>
                    `solution-example-status solution-example-${String(value ?? '')
                        .toLowerCase()
                        .replace(/ /g, '-')}`,
            },
            { field: 'due', headerName: 'Due date', editable: true, cellEditor: 'agDateStringCellEditor' },
        ],
    },
});

const spreadsheetEditing = (): SolutionExampleDefinition => {
    const { int } = seededRandom();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const rows = ['Rent', 'Salaries', 'Software', 'Travel', 'Marketing', 'Equipment', 'Training'].map((item) => ({
        item,
        ...Object.fromEntries(months.map((month) => [month, int(1, 40) * 250])),
    }));

    return {
        modules: [AllCommunityModule, CellSelectionModule, ClipboardModule, StatusBarModule],
        gridOptions: {
            rowData: rows,
            cellSelection: { handle: { mode: 'fill' } },
            undoRedoCellEditing: true,
            undoRedoCellEditingLimit: 20,
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 90,
                valueFormatter: moneyWhole,
                // Copy writes the formatted text ("$1,250"), so strip symbols and separators on paste
                valueParser: ({ newValue }) => Number(String(newValue).replace(/[^0-9.-]/g, '')),
                type: 'rightAligned',
            },
            columnDefs: [
                { field: 'item', editable: false, valueFormatter: undefined, type: [], minWidth: 130 },
                ...months.map((month) => ({ field: month })),
            ],
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        },
        toolbar: [
            { kind: 'button', label: 'Undo', onClick: (api) => api.undoCellEditing() },
            { kind: 'button', label: 'Redo', onClick: (api) => api.redoCellEditing() },
        ],
    };
};

const treeData = (): SolutionExampleDefinition => ({
    modules: [AllCommunityModule, TreeDataModule, SetFilterModule],
    gridOptions: {
        rowData: [
            { path: ['Ada (CEO)'], team: 'Leadership', size: 42 },
            { path: ['Ada (CEO)', 'Ben (CTO)'], team: 'Engineering', size: 24 },
            { path: ['Ada (CEO)', 'Ben (CTO)', 'Cara'], team: 'Platform', size: 9 },
            { path: ['Ada (CEO)', 'Ben (CTO)', 'Dev'], team: 'Frontend', size: 8 },
            { path: ['Ada (CEO)', 'Ben (CTO)', 'Eli'], team: 'Data', size: 7 },
            { path: ['Ada (CEO)', 'Fay (CFO)'], team: 'Finance', size: 6 },
            { path: ['Ada (CEO)', 'Fay (CFO)', 'Gus'], team: 'Payroll', size: 3 },
            { path: ['Ada (CEO)', 'Hana (COO)'], team: 'Operations', size: 11 },
            { path: ['Ada (CEO)', 'Hana (COO)', 'Ian'], team: 'Support', size: 6 },
            { path: ['Ada (CEO)', 'Hana (COO)', 'Jo'], team: 'Logistics', size: 5 },
        ],
        treeData: true,
        getDataPath: (data) => data.path,
        groupDefaultExpanded: -1,
        autoGroupColumnDef: { headerName: 'Person', minWidth: 240 },
        defaultColDef: { flex: 1, filter: true },
        columnDefs: [{ field: 'team' }, { field: 'size', headerName: 'Team size', type: 'rightAligned' }],
    },
});

const ORDER_STATUSES = ['New', 'Picking', 'Shipped', 'Delivered'];

const orderManagement = (): SolutionExampleDefinition => {
    const { int, pick } = seededRandom();
    const customers = ['Acme Ltd', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries'];
    const items = ['Laptop', 'Dock', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Webcam'];
    const rows = Array.from({ length: 14 }, (_, i) => {
        const lines = Array.from({ length: int(1, 4) }, () => {
            const qty = int(1, 20);
            const price = int(20, 900);
            return { item: pick(items), qty, price, total: qty * price };
        });
        return {
            order: `SO-${24100 + i}`,
            customer: pick(customers),
            status: pick(ORDER_STATUSES),
            date: `2026-09-${int(10, 30)}`,
            lines,
            total: lines.reduce((sum, line) => sum + line.total, 0),
        };
    });

    return {
        modules: [AllCommunityModule, MasterDetailModule, SetFilterModule],
        gridOptions: {
            rowData: rows,
            masterDetail: true,
            detailRowAutoHeight: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [
                        { field: 'item', flex: 1 },
                        { field: 'qty', type: 'rightAligned' },
                        { field: 'price', valueFormatter: moneyWhole, type: 'rightAligned' },
                        { field: 'total', valueFormatter: moneyWhole, type: 'rightAligned' },
                    ],
                    domLayout: 'autoHeight',
                },
                getDetailRowData: ({ data, successCallback }: GetDetailRowDataParams) => successCallback(data.lines),
            },
            defaultColDef: { flex: 1 },
            columnDefs: [
                { field: 'order', cellRenderer: 'agGroupCellRenderer', minWidth: 140 },
                { field: 'customer', filter: 'agSetColumnFilter' },
                {
                    field: 'status',
                    filter: 'agSetColumnFilter',
                    editable: true,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: { values: ORDER_STATUSES },
                },
                { field: 'date' },
                { field: 'total', valueFormatter: moneyWhole, type: 'rightAligned' },
            ],
        },
        toolbar: [
            {
                kind: 'search',
                placeholder: 'Search orders',
                onInput: (api, value) => api.setGridOption('quickFilterText', value),
            },
        ],
    };
};

const excelExport = (): SolutionExampleDefinition => {
    const { int } = seededRandom();
    const rows = ['North', 'South', 'East', 'West'].flatMap((region) =>
        ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => ({
            region,
            quarter,
            revenue: int(40, 160) * 1000,
            costs: int(20, 90) * 1000,
        }))
    );

    return {
        modules: [AllCommunityModule, ExcelExportModule],
        gridOptions: {
            rowData: rows,
            defaultColDef: { flex: 1 },
            excelStyles: [
                { id: 'currency', numberFormat: { format: '$#,##0' } },
                { id: 'header', font: { bold: true } },
            ],
            columnDefs: [
                { field: 'region', filter: true },
                { field: 'quarter' },
                { field: 'revenue', valueFormatter: moneyWhole, cellClass: 'currency', type: 'rightAligned' },
                { field: 'costs', valueFormatter: moneyWhole, cellClass: 'currency', type: 'rightAligned' },
                {
                    headerName: 'Profit',
                    valueGetter: ({ data }) => data.revenue - data.costs,
                    valueFormatter: moneyWhole,
                    cellClass: 'currency',
                    type: 'rightAligned',
                },
            ],
        },
        toolbar: [
            {
                kind: 'button',
                label: 'Export to Excel',
                onClick: (api) => api.exportDataAsExcel({ fileName: 'report.xlsx' }),
            },
            {
                kind: 'button',
                label: 'Export to CSV',
                onClick: (api) => api.exportDataAsCsv({ fileName: 'report.csv' }),
            },
        ],
    };
};

/** Each solution page's live example, keyed by its content entry's `example.id`. */
export const SOLUTION_EXAMPLES: Record<string, () => SolutionExampleDefinition> = {
    trading,
    inventory,
    'large-datasets': largeDatasets,
    'pivot-tables': pivotTables,
    'portfolio-management': portfolioManagement,
    'project-management': projectManagement,
    'spreadsheet-editing': spreadsheetEditing,
    'tree-data': treeData,
    'order-management': orderManagement,
    'excel-export': excelExport,
};
