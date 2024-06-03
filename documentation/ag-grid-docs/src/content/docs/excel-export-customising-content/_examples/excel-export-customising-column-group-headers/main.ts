import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ExcelExportParams,
    GridApi,
    GridOptions,
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
    createGrid,
} from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Athlete details',
            children: [
                { field: 'athlete', minWidth: 200 },
                { field: 'country', minWidth: 150 },
                { field: 'sport', minWidth: 150 },
            ],
        },
        {
            headerName: 'Medal results',
            children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
        },
    ],

    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },

    popupParent: document.body,
};

const getParams: () => ExcelExportParams = () => ({
    processHeaderCallback(params: ProcessHeaderForExportParams): string {
        return `header: ${params.api.getDisplayNameForColumn(params.column, null)}`;
    },
    processGroupHeaderCallback(params: ProcessGroupHeaderForExportParams): string {
        return `group header: ${params.api.getDisplayNameForColumnGroup(params.columnGroup, null)}`;
    },
});

function onBtExport() {
    gridApi!.exportDataAsExcel(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data) =>
            gridApi!.setGridOption(
                'rowData',
                data.filter((rec: any) => rec.country != null)
            )
        );
});
