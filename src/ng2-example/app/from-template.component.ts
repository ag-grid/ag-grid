import {Component,ViewContainerRef,Input} from '@angular/core';
import {CommonModule} from "@angular/common"
import {FormsModule} from "@angular/forms"

import {GridOptions} from 'ag-grid/main';

@Component({
    selector: 'ag-from-template',
    templateUrl: 'app/from-template.component.html'
})
export class FromTemplateComponent {
    private gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    private createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 200},
            {
                headerName: "Square Template",
                field: "value",
                cellRendererFramework: {
                    template: '{{params.value * params.value}}'
                },
                width: 200
            },
            {
                headerName: "Currency Pipe Template",
                field: "value",
                cellRendererFramework: {
                    template: '{{params.value | currency}}',
                    moduleImports: [CommonModule]
                },
                width: 200
            },
            {
                headerName: "Row Params Template",
                field: "row",
                cellRendererFramework: {
                    template: 'Field: {{params.colDef.field}}, Value: {{params.value}}'
                },
                width: 250
            }
        ];
    }

    private createRowData() {
        let rowData:any[] = [];

        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i
            });
        }

        return rowData;
    }
}