import {Component,OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common"

import {AgRendererComponent} from 'ag-grid-ng2/main';
import {GridOptions,RowNode} from 'ag-grid/main';

@Component({
    selector: 'full-width-cell',
    template: `<span>Full Width Column! {{ values }}</span>`
})
class FullWidthComponent implements AgRendererComponent {
    private params:any;
    private values:string;

    agInit(params:any):void {
        this.params = params;
        this.values = `Name: ${params.data.name}, Age: ${params.data.age}`
    }
}

@Component({
    selector: 'ag-full-width-renderer-component',
    templateUrl: 'app/full-width-renderer.component.html'
})
export class WithFullWidthComponent {
    private gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.isFullWidthCell = (rowNode:RowNode)=> {
            return (rowNode.id === "0") || (parseInt(rowNode.id) % 2 === 0);
        };
        this.gridOptions.fullWidthCellRendererFramework = {
            component: FullWidthComponent
        }
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Name",
                field: "name",
                width: 200
            },
            {
                headerName: "Age",
                field: "age",
                width: 180
            },
        ];
    }

    private createRowData() {
        return [
            {name: "Bob", age: 10},
            {name: "Harry", age: 3},
            {name: "Sally", age: 20},
            {name: "Mary", age: 5},
            {name: "John", age: 15},
        ];
    }
}