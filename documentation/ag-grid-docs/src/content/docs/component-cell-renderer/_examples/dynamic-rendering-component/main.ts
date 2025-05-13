import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    GridApi,
    GridOptions,
    ICellRendererParams,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

import { GenderRenderer } from './genderRenderer_typescript';
import { MoodRenderer } from './moodRenderer_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IRow {
    value: number | string;
    type: 'age' | 'gender' | 'mood';
}

const rowData: IRow[] = [
    { value: 14, type: 'age' },
    { value: 'Female', type: 'gender' },
    { value: 'Happy', type: 'mood' },
    { value: 21, type: 'age' },
    { value: 'Male', type: 'gender' },
    { value: 'Sad', type: 'mood' },
];

let gridApi: GridApi<IRow>;

const gridOptions: GridOptions<IRow> = {
    columnDefs: [
        { field: 'value' },
        {
            headerName: 'Rendered Value',
            field: 'value',
            cellRendererSelector: (params: ICellRendererParams<IRow>) => {
                const moodDetails = {
                    component: MoodRenderer,
                };

                const genderDetails = {
                    component: GenderRenderer,
                    params: { values: ['Male', 'Female'] },
                };
                if (params.data) {
                    if (params.data.type === 'gender') return genderDetails;
                    else if (params.data.type === 'mood') return moodDetails;
                }
                return undefined;
            },
        },
        { field: 'type' },
    ],
    defaultColDef: {
        flex: 1,
        cellDataType: false,
    },
    rowData: rowData,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
