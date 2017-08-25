import {Component} from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {StyledComponent} from "./styled-renderer.component";

@Component({
    selector: 'ag-pinned-row-renderer-component',
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
                width: 400,
                pinnedRowCellRendererFramework: StyledComponent,
                pinnedRowCellRendererParams: {
                    style: {'font-weight': 'bold'}
                }
            },
            {
                headerName: "Number",
                field: "number",
                width: 399,
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