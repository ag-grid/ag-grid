import type { ColDef, GridApi, GridOptions, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    RenderApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([RenderApiModule, HighlightChangesModule, ClientSideRowModelModule]);

type Currency = 'EUR' | 'GBP' | 'USD';

interface IPrice {
    currency: Currency;
    amount: number;
}

interface IProduct {
    product: string;
    price: IPrice;
}

// The shape of the context object, provided to the TContext generic parameter below
// so that params.context is typed wherever it is used.
interface IReportingContext {
    reportingCurrency: Currency;
}

const formatters: Record<Currency, Intl.NumberFormat> = {
    EUR: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }),
    GBP: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }),
};

const currencyComparator = (a: IPrice, b: IPrice) => {
    return a.amount - b.amount;
};

const currencyCellRenderer = (params: ICellRendererParams<IProduct, IPrice, IReportingContext>) => {
    const price = params.value;
    if (!price) {
        return '';
    }
    return formatters[price.currency]?.format(price.amount) ?? price.amount;
};

const columnDefs: ColDef<IProduct>[] = [
    { field: 'product' },
    { headerName: 'Currency', field: 'price.currency' },
    {
        headerName: 'Price Local',
        field: 'price',
        cellRenderer: currencyCellRenderer,
        comparator: currencyComparator,
        cellDataType: false,
    },
    {
        headerName: 'Report Price',
        field: 'price',
        cellRenderer: currencyCellRenderer,
        comparator: currencyComparator,
        valueGetter: reportingCurrencyValueGetter,
        headerValueGetter: 'ctx.reportingCurrency',
    },
];

let gridApi: GridApi<IProduct>;

const gridOptions: GridOptions<IProduct> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        enableCellChangeFlash: true,
    },
    rowData: getData(),
    // `context` is typed as `any`, so use `as` to apply the context interface
    context: {
        reportingCurrency: 'EUR',
    } as IReportingContext,
};

// Rates taken from google at time of writing
const exchangeRates: Record<Currency, Partial<Record<Currency, number>>> = {
    EUR: { GBP: 0.72, USD: 1.08 },
    GBP: { EUR: 1.29, USD: 1.5 },
    USD: { GBP: 0.67, EUR: 0.93 },
};

function reportingCurrencyValueGetter(params: ValueGetterParams<IProduct, IPrice, IReportingContext>): IPrice {
    const price = params.data!.price;
    // params.context is typed as IReportingContext, so reportingCurrency is typed as Currency
    const reportingCurrency = params.context.reportingCurrency;
    const fxRate = exchangeRates[reportingCurrency][price.currency];

    return {
        currency: reportingCurrency,
        amount: fxRate ? price.amount * fxRate : price.amount,
    };
}

function currencyChanged() {
    const value = (document.getElementById('currency') as HTMLSelectElement).value as Currency;
    gridApi.setGridOption('context', { reportingCurrency: value } as IReportingContext);
    // Changing the context does not refresh the grid on its own - the cells and
    // headers that read from it must be refreshed explicitly.
    gridApi.refreshCells();
    gridApi.refreshHeader();
}

function getData(): IProduct[] {
    return [
        { product: 'Product 1', price: { currency: 'EUR', amount: 644 } },
        { product: 'Product 2', price: { currency: 'EUR', amount: 354 } },
        { product: 'Product 3', price: { currency: 'GBP', amount: 429 } },
        { product: 'Product 4', price: { currency: 'GBP', amount: 143 } },
        { product: 'Product 5', price: { currency: 'USD', amount: 345 } },
        { product: 'Product 6', price: { currency: 'USD', amount: 982 } },
    ];
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
