import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { CustomHeader } from './custom-header.component';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="onBtUpperNames()">Upper Header Names</button>
      <button (click)="onBtLowerNames()">Lower Lower Names</button>
      &nbsp;&nbsp;&nbsp;
      <button (click)="onBtFilterOn()">Filter On</button>
      <button (click)="onBtFilterOff()">Filter Off</button>
      &nbsp;&nbsp;&nbsp;
      <button (click)="onBtResizeOn()">Resize On</button>
      <button (click)="onBtResizeOff()">Resize Off</button>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [frameworkComponents]="frameworkComponents"
      [defaultColDef]="defaultColDef"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  </div> `,
})
export class AppComponent {
  private gridApi;
  private gridColumnApi;

  private columnDefs;
  private frameworkComponents;
  private defaultColDef;
  private rowData: [];

  constructor(private http: HttpClient) {
    this.columnDefs = getColumnDefs();
    this.frameworkComponents = { CustomHeader: CustomHeader };
    this.defaultColDef = { headerComponent: 'CustomHeader' };
  }

  onBtUpperNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field.toUpperCase();
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtLowerNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.headerName = c.field;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtFilterOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = true;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtFilterOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.filter = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtResizeOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = true;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtResizeOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (c) {
      c.resizable = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.http
      .get(
        'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
      )
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}

function getColumnDefs() {
  return [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}
