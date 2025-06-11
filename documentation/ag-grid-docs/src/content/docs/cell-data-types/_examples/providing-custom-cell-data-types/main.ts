import type {
    DateTimeStringDataTypeDefinition,
    GridApi,
    GridOptions,
    ValueFormatterLiteParams,
    ValueParserLiteParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
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
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IOlympicDataTypes extends IOlympicData {
    countryObject: {
        code: string;
    };
    sportObject: {
        name: string;
    };
    dateWithSpace: string;
    dateWithComma: string;
}

const dateTimeRegex = /(\d{2}):(\d{2}):(\d{2}).{1,2}(\d{2})\/(\d{2})\/(\d{4})/;
const pad = (n: number) => (n < 10 ? `0${n}` : n);
const rand = (min: number, max: number) => Math.floor((max + min) * Math.random() - min);

const getDateTimeStringDataTypeDefinition = (delimiter: string): DateTimeStringDataTypeDefinition => ({
    baseDataType: 'dateTimeString',
    extendsDataType: 'dateTimeString',
    valueParser: (params: ValueParserLiteParams<IOlympicData, string>) => {
        if (params.newValue != null && params.newValue.match(dateTimeRegex)) {
            return params.newValue;
        } else {
            return null;
        }
    },
    valueFormatter: (params: ValueFormatterLiteParams<IOlympicData, string>) => {
        return params.value == null ? '' : params.value;
    },
    dataTypeMatcher: (value: any) => {
        return typeof value === 'string' && !!value.match(dateTimeRegex);
    },
    dateParser: (value: string | undefined) => {
        if (value == null) {
            return;
        }
        let [_, HH, mm, ss, dd, MM, yyyy] = (value.match(dateTimeRegex) || Array(7).fill('0')).map((e) => e || '0');
        return new Date(parseInt(yyyy), parseInt(MM) - 1, parseInt(dd), parseInt(HH), parseInt(mm), parseInt(ss));
    },
    dateFormatter: (value: Date | undefined) => {
        // convert to `HH:mm:ss dd/MM/yyyy`
        return value == null
            ? ''
            : `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}` +
                  delimiter +
                  `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
    },
});
let gridApi: GridApi<IOlympicDataTypes>;

const gridOptions: GridOptions<IOlympicDataTypes> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'countryObject', headerName: 'Country' },
        { field: 'sportObject', headerName: 'Sport' },
        { field: 'dateWithSpace', cellDataType: 'dateWithSpace' },
        { field: 'dateWithComma', cellDataType: 'dateWithComma' },
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
            dataTypeMatcher: (value: any) => value && !!value.code,
        },
        sport: {
            baseDataType: 'object',
            extendsDataType: 'object',
            valueParser: (params) =>
                params.newValue == null || params.newValue === '' ? null : { name: params.newValue },
            valueFormatter: (params) => (params.value == null ? '' : params.value.name),
            dataTypeMatcher: (value: any) => value && !!value.name,
        },
        dateWithSpace: getDateTimeStringDataTypeDefinition(' '),
        dateWithComma: getDateTimeStringDataTypeDefinition(', '),
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
                data.map((rowData) => {
                    return {
                        ...rowData,
                        countryObject: {
                            code: rowData.country,
                        },
                        sportObject: {
                            name: rowData.sport,
                        },
                        dateWithSpace: `${pad(rand(0, 23))}:${pad(rand(0, 59))}:${pad(rand(0, 59))} ${rowData.date}`,
                        dateWithComma: `${pad(rand(0, 23))}:${pad(rand(0, 59))}:${pad(rand(0, 59))}, ${rowData.date}`,
                    };
                })
            )
        );
});
