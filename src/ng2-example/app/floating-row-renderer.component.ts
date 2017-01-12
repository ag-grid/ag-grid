import {Component} from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {StyledComponent} from "./styled-renderer.component";

@Component({
    moduleId: module.id,
    selector: 'ag-floating-row-renderer-component',
    templateUrl: 'floating-row-renderer.component.html'
})
export class WithFloatingRowComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.floatingTopRowData = [
            {row: "Top Row", number: "Top Number"}
        ];
        this.gridOptions.floatingBottomRowData = [
            {row: "Bottom Row", number: "Bottom Number"}
        ];
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Row",
                field: "row",
                width: 400,
                floatingCellRendererFramework: StyledComponent,
                floatingCellRendererParams: {
                    style: {'font-weight': 'bold'}
                }
            },
            {
                headerName: "Number",
                field: "number",
                width: 399,
                floatingCellRendererFramework: StyledComponent,
                floatingCellRendererParams: {
                    style: {'font-style': 'italic'}
                }
            },
        ];
    }

    private createRowData() {
        let rowData: any[] = [];

        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                number: Math.round(Math.random() * 100)
            });
        }

        return rowData;
    }
}