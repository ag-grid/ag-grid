import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="onBtWithDefault()">Set Columns with Initials</button>
      <button (click)="onBtRemove()">Remove Columns</button>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
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

  private defaultColDef;
  private columnDefs;
  private rowData: [];

  constructor(private http: HttpClient) {
    this.defaultColDef = {
      initialWidth: 100,
      sortable: true,
      resizable: true,
    };
    this.columnDefs = getColumnDefs();
  }

  onBtWithDefault() {
    this.gridApi.setColumnDefs(getColumnDefs());
  }

  onBtRemove() {
    this.gridApi.setColumnDefs([]);
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
    {
      field: 'athlete',
      initialWidth: 100,
      initialSort: 'asc',
    },
    { field: 'age' },
    {
      field: 'country',
      initialPinned: 'left',
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}
