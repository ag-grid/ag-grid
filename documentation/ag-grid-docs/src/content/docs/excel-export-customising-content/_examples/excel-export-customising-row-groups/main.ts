import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ExcelExportParams,
    GridApi,
    GridOptions,
    ProcessCellForExportParams,
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

const getParams: () => ExcelExportParams = () => ({
    processCellCallback(params: ProcessCellForExportParams): string {
        const value = params.value;
        return value === undefined ? '' : `_${value}_`;
    },
    processRowGroupCallback(params: ProcessRowGroupForExportParams): string {
        const { node } = params;

        if (!node.footer) {
            return `row group: ${node.key}`;
        }
        const isRootLevel = node.level === -1;

        if (isRootLevel) {
            return 'Grand Total';
        }
        return `Sub Total (${node.key})`;
    },
});

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200, rowGroup: true, hide: true },
        { field: 'sport', minWidth: 150 },
        { field: 'gold', aggFunc: 'sum' },
    ],

    defaultColDef: {
        filter: true,
        minWidth: 150,
        flex: 1,
    },

    groupTotalRow: 'bottom',
    grandTotalRow: 'bottom',

    popupParent: document.body,
    defaultExcelExportParams: getParams(),
};

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
