import {Component} from '@angular/core';

import {GridOptions} from 'ag-grid/main';
import {SquareComponent} from "./square.component";
import {ParamsComponent} from "./params.component";
import {CubeComponent} from "./cube.component";
import {CurrencyComponent} from "./currency.component";

@Component({
    moduleId: module.id,
    selector: 'ag-from-component',
    templateUrl: 'from-component.component.html'
})
export class FromComponentComponent {
    public gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    private onCellValueChanged($event) {
        this.gridOptions.api.refreshCells([$event.node],["cube"]);
    }

    private createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 140},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: SquareComponent,
                editable:true,
                colId: "square",
                width: 125
            },
            {
                headerName: "Cube",
                field: "value",
                cellRendererFramework: CubeComponent,
                colId: "cube",
                width: 125
            },
            {
                headerName: "Row Params",
                field: "row",
                cellRendererFramework: ParamsComponent,
                colId: "params",
                width: 245
            },
            {
                headerName: "Currency (Pipe)",
                field: "currency",
                cellRendererFramework: CurrencyComponent,
                colId: "params",
                width: 150
            }
        ];
    }

    public refreshRowData() {
        let rowData = this.createRowData();
        this.gridOptions.api.setRowData(rowData);
    }

    private createRowData() {
        let rowData:any[] = [];

        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i,
                currency: i + Number(Math.random().toFixed(2))
            });
        }

        return rowData;
    }
}