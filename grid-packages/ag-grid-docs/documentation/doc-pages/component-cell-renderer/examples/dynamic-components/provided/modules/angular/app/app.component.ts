import {Component} from '@angular/core';
import {AllCommunityModules, Module, RowNode, GridReadyEvent} from '@ag-grid-community/all-modules';
import {ChildMessageRenderer} from './child-message-renderer.component';
import {CubeRenderer} from './cube-renderer.component';
import {CurrencyRenderer} from './currency-renderer.component';
import {ParamsRenderer} from './params-renderer.component';
import {SquareRenderer} from './square-renderer.component';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
        <button (click)="refreshEvenRowsCurrencyData()" style="margin-bottom: 10px" class="btn btn-primary">
            Refresh Even Row Currency Data
        </button>
        <ag-grid-angular
                #agGrid
                style="width: 100%; height: 100%;"
                id="myGrid"
                class="ag-theme-alpine"
                [modules]="modules"
                [columnDefs]="columnDefs"
                [rowData]="rowData"
                [context]="context"
                [frameworkComponents]="frameworkComponents"
                [defaultColDef]="defaultColDef"
                (gridReady)="onGridReady($event)"
        ></ag-grid-angular>
        </div>`
})
export class AppComponent {
    private gridApi;
    private gridColumnApi;

    public modules: Module[] = AllCommunityModules;
    private columnDefs = [
        {
            headerName: "Row",
            field: "row",
            width: 150
        },
        {
            headerName: "Square",
            field: "value",
            cellRenderer: "squareRenderer",
            editable: true,
            colId: "square",
            width: 150
        },
        {
            headerName: "Cube",
            field: "value",
            cellRenderer: "cubeRenderer",
            colId: "cube",
            width: 150
        },
        {
            headerName: "Row Params",
            field: "row",
            cellRenderer: "paramsRenderer",
            colId: "params",
            width: 150
        },
        {
            headerName: "Currency (Pipe)",
            field: "currency",
            cellRenderer: "currencyRenderer",
            colId: "currency",
            width: 120
        },
        {
            headerName: "Child/Parent",
            field: "value",
            cellRenderer: "childMessageRenderer",
            colId: "params",
            editable: false,
            minWidth: 150
        }
    ];

    private frameworkComponents = {
        squareRenderer: SquareRenderer,
        cubeRenderer: CubeRenderer,
        paramsRenderer: ParamsRenderer,
        currencyRenderer: CurrencyRenderer,
        childMessageRenderer: ChildMessageRenderer
    };

    private defaultColDef = {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    };

    private rowData: any[];
    private context: any;

    constructor() {
        this.rowData = this.createRowData();
        this.context = {componentParent: this};
    }

    refreshEvenRowsCurrencyData() {
        this.gridApi.forEachNode((rowNode:RowNode) => {
            if (rowNode.data.value % 2 === 0) {
                rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)));
            }
        });
        this.gridApi.refreshCells({columns: ['currency']});
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    methodFromParent(cell: any) {
        alert("Parent Component Method from " + cell + "!");
    }

    createRowData() {
        const rowData = [];
        for (let i = 0; i < 15; i++) {
            rowData.push({
                row: 'Row ' + i,
                value: i,
                currency: i + Number(Math.random().toFixed(2))
            });
        }
        return rowData;
    }
}

