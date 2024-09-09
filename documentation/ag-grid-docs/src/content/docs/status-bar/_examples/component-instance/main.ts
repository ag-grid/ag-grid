import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';

import { ClickableStatusBarComponent } from './clickableStatusBarComponent_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule, StatusBarModule]);

export interface IClickableStatusBar {
    setVisible(visible: boolean): void;
    isVisible(): boolean;
}

const columnDefs: ColDef[] = [
    {
        field: 'row',
    },
    {
        field: 'name',
    },
];

function toggleStatusBarComp() {
    const statusBarComponent = gridApi!.getStatusPanel<IClickableStatusBar>('statusBarCompKey')!;
    statusBarComponent.setVisible(!statusBarComponent.isVisible());
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    columnDefs: columnDefs,
    rowData: [
        { row: 'Row 1', name: 'Michael Phelps' },
        { row: 'Row 2', name: 'Natalie Coughlin' },
        { row: 'Row 3', name: 'Aleksey Nemov' },
        { row: 'Row 4', name: 'Alicia Coutts' },
        { row: 'Row 5', name: 'Missy Franklin' },
        { row: 'Row 6', name: 'Ryan Lochte' },
        { row: 'Row 7', name: 'Allison Schmitt' },
        { row: 'Row 8', name: 'Natalie Coughlin' },
        { row: 'Row 9', name: 'Ian Thorpe' },
        { row: 'Row 10', name: 'Bob Mill' },
        { row: 'Row 11', name: 'Willy Walsh' },
        { row: 'Row 12', name: 'Sarah McCoy' },
        { row: 'Row 13', name: 'Jane Jack' },
        { row: 'Row 14', name: 'Tina Wills' },
    ],
    selection: {
        mode: 'multiRow',
        checkboxes: false,
        headerCheckbox: false,
    },
    statusBar: {
        statusPanels: [
            {
                statusPanel: ClickableStatusBarComponent,
                key: 'statusBarCompKey',
            },
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    aggFuncs: ['count', 'sum'],
                },
            },
        ],
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
