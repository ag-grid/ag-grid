import type {
    DateTimeStringDataTypeDefinition,
    GridApi,
    GridOptions,
    ValueFormatterLiteParams,
    ValueParserLiteParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateEditorModule,
    DateFilterModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    NumberEditorModule,
    NumberFilterModule,
    DateEditorModule,
    DateFilterModule,
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IOlympicDataTypes extends IOlympicData {
    countryObject: {
        code: string;
    };
    sportObject: {
        name: string;
    };
    dateTimeWithSpace: string;
}
let gridApi: GridApi<IOlympicDataTypes>;

const dateTimeRegex = /(\d{2})\/(\d{2})\/(\d{4}).{1,2}(\d{2}):(\d{2}):(\d{2})/;
const pad = (n: number) => (n < 10 ? `0${n}` : n);
const rand = (min: number, max: number) => Math.floor((max + min) * Math.random() - min);

const gridOptions: GridOptions<IOlympicDataTypes> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'date' },
        {
            field: 'dateTimeWithSpace',
            cellDataType: 'dateTimeString',
            filterParams: { includeTime: true },
            cellEditorParams: { includeTime: true },
        },
    ],
    defaultColDef: {
        filter: true,
        floatingFilter: true,
        editable: true,
    },
    dataTypeDefinitions: {
        dateString: {
            baseDataType: 'dateString',
            extendsDataType: 'dateString',
            valueParser: (params: ValueParserLiteParams<IOlympicDataTypes, string>) =>
                params.newValue != null && params.newValue.match('\\d{2}/\\d{2}/\\d{4}') ? params.newValue : null,
            valueFormatter: (params: ValueFormatterLiteParams<IOlympicDataTypes, string>) =>
                params.value == null ? '' : params.value,
            dataTypeMatcher: (value: any) => typeof value === 'string' && !!value.match('\\d{2}/\\d{2}/\\d{4}'),
            dateParser: (value: string | undefined) => {
                if (value == null || value === '') {
                    return undefined;
                }
                const dateParts = value.split('/');
                return dateParts.length === 3
                    ? new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
                    : undefined;
            },
            dateFormatter: (value: Date | undefined) => {
                if (value == null) {
                    return undefined;
                }
                const date = String(value.getDate());
                const month = String(value.getMonth() + 1);
                return `${date.length === 1 ? '0' + date : date}/${month.length === 1 ? '0' + month : month}/${value.getFullYear()}`;
            },
        },
        dateTimeString: {
            baseDataType: 'dateTimeString',
            extendsDataType: 'dateTimeString',
            valueParser: (params: ValueParserLiteParams<IOlympicDataTypes, string>) => {
                if (params.newValue != null && params.newValue.match(dateTimeRegex)) {
                    return params.newValue;
                } else {
                    return null;
                }
            },
            dateParser: (value: string | undefined) => {
                if (value == null) {
                    return;
                }
                let [_, HH, mm, ss, dd, MM, yyyy] = (value.match(dateTimeRegex) || Array(7).fill('0')).map(
                    (e) => e || '0'
                );
                return new Date(
                    parseInt(yyyy),
                    parseInt(MM) - 1,
                    parseInt(dd),
                    parseInt(HH),
                    parseInt(mm),
                    parseInt(ss)
                );
            },
            dateFormatter: (value: Date | undefined) => {
                // convert to `HH:mm:ss dd/MM/yyyy`
                return value == null
                    ? ''
                    : `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}` +
                          ' ' +
                          `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
            },
        } as DateTimeStringDataTypeDefinition,
    },
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
                data.map((d) => ({
                    ...d,
                    dateTimeWithSpace: `${d.date} ${pad(rand(0, 23))}:${pad(rand(0, 59))}:${pad(rand(0, 59))}`,
                }))
            )
        );
});
