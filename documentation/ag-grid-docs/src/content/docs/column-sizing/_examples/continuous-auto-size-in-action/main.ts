import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    PaginationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ColumnAutoSizeModule, PaginationModule, ClientSideRowModelModule]);

// The text columns below are built by pairing a phrase shape with a rotating pair of fields, so that
// every generated column holds a different sentence of a different length. That variety is the point:
// with continuous auto-sizing each column tracks the longest value on the page currently in view, so
// the columns move independently as you page through the data.
const PHRASE_SHAPES: ((first: string, second: string, data: IOlympicData) => string)[] = [
    (first) => first,
    (first, second) => `${first} / ${second}`,
    (first, second, data) => `${first} — ${second}, ${data.year}`,
    (first, second) => `${first} (${second})`,
    (first, second, data) => `${first} of ${second}, ${data.total} medal(s)`,
    (first, second, data) => `${first} competing in ${second} at the ${data.year} games`,
];

const PHRASE_FIELDS: (keyof IOlympicData)[] = ['athlete', 'country', 'sport', 'date'];

const GENERATED_GROUPS = ['Profile', 'Season', 'Coverage', 'Records'];
const COLUMNS_PER_GENERATED_GROUP = 6;

function generatedColumn(index: number): ColDef<IOlympicData> {
    // The shape cycles fastest and the field pair advances only once the shapes have been exhausted,
    // so the two never come back into step: all 6 x 4 combinations are used before any repeats.
    const shape = PHRASE_SHAPES[index % PHRASE_SHAPES.length];
    const fieldIndex = Math.floor(index / PHRASE_SHAPES.length) % PHRASE_FIELDS.length;
    const first = PHRASE_FIELDS[fieldIndex];
    const second = PHRASE_FIELDS[(fieldIndex + 1) % PHRASE_FIELDS.length];

    return {
        colId: `text${index + 1}`,
        headerName: `Text ${index + 1}`,
        valueGetter: ({ data }) => (data ? shape(String(data[first]), String(data[second]), data) : ''),
    };
}

const generatedGroups: ColGroupDef<IOlympicData>[] = GENERATED_GROUPS.map((headerName, groupIndex) => ({
    headerName,
    children: Array.from({ length: COLUMNS_PER_GENERATED_GROUP }, (_, childIndex) =>
        generatedColumn(groupIndex * COLUMNS_PER_GENERATED_GROUP + childIndex)
    ),
}));

const columnDefs: ColGroupDef<IOlympicData>[] = [
    {
        headerName: 'Competitor',
        children: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
    },
    ...generatedGroups,
    {
        headerName: 'Event',
        children: [{ field: 'sport' }, { field: 'year' }, { field: 'date' }],
    },
    {
        headerName: 'Medals',
        children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }, { field: 'total' }],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [20, 50, 100],
    autoSizeStrategy: {
        type: 'fitCellContents',
        continuous: true,
        shouldAutoSizeColumns: () => true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
