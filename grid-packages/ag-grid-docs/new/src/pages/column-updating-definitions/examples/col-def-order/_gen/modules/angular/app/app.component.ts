import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="onBtMedalsFirst()">Medals First</button>
      <button (click)="onBtMedalsLast()">Medals Last</button>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [modules]="modules"
      [defaultColDef]="defaultColDef"
      [applyColumnDefOrder]="true"
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
      defaultWidth: 100,
      sortable: true,
      resizable: true,
    };
    this.columnDefs = [
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

  onBtMedalsFirst() {
    this.gridApi.setColumnDefs(medalsFirst);
  }

  onBtMedalsLast() {
    this.gridApi.setColumnDefs(medalsLast);
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

var medalsLast = [
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
var medalsFirst = [
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
  { field: 'athlete' },
  { field: 'age' },
  { field: 'sport' },
  { field: 'country' },
  { field: 'year' },
  { field: 'date' },
];
