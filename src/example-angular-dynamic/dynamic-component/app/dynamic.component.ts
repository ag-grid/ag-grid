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
            rowData: DynamicComponent.createRowData(),
            columnDefs: DynamicComponent.createColumnDefs(),
            context: {
                componentParent: this
            }
        };
    }

    // noinspection JSMethodCanBeStatic
    public methodFromParent(cell) {
        alert(`"Parent Component Method from ${cell}!`);
    }

    private static createColumnDefs() {
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
                colId: "currency",
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

    public refreshEvenRowsCurrencyData() {
        this.gridOptions.api.forEachNode(rowNode => {
            if (rowNode.data.value % 2 === 0) {
                rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)))
            }
        });

        this.gridOptions.api.refreshCells({
            columns: ['currency']
        })
    }

    private static createRowData() {
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