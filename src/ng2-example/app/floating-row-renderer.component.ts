import {Component,OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common"

import {AgRendererComponent} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';

@Component({
    selector: 'floating-cell',
    template: `<span [ngStyle]="style">{{params.value}}</span>`
})
class StyledFloatingRowComponent implements AgRendererComponent {
    private params:any;
    private style:string;

    agInit(params:any):void {
        this.params = params;
        this.style = this.params.style;
    }
}

@Component({
    selector: 'ag-floating-row-renderer-component',
    templateUrl: 'app/floating-row-renderer.component.html'
})
export class WithFloatingRowComponent {
    private gridOptions:GridOptions;

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
                width: 200,
                floatingCellRendererFramework: {
                    component: StyledFloatingRowComponent,
                    moduleImports: [CommonModule]
                },
                floatingCellRendererParams: {
                    style: {'font-weight':  'bold'}
                }
            },
            {
                headerName: "Number",
                field: "number",
                width: 180,
                floatingCellRendererFramework: {
                    component: StyledFloatingRowComponent,
                    moduleImports: [CommonModule]
                },
                floatingCellRendererParams: {
                    style: {'font-style':  'italic'}
                }
            },
        ];
    }

    private createRowData() {
        let rowData:any[] = [];

        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                number: Math.round(Math.random() * 100)
            });
        }

        return rowData;
    }
}