import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowSelectionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

// AG Studio contributes a `studio` bean to every grid it creates, and the deselect-on-click behaviour
// this page exercises is gated on that bean. This stands in for it so the behaviour can be driven here.
class StudioStub {
    beanName = 'studio' as const;
}

const StudioStubModule: Module = {
    moduleName: 'Studio' as Module['moduleName'],
    version: ClientSideRowModelModule.version,
    beans: [StudioStub],
};

ModuleRegistry.registerModules([
    RowSelectionModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    StudioStubModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [{ field: 'athlete' }, { field: 'sport' }, { field: 'year', maxWidth: 120 }],
    defaultColDef: { flex: 1, minWidth: 100 },
    rowSelection: {
        mode: 'singleRow',
        checkboxes: false,
        enableClickSelection: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
