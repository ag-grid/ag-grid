import {Component} from "@angular/core";

import {GridOptions} from "ag-grid";
import {SquareComponent} from "./square.component";
import {ParamsComponent} from "./params.component";
import {CubeComponent} from "./cube.component";
import {CurrencyComponent} from "./currency.component";
import {ChildMessageComponent} from "./child-message.component";

@Component({
    selector: 'my-app',
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
            {headerName: "Row", field: "row", width: 130},
            {
                headerName: "Square",
                field: "value",
                cellRendererFramework: SquareComponent,
                editable: true,
                colId: "square",
                width: 130
            },
            {
                headerName: "Cube",
                field: "value",
                cellRendererFramework: CubeComponent,
                colId: "cube",
                width: 130
            },
            {
                headerName: "Row Params",
                field: "row",
                cellRendererFramework: ParamsComponent,
                colId: "params",
                width: 213
            },
            {
                headerName: "Currency (Pipe)",
                field: "currency",
                cellRendererFramework: CurrencyComponent,
                colId: "params",
                width: 130
            },
            {
                headerName: "Child/Parent",
                field: "value",
                cellRendererFramework: ChildMessageComponent,
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