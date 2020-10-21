import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="setHeaderNames()">Set Header Names</button>
      <button (click)="removeHeaderNames()">Remove Header Names</button>
      <button (click)="setValueFormatters()">Set Value Formatters</button>
      <button (click)="removeValueFormatters()">Remove Value Formatters</button>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [modules]="modules"
      [defaultColDef]="defaultColDef"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  </div> `,
})
export class AppComponent {
  private gridApi;
  private gridColumnApi;

  public modules: Module[] = [ClientSideRowModelModule];
  private defaultColDef;
  private columnDefs;
  private rowData: [];

  constructor(private http: HttpClient) {
    this.defaultColDef = {
      initialWidth: 100,
      sortable: true,
      resizable: true,
      filter: true,
    };
    this.columnDefs = getColumnDefs();
  }

  setHeaderNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.headerName = 'C' + index;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  removeHeaderNames() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.headerName = undefined;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  setValueFormatters() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.valueFormatter = function (params) {
        return '[ ' + params.value + ' ]';
      };
    });
    this.gridApi.setColumnDefs(columnDefs);
    this.gridApi.refreshCells({ force: true });
  }

  removeValueFormatters() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef, index) {
      colDef.valueFormatter = undefined;
    });
    this.gridApi.setColumnDefs(columnDefs);
    this.gridApi.refreshCells({ force: true });
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
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}
