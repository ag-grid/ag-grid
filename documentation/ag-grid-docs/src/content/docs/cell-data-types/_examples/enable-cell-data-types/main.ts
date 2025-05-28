import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CheckboxEditorModule,
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
    CheckboxEditorModule,
    DateFilterModule,
    DateEditorModule,
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IOlympicDataTypes extends IOlympicData {
    dateObject: Date;
    dateTime: Date;
    dateTimeString: string;
    hasGold: boolean;
    hasSilver: boolean;
    countryObject: {
        name: string;
    };
}

let gridApi: GridApi<IOlympicDataTypes>;

const gridOptions: GridOptions<IOlympicDataTypes> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age', minWidth: 100 },
        { field: 'hasGold', minWidth: 100, headerName: 'Gold' },
        { field: 'hasSilver', minWidth: 100, headerName: 'Silver', cellRendererParams: { disabled: true } },
        { field: 'dateObject', headerName: 'Date' },
        { field: 'date', headerName: 'Date (String)' },
        { field: 'dateTime', headerName: 'DateTime', cellDataType: 'dateTime', minWidth: 250 },
        { field: 'dateTimeString', headerName: 'DateTime (String)', minWidth: 250 },
        { field: 'countryObject', headerName: 'Country' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 180,
        filter: true,
        floatingFilter: true,
        editable: true,
    },
    dataTypeDefinitions: {
        object: {
            baseDataType: 'object',
            extendsDataType: 'object',
            valueParser: (params) => ({ name: params.newValue }),
            valueFormatter: (params) => (params.value == null ? '' : params.value.name),
        },
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
                data.map((rowData) => {
                    const dateParts = rowData.date.split('/');
                    const [year, month, day] = dateParts.reverse().map((e) => parseInt(e, 10));
                    const [h, m, s] = [
                        Math.floor(Math.random() * 24),
                        Math.floor(Math.random() * 60),
                        Math.floor(Math.random() * 60),
                    ];
                    const paddedDateTimeStrings = [month, day, h, m, s].map((e) => e.toString().padStart(2, '0'));
                    const dateString = `${year}-${paddedDateTimeStrings[0]}-${paddedDateTimeStrings[1]}`;
                    const dateTimeString = `${year}-${paddedDateTimeStrings[0]}-${paddedDateTimeStrings[1]}T${paddedDateTimeStrings.slice(2).join(':')}`;
                    return {
                        ...rowData,
                        date: dateString,
                        dateObject: new Date(year, month - 1, day),
                        dateTimeString,
                        dateTime: new Date(year, month - 1, day, h, m, s),
                        countryObject: {
                            name: rowData.country,
                        },
                        hasGold: rowData.gold > 0,
                        hasSilver: rowData.silver > 0,
                    };
                })
            )
        );
});
