import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnAutoSizeModule, ClientSideRowModelModule]);

interface IRow {
    athlete: string;
    country: string;
    sport: string;
}

const columnDefs: ColDef<IRow>[] = [
    { field: 'athlete', width: 150 },
    { field: 'country', initialWidth: 120 },
    { field: 'sport' },
];

const shortRowData: IRow[] = [
    { athlete: 'Michael Phelps', country: 'US', sport: 'Swimming' },
    { athlete: 'Natalie Coughlin', country: 'US', sport: 'Swimming' },
    { athlete: 'Aleksey Nemov', country: 'RU', sport: 'Gymnastics' },
];

const longRowData: IRow[] = [
    {
        athlete: 'Michael Fred Phelps II, the most decorated Olympian',
        country: 'United States of America',
        sport: 'Swimming, Individual Medley and Butterfly',
    },
    {
        athlete: 'Natalie Anne Coughlin Hall, twelve-time medallist',
        country: 'United States of America',
        sport: 'Swimming, Backstroke and Freestyle',
    },
    {
        athlete: 'Aleksey Yuryevich Nemov, twelve-time medallist',
        country: 'Russian Federation',
        sport: 'Artistic Gymnastics, All-Around',
    },
];

let gridApi: GridApi<IRow>;

const gridOptions: GridOptions<IRow> = {
    columnDefs: columnDefs,
    rowData: shortRowData,
    autoSizeStrategy: {
        type: 'fitCellContents',
        continuous: true,
    },
};

function useLongerValues() {
    gridApi!.setGridOption('rowData', longRowData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
