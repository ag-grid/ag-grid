import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnApiModule, ColumnAutoSizeModule, ClientSideRowModelModule]);

interface IRow {
    athlete: string;
    country: string;
    sport: string;
}

const columnDefs: ColDef<IRow>[] = [
    { field: 'athlete', width: 150, suppressAutoSize: true },
    { field: 'country', initialWidth: 120 },
    { field: 'sport' },
];

const ROW_DATA_SETS: IRow[][] = [
    [
        { athlete: 'Michael Phelps', country: 'US', sport: 'Swimming' },
        { athlete: 'Natalie Coughlin', country: 'US', sport: 'Swimming' },
        { athlete: 'Aleksey Nemov', country: 'RU', sport: 'Gymnastics' },
    ],
    [
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
    ],
    [
        { athlete: 'Ian Thorpe', country: 'Australia', sport: 'Swimming' },
        { athlete: 'Marit Bjoergen', country: 'Norway', sport: 'Cross Country Skiing' },
        { athlete: 'Ole Einar Bjoerndalen', country: 'Norway', sport: 'Biathlon' },
    ],
    [
        { athlete: 'Sun Yang', country: 'China', sport: 'Swimming' },
        { athlete: 'Kohei Uchimura', country: 'Japan', sport: 'Artistic Gymnastics' },
        { athlete: 'Yohan Blake', country: 'Jamaica', sport: 'Athletics' },
    ],
];

let dataSetIndex = 0;

let gridApi: GridApi<IRow>;

const gridOptions: GridOptions<IRow> = {
    columnDefs: columnDefs,
    rowData: ROW_DATA_SETS[0],
    autoSizeStrategy: {
        type: 'fitCellContents',
        continuous: true,
    },
};

function nextValues() {
    dataSetIndex = (dataSetIndex + 1) % ROW_DATA_SETS.length;
    gridApi!.setGridOption('rowData', ROW_DATA_SETS[dataSetIndex]);
}

function releaseWidths() {
    gridApi!.resetColumnState();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
