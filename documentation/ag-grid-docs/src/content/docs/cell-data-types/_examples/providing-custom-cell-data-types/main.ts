import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { CellSelectionModule, ColumnMenuModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextEditorModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    CellSelectionModule,
    SetFilterModule,
    DateEditorModule,
    NumberEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IOlympicDataTypes extends IOlympicData {
    countryObject: {
        code: string;
    };
    sportObject: {
        name: string;
    };
}

const DATE_REGEX = /\d{2}\/\d{2}\/\d{4}/;

let gridApi: GridApi<IOlympicDataTypes>;

const gridOptions: GridOptions<IOlympicDataTypes> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'countryObject', headerName: 'Country' },
        { field: 'sportObject', headerName: 'Sport' },
        { field: 'date' },
    ],
    defaultColDef: {
        filter: true,
        floatingFilter: true,
        editable: true,
    },
    dataTypeDefinitions: {
        country: {
            baseDataType: 'object',
            extendsDataType: 'object',
            valueParser: (params) =>
                params.newValue == null || params.newValue === '' ? null : { code: params.newValue },
            valueFormatter: (params) => (params.value == null ? '' : params.value.code),
            dataTypeMatcher: (value) => value && !!value.code,
        },
        sport: {
            baseDataType: 'object',
            extendsDataType: 'object',
            valueParser: (params) =>
                params.newValue == null || params.newValue === '' ? null : { name: params.newValue },
            valueFormatter: (params) => (params.value == null ? '' : params.value.name),
            dataTypeMatcher: (value) => value && !!value.name,
        },
        dateString: {
            baseDataType: 'dateString',
            extendsDataType: 'dateString',
            valueParser: (params) =>
                params.newValue != null && params.newValue.match(DATE_REGEX) ? params.newValue : null,
            valueFormatter: (params) => (params.value == null ? '' : params.value),
            dataTypeMatcher: (value) => typeof value === 'string' && !!value.match(DATE_REGEX),
            dateParser: (value) => {
                if (value == null || value === '') {
                    return undefined;
                }
                const dateParts = value.split('/');
                return dateParts.length === 3
                    ? new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
                    : undefined;
            },
            dateFormatter: (value) => {
                if (value == null) {
                    return undefined;
                }
                const date = String(value.getDate());
                const month = String(value.getMonth() + 1);
                return `${date.length === 1 ? '0' + date : date}/${
                    month.length === 1 ? '0' + month : month
                }/${value.getFullYear()}`;
            },
        },
    },
    cellSelection: { handle: { mode: 'fill' } },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicDataTypes[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((rowData) => ({
                    ...rowData,
                    countryObject: { code: rowData.country },
                    sportObject: { name: rowData.sport },
                }))
            )
        );
});
