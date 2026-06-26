import type { ColDef, ColGroupDef, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CalculatedColumnsModule, ColumnMenuModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CalculatedColumnsModule,
    ColumnMenuModule,
    NumberFilterModule,
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

const formatter = (params: ValueFormatterParams<QuarterlyRevenueRow, number>, formattedString: string): string => {
    const { value } = params;
    if (value == null) {
        return '';
    }

    if (String(value).startsWith('#')) {
        return String(value);
    }

    return formattedString;
};

const currencyFormatter = (params: ValueFormatterParams<QuarterlyRevenueRow, number>) =>
    formatter(params, `$${(params.value ?? '').toLocaleString()}`);

const percentageFormatter = (params: ValueFormatterParams<QuarterlyRevenueRow, number>) =>
    formatter(params, `${(params.value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`);

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
    {
        product: 'Heat pump',
        q1_2025: 36000,
        q2_2025: 38500,
        q3_2025: 41000,
        q4_2025: 43500,
        q1_2026: 46000,
        q2_2026: 48500,
        q3_2026: 51000,
        q4_2026: 53500,
    },
    {
        product: 'Inverter unit',
        q1_2025: 21000,
        q2_2025: 22500,
        q3_2025: 24000,
        q4_2025: 25500,
        q1_2026: 27000,
        q2_2026: 28500,
        q3_2026: 30000,
        q4_2026: 31500,
    },
    {
        product: 'Wind turbine kit',
        q1_2025: 52000,
        q2_2025: 55000,
        q3_2025: 58000,
        q4_2025: 61000,
        q1_2026: 64000,
        q2_2026: 67000,
        q3_2026: 70000,
        q4_2026: 73000,
    },
    {
        product: 'Solar tile roof',
        q1_2025: 45000,
        q2_2025: 47800,
        q3_2025: 50600,
        q4_2025: 53400,
        q1_2026: 56200,
        q2_2026: 59000,
        q3_2026: 61800,
        q4_2026: 64600,
    },
    {
        product: 'Power optimiser',
        q1_2025: 15000,
        q2_2025: 16100,
        q3_2025: 17200,
        q4_2025: 18300,
        q1_2026: 19400,
        q2_2026: 20500,
        q3_2026: 21600,
        q4_2026: 22700,
    },
    {
        product: 'Charge controller',
        q1_2025: 12500,
        q2_2025: 13400,
        q3_2025: 14300,
        q4_2025: 15200,
        q1_2026: 16100,
        q2_2026: 17000,
        q3_2026: 17900,
        q4_2026: 18800,
    },
    {
        product: 'Energy monitor',
        q1_2025: 11000,
        q2_2025: 11800,
        q3_2025: 12600,
        q4_2025: 13400,
        q1_2026: 14200,
        q2_2026: 15000,
        q3_2026: 15800,
        q4_2026: 16600,
    },
    {
        product: 'Storage cabinet',
        q1_2025: 17000,
        q2_2025: 18200,
        q3_2025: 19400,
        q4_2025: 20600,
        q1_2026: 21800,
        q2_2026: 23000,
        q3_2026: 24200,
        q4_2026: 25400,
    },
    {
        product: 'Microinverter',
        q1_2025: 14000,
        q2_2025: 15000,
        q3_2025: 16000,
        q4_2025: 17000,
        q1_2026: 18000,
        q2_2026: 19000,
        q3_2026: 20000,
        q4_2026: 21000,
    },
    {
        product: 'Heat recovery unit',
        q1_2025: 28000,
        q2_2025: 29900,
        q3_2025: 31800,
        q4_2025: 33700,
        q1_2026: 35600,
        q2_2026: 37500,
        q3_2026: 39400,
        q4_2026: 41300,
    },
    {
        product: 'Hybrid boiler',
        q1_2025: 34000,
        q2_2025: 36300,
        q3_2025: 38600,
        q4_2025: 40900,
        q1_2026: 43200,
        q2_2026: 45500,
        q3_2026: 47800,
        q4_2026: 50100,
    },
    {
        product: 'Smart meter',
        q1_2025: 9000,
        q2_2025: 9700,
        q3_2025: 10400,
        q4_2025: 11100,
        q1_2026: 11800,
        q2_2026: 12500,
        q3_2026: 13200,
        q4_2026: 13900,
    },
    {
        product: 'Insulation pack',
        q1_2025: 10500,
        q2_2025: 11250,
        q3_2025: 12000,
        q4_2025: 12750,
        q1_2026: 13500,
        q2_2026: 14250,
        q3_2026: 15000,
        q4_2026: 15750,
    },
    {
        product: 'EV cable set',
        q1_2025: 7500,
        q2_2025: 8050,
        q3_2025: 8600,
        q4_2025: 9150,
        q1_2026: 9700,
        q2_2026: 10250,
        q3_2026: 10800,
        q4_2026: 11350,
    },
    {
        product: 'Solar pump',
        q1_2025: 16000,
        q2_2025: 17150,
        q3_2025: 18300,
        q4_2025: 19450,
        q1_2026: 20600,
        q2_2026: 21750,
        q3_2026: 22900,
        q4_2026: 24050,
    },
    {
        product: 'Backup generator',
        q1_2025: 40000,
        q2_2025: 42600,
        q3_2025: 45200,
        q4_2025: 47800,
        q1_2026: 50400,
        q2_2026: 53000,
        q3_2026: 55600,
        q4_2026: 58200,
    },
];

const gridOptions: GridOptions<QuarterlyRevenueRow> = {
    columnDefs,
    rowData,
    calculatedColumns: true,
    defaultColDef: {
        minWidth: 120,
        flex: 1,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
