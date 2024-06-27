import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    GridApi,
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';

import { AG_GRID_LOCALE_DE } from 'ag-grid-locale';

import { zzzLocale } from './locale';

// Create a dummy locale based on english but prefix everything with zzz
const AG_GRID_LOCALE_ZZZ: Record<string, string> = zzzLocale(AG_GRID_LOCALE_DE);

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    GridChartsModule,
    MenuModule,
    MultiFilterModule,
    RangeSelectionModule,
    RowGroupingModule,
    SetFilterModule,
    SideBarModule,
    StatusBarModule,
]);

class NodeIdRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.textContent = params.node!.id! + 1;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

const columnDefs: ColDef[] = [
    // this row just shows the row index, doesn't use any data from the row
    {
        headerName: '#',
        cellRenderer: NodeIdRenderer,
        checkboxSelection: true,
        headerCheckboxSelection: true,
    },
    { field: 'athlete', filterParams: { buttons: ['clear', 'reset', 'apply'] } },
    {
        field: 'age',
        filterParams: { buttons: ['apply', 'cancel'] },
        enablePivot: true,
    },
    { field: 'country', enableRowGroup: true },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'date' },
    {
        field: 'sport',
        filter: 'agMultiColumnFilter',
        filterParams: {
            filters: [
                {
                    filter: 'agTextColumnFilter',
                    display: 'accordion',
                },
                {
                    filter: 'agSetColumnFilter',
                    display: 'accordion',
                },
            ],
        },
    },
    { field: 'gold', enableValue: true },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    sideBar: true,
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
            { statusPanel: 'agAggregationComponent' },
        ],
    },
    rowGroupPanelShow: 'always',
    pagination: true,
    paginationPageSize: 500,
    paginationPageSizeSelector: [100, 500, 1000],
    enableRangeSelection: true,
    enableCharts: true,
    localeText: AG_GRID_LOCALE_ZZZ,
    rowSelection: 'multiple',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
