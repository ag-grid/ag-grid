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

let gridApi: GridApi<IOlympicData>;
const dataTypeDefinitions = {
    date: {
        baseDataType: 'dateTimeString',
        extendsDataType: 'dateTimeString',
        valueParser: (params: ValueParserLiteParams<IOlympicData, string>) => {
            if (params.newValue != null && params.newValue.match('\\d{2}:\\d{2}:\\d{2} \\d{2}/\\d{2}/\\d{4}')) {
                return params.newValue;
            } else {
                return null;
            }
        },
        valueFormatter: (params: ValueFormatterLiteParams<IOlympicData, string>) => {
            return params.value == null ? '' : params.value;
        },
        dataTypeMatcher: (value: any) => {
            return typeof value === 'string' && !!value.match('\\d{2}:\\d{2}:\\d{2} \\d{2}/\\d{2}/\\d{4}');
        },
        dateParser: (value: string | undefined) => {
            if (value == null) {
                return;
            }
            // convert from `HH:mm:ss dd/MM/yyyy`
            const [time, date] = value.split(' ');
            const [HH, mm, ss] = date ? time.split(':') : ['0', '0', '0'];
            const [dd, MM, yyyy] = (date ? date : time).split('/');
            return new Date(parseInt(yyyy), parseInt(MM) - 1, parseInt(dd), parseInt(HH), parseInt(mm), parseInt(ss));
        },
        dateFormatter: (value: Date | undefined) => {
            const pad = (n: number) => (n < 10 ? `0${n}` : n);
            // convert to `HH:mm:ss dd/MM/yyyy`
            return value == null
                ? ''
                : `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}` +
                      ` ${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
        },
    } as DateTimeStringDataTypeDefinition,
};
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        {
            field: 'date',
            cellDataType: 'date',
            filterParams: {
                includeTime: true,
            },
            cellEditorParams: {
                includeTime: true,
            },
        },
    ],
    defaultColDef: {
        filter: true,
        floatingFilter: true,
        editable: true,
    },
    dataTypeDefinitions,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            gridApi!.setGridOption(
                'rowData',
                data.map(
                    (d) =>
                        ({
                            ...d,
                            date: dataTypeDefinitions.date.dateFormatter!(
                                new Date(dataTypeDefinitions.date.dateParser!(d.date)?.getTime()! + Math.random() * 1e7)
                            ),
                        }) as IOlympicData
                )
            );
        });
});
