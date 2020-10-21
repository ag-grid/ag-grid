import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="onBtWithState()">Set Columns with State</button>
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
      pinned: null,
      sort: null,
    };
    this.columnDefs = getColumnDefs();
  }

  onBtWithState() {
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
      width: 100,
      sort: 'asc',
    },
    { field: 'age' },
    {
      field: 'country',
      pinned: 'left',
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
