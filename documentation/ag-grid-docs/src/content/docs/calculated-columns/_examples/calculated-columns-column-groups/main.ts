import type { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    NumberFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

type QuarterlyRevenueRow = {
    product: string;
    q1_2025: number;
    q2_2025: number;
    q3_2025: number;
    q4_2025: number;
    q1_2026: number;
    q2_2026: number;
    q3_2026: number;
    q4_2026: number;
};

type QuarterField = Exclude<keyof QuarterlyRevenueRow, 'product'>;

const currencyFormatter = (params: ValueFormatterParams<QuarterlyRevenueRow, number>) =>
    params.value == null ? '' : `$${params.value.toLocaleString()}`;

const percentageFormatter = (params: ValueFormatterParams<QuarterlyRevenueRow, number>) =>
    params.value == null ? '' : `${params.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

const quarterColumn = (field: QuarterField): ColDef<QuarterlyRevenueRow, number> => ({
    field,
    colId: field,
    headerName: field.slice(0, 2).toUpperCase(),
    columnGroupShow: 'open',
    cellDataType: 'number',
    valueFormatter: currencyFormatter,
});

const columnDefs: (ColDef<QuarterlyRevenueRow> | ColGroupDef<QuarterlyRevenueRow>)[] = [
    { field: 'product', pinned: 'left', minWidth: 180, flex: 1.4 },
    {
        headerName: '2025',
        openByDefault: false,
        children: [
            quarterColumn('q1_2025'),
            quarterColumn('q2_2025'),
            quarterColumn('q3_2025'),
            quarterColumn('q4_2025'),
            {
                colId: 'total_2025',
                headerName: 'Total',
                columnGroupShow: 'closed',
                calculatedExpression: '[q1_2025] + [q2_2025] + [q3_2025] + [q4_2025]',
                cellDataType: 'number',
                valueFormatter: currencyFormatter,
            },
        ],
    },
    {
        headerName: '2026',
        openByDefault: false,
        children: [
            quarterColumn('q1_2026'),
            quarterColumn('q2_2026'),
            quarterColumn('q3_2026'),
            quarterColumn('q4_2026'),
            {
                colId: 'total_2026',
                headerName: 'Total',
                columnGroupShow: 'closed',
                calculatedExpression: '[q1_2026] + [q2_2026] + [q3_2026] + [q4_2026]',
                cellDataType: 'number',
                valueFormatter: currencyFormatter,
            },
        ],
    },
    {
        headerName: 'Change',
        children: [
            {
                colId: 'q4Change',
                headerName: 'Q4 Change',
                calculatedExpression: 'ROUND((([q4_2026] - [q4_2025]) / [q4_2025]) * 100, 1)',
                cellDataType: 'number',
                sortable: true,
                filter: 'agNumberColumnFilter',
                valueFormatter: percentageFormatter,
            },
            {
                colId: 'yearChange',
                headerName: 'Year Change',
                calculatedExpression:
                    '([q1_2026] + [q2_2026] + [q3_2026] + [q4_2026]) - ([q1_2025] + [q2_2025] + [q3_2025] + [q4_2025])',
                cellDataType: 'number',
                sortable: true,
                filter: 'agNumberColumnFilter',
                valueFormatter: currencyFormatter,
            },
        ],
    },
];

const rowData: QuarterlyRevenueRow[] = [
    {
        product: 'Solar panel kit',
        q1_2025: 35000,
        q2_2025: 38000,
        q3_2025: 42000,
        q4_2025: 44000,
        q1_2026: 48000,
        q2_2026: 50000,
        q3_2026: 55000,
        q4_2026: 58000,
    },
    {
        product: 'Smart thermostat',
        q1_2025: 18000,
        q2_2025: 20000,
        q3_2025: 22000,
        q4_2025: 25000,
        q1_2026: 24000,
        q2_2026: 26000,
        q3_2026: 27000,
        q4_2026: 31000,
    },
    {
        product: 'Battery pack',
        q1_2025: 29000,
        q2_2025: 31000,
        q3_2025: 35000,
        q4_2025: 39000,
        q1_2026: 41000,
        q2_2026: 43000,
        q3_2026: 46000,
        q4_2026: 52000,
    },
    {
        product: 'EV charger',
        q1_2025: 22000,
        q2_2025: 24000,
        q3_2025: 26000,
        q4_2025: 28000,
        q1_2026: 30000,
        q2_2026: 32000,
        q3_2026: 34000,
        q4_2026: 36000,
    },
];

const gridOptions: GridOptions<QuarterlyRevenueRow> = {
    columnDefs,
    rowData,
    defaultColDef: {
        minWidth: 120,
        flex: 1,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
