import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    RowApiModule,
    RowSelectionModule,
    ValidationModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PinnedRowModule,
    RowSelectionModule,
    RowApiModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: columnDefs,
    rowData: null,
    enableRowPinning: true,
    isRowPinned: (node) => (!node.data?.country ? 'top' : null),
    rowSelection: {
        mode: 'multiRow',
    },
    onFirstDataRendered: () => {
        ['1', '3', '5'].forEach((id) => {
            gridApi.getRowNode(id)?.setSelected(true);
        });
    },
    theme: themeQuartz.withParams({
        pinnedRowBorder: {
            width: 2,
        },
    }),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
