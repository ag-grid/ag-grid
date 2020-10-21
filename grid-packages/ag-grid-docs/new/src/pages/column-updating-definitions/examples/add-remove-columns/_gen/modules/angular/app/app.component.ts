import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <button (click)="onBtExcludeMedalColumns()">Exclude Medal Columns</button>
      <button (click)="onBtIncludeMedalColumns()">Include Medal Columns</button>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [modules]="modules"
      [defaultColDef]="defaultColDef"
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
  private rowData: [];

  constructor(private http: HttpClient) {
    this.defaultColDef = {
      initialWidth: 100,
      sortable: true,
      resizable: true,
    };
  }

  onBtExcludeMedalColumns() {
    this.gridApi.setColumnDefs(colDefsMedalsExcluded);
  }

  onBtIncludeMedalColumns() {
    this.gridApi.setColumnDefs(colDefsMedalsIncluded);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.http
      .get(
        'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
      )
      .subscribe((data) => {
        this.onBtIncludeMedalColumns();
        this.rowData = data;
      });
  }
}

var colDefsMedalsIncluded = [
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
var colDefsMedalsExcluded = [
  { field: 'athlete' },
  { field: 'age' },
  { field: 'country' },
  { field: 'sport' },
  { field: 'year' },
  { field: 'date' },
];
