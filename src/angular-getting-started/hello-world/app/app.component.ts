import { Component } from '@angular/core';

export class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: `
    <ag-grid-angular style="width: 500px; height: 115px;" class="ag-fresh"
                 [rowData]="rowData"
                 [columnDefs]="columnDefs">
</ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs;
    rowData;

    constructor() {
        this.columnDefs = [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}
        ];

        this.rowData = [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ]
    }

    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }
}
