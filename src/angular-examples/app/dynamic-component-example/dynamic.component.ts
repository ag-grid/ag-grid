import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {SquareComponent} from "./square.component";
import {ParamsComponent} from "./params.component";
import {CubeComponent} from "./cube.component";
import {CurrencyComponent} from "./currency.component";
import {ChildMessageComponent} from "./child-message.component";

@Component({
    selector: 'ag-from-component',
    templateUrl: './dynamic.component.html'
})
export class DynamicComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            }
        };
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    public methodFromParent(cell) {
        alert(`"Parent Component Method from ${cell}!`);
    }

    private createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 100},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: SquareComponent,
                editable: true,
                colId: "square",
                width: 100
            },
            {
                headerName: "Cube",
                field: "value",
                cellRendererFramework: CubeComponent,
                colId: "cube",
                width: 100
            },
            {
                headerName: "Row Params",
                field: "row",
                cellRendererFramework: ParamsComponent,
                colId: "params",
                width: 215
            },
            {
                headerName: "Currency (Pipe)",
                field: "currency",
                cellRendererFramework: CurrencyComponent,
                colId: "params",
                width: 135
            },
            {
                headerName: "Child/Parent",
                field: "value",
                cellRendererFramework: ChildMessageComponent,
                colId: "params",
                width: 120
            }
        ];
    }

    public refreshRowData() {
        let rowData = this.createRowData();
        this.gridOptions.api.setRowData(rowData);
    }

    private createRowData() {
        let rowData: any[] = [];

        for (let i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i,
                currency: i + Number(Math.random().toFixed(2))
            });
        }

        return rowData;
    }
}