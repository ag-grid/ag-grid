import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberFilterModule,
    RowApiModule,
    ScrollApiModule,
    TextFilterModule,
} from 'ag-grid-community';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

// Minimal module set (no validation module) so dev-mode checks don't skew the comparison.
// The API modules are needed for the harness calls: an unregistered API logs error #200 and no-ops.
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    ColumnApiModule,
    RowApiModule,
    ScrollApiModule,
    TextFilterModule,
    NumberFilterModule,
]);

export interface RowData {
    id: number;
    athlete: string;
    country: string;
    sport: string;
    age: number;
    year: number;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

export const columnDefs: ColDef<RowData>[] = [
    { field: 'id', filter: 'agNumberColumnFilter' },
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'country', filter: 'agTextColumnFilter' },
    { field: 'sport', filter: 'agTextColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter' },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    { field: 'silver', filter: 'agNumberColumnFilter' },
    { field: 'bronze', filter: 'agNumberColumnFilter' },
    { field: 'total', filter: 'agNumberColumnFilter' },
];

export const defaultColDef: ColDef<RowData> = {
    flex: 1,
    minWidth: 110,
    sortable: true,
};

// Row data / datasource are supplied by the harness (src/javascript/main.ts) so that the
// 1M-row generation is not part of any measurement.
export const gridOptions: GridOptions<RowData> = {
    columnDefs,
    defaultColDef,
    getRowId: ({ data }) => String(data.id),
};
