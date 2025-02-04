import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule, IntegratedChartsModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false, month: 'October' },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false, month: 'August' },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true, month: 'February' },
        { make: 'Fiat', model: '500', price: 15774, electric: false, month: 'January' },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false, month: 'March' },
        { make: 'Vauxhall', model: 'Corsa', price: 18460, electric: false, month: 'July' },
        { make: 'Volvo', model: 'EX30', price: 33795, electric: true, month: 'September' },
        { make: 'Mercedes', model: 'Maybach', price: 175720, electric: false, month: 'December' },
        { make: 'Vauxhall', model: 'Astra', price: 25795, electric: false, month: 'April' },
        { make: 'Fiat', model: 'Panda', price: 13724, electric: false, month: 'November' },
        { make: 'Jaguar', model: 'I-PACE', price: 69425, electric: true, month: 'May' },
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false, month: 'October' },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false, month: 'August' },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true, month: 'February' },
        { make: 'Fiat', model: '500', price: 15774, electric: false, month: 'January' },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false, month: 'March' },
        { make: 'Vauxhall', model: 'Corsa', price: 18460, electric: false, month: 'July' },
        { make: 'Volvo', model: 'EX30', price: 33795, electric: true, month: 'September' },
        { make: 'Mercedes', model: 'Maybach', price: 175720, electric: false, month: 'December' },
        { make: 'Vauxhall', model: 'Astra', price: 25795, electric: false, month: 'April' },
        { make: 'Fiat', model: 'Panda', price: 13724, electric: false, month: 'November' },
        { make: 'Jaguar', model: 'I-PACE', price: 69425, electric: true, month: 'May' },
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true, month: 'June' },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false, month: 'October' },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false, month: 'August' },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true, month: 'February' },
        { make: 'Fiat', model: '500', price: 15774, electric: false, month: 'January' },
        { make: 'Nissan', model: 'Juke', price: 20675, electric: false, month: 'March' },
        { make: 'Vauxhall', model: 'Corsa', price: 18460, electric: false, month: 'July' },
        { make: 'Volvo', model: 'EX30', price: 33795, electric: true, month: 'September' },
        { make: 'Mercedes', model: 'Maybach', price: 175720, electric: false, month: 'December' },
        { make: 'Vauxhall', model: 'Astra', price: 25795, electric: false, month: 'April' },
        { make: 'Fiat', model: 'Panda', price: 13724, electric: false, month: 'November' },
        { make: 'Jaguar', model: 'I-PACE', price: 69425, electric: true, month: 'May' },
    ],
    columnDefs: [
        // Group by 'make', hiding it once grouped
        { field: 'make', rowGroup: true, hide: true },
        { field: 'model' },
        // Aggregate the average price per group
        { field: 'price', filter: 'agNumberColumnFilter', aggFunc: 'avg' },
        { field: 'electric' },
        { field: 'month' },
    ],
    defaultColDef: {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
    },
    groupDisplayType: 'singleColumn',
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: (params) => {
        params.api.createRangeChart({
            cellRange: {
                rowStartIndex: 0,
                rowEndIndex: 8,
                columns: ['model', 'price'],
            },
            chartType: 'groupedColumn',
            chartThemeOverrides: {
                common: {
                    title: {
                        enabled: true,
                        text: 'Average Price by Make',
                    },
                },
            },
        });
    },
    sideBar: {
        toolPanels: [
            'columns',
            'filters',
            {
                id: 'charts',
                labelDefault: 'Charts',
                labelKey: 'charts',
                iconKey: 'chart',
                toolPanel: 'agChartsToolPanel',
            },
        ],
        defaultToolPanel: 'columns',
    },
};

const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
gridApi = createGrid(gridDiv, gridOptions);
