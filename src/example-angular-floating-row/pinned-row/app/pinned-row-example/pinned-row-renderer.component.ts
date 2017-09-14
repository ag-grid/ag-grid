import {Component} from "@angular/core";
import {GridOptions} from "ag-grid";

import {StyledComponent} from "./styled-renderer.component";

@Component({
    selector: 'my-app',
    templateUrl: './pinned-row-renderer.component.html'
})
export class PinnedRowComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.pinnedTopRowData = [
            {row: "Top Row", number: "Top Number"}
        ];
        this.gridOptions.pinnedBottomRowData = [
            {row: "Bottom Row", number: "Bottom Number"}
        ];
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Row",
                field: "row",
                width: 450,
                pinnedRowCellRendererFramework: StyledComponent,
                pinnedRowCellRendererParams: {
                    style: {'font-weight': 'bold'}
                }
            },
            {
                headerName: "Number",
                field: "number",
                width: 430,
                pinnedRowCellRendererFramework: StyledComponent,
                pinnedRowCellRendererParams: {
                    style: {'font-style': 'italic'}
                }
            },
        ];
    }

    private createRowData() {
        let rowData: any[] = [];

        for (let i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                number: Math.round(Math.random() * 100)
            });
        }

        return rowData;
    }
}