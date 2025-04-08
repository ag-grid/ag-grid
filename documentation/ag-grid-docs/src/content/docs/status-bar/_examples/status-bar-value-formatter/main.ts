import type { GridApi, GridOptions, IStatusPanelValueFormatterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { CellSelectionModule, StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CellSelectionModule,
    StatusBarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'age' },
        { field: 'country', minWidth: 200 },
        { field: 'year' },
        { field: 'date', minWidth: 180 },
        { field: 'sport', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'agTotalRowCountComponent',
                align: 'left',
                statusPanelParams: {
                    valueFormatter: (params: IStatusPanelValueFormatterParams) => {
                        const { value } = params;
                        if (value > 1000) {
                            return (value / 1000).toFixed(1) + ' K';
                        }
                        return String(value);
                    },
                },
            },
        ],
    },
    cellSelection: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
