import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    DateEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    DateEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IModifiedOlympicData extends IOlympicData {
    dateObj: Date | null;
}

let gridApi: GridApi<IModifiedOlympicData>;

const stringToDate = (date: string): Date | null => {
    const [day, month, year] = (date || '').split('/');
    if (day == null || month == null || year == null) {
        return null;
    }
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const dateToIso = (date: string | null): string => {
    const [day, month, year] = (date || '').split('/');
    if (day == null || month == null || year == null) {
        return '';
    }
    return `${year}-${month}-${day}`;
};
const gridOptions: GridOptions<IModifiedOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            headerName: 'Athlete (maxLength 10)',
            cellEditor: 'agTextCellEditor',
            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            field: 'age',
            headerName: 'Age (> 0 and <100)',
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0,
                max: 100,
            },
        },
        {
            field: 'dateObj',
            headerName: 'Date (< 2009)',
            cellEditor: 'agDateCellEditor',
            valueFormatter: ({ data }) => {
                return data?.dateObj?.toISOString().slice(0, 10) || '';
            },
            cellEditorParams: {
                max: new Date('2008-12-31'),
            },
        },
        {
            field: 'date',
            headerName: 'Date as String (> 2008)',
            cellEditor: 'agDateStringCellEditor',
            cellEditorParams: {
                min: '2008-12-31',
            },
        },
    ],
    defaultColDef: {
        editable: true,
        cellDataType: false,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((rec: IOlympicData) => ({
                    ...rec,
                    date: dateToIso(rec.date),
                    dateObj: stringToDate(rec.date),
                }))
            )
        );
});
