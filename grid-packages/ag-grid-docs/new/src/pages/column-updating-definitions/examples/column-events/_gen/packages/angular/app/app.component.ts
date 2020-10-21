import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

@Component({
  selector: 'my-app',
  template: `<div class="test-container">
    <div class="test-header">
      <div class="test-button-row">
        <div class="test-button-group">
          <button (click)="onBtSortOn()">Sort On</button>
          <br />
          <button (click)="onBtSortOff()">Sort Off</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtWidthNarrow()">Width Narrow</button>
          <br />
          <button (click)="onBtWidthNormal()">Width Normal</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtHide()">Hide Cols</button>
          <br />
          <button (click)="onBtShow()">Show Cols</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtPivotOn()">Pivot On</button>
          <br />
          <button (click)="onBtPivotOff()">Pivot Off</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtRowGroupOn()">Row Group On</button>
          <br />
          <button (click)="onBtRowGroupOff()">Row Group Off</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtAggFuncOn()">Agg Func On</button>
          <br />
          <button (click)="onBtAggFuncOff()">Agg Func Off</button>
        </div>
        <div class="test-button-group">
          <button (click)="onBtPinnedOn()">Pinned On</button>
          <br />
          <button (click)="onBtPinnedOff()">Pinned Off</button>
        </div>
      </div>
    </div>
    <ag-grid-angular
      #agGrid
      style="width: 100%; height: 100%;"
      id="myGrid"
      class="ag-theme-alpine"
      [defaultColDef]="defaultColDef"
      [debug]="true"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      (sortChanged)="onSortChanged($event)"
      (columnResized)="onColumnResized($event)"
      (columnVisible)="onColumnVisible($event)"
      (columnPivotChanged)="onColumnPivotChanged($event)"
      (columnRowGroupChanged)="onColumnRowGroupChanged($event)"
      (columnValueChanged)="onColumnValueChanged($event)"
      (columnMoved)="onColumnMoved($event)"
      (columnPinned)="onColumnPinned($event)"
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
      sortable: true,
      resizable: true,
      width: 150,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
    };
    this.columnDefs = getColumnDefs();
  }

  onSortChanged(e) {
    console.log('Event Sort Changed', e);
  }

  onColumnResized(e) {
    console.log('Event Column Resized', e);
  }

  onColumnVisible(e) {
    console.log('Event Column Visible', e);
  }

  onColumnPivotChanged(e) {
    console.log('Event Pivot Changed', e);
  }

  onColumnRowGroupChanged(e) {
    console.log('Event Row Group Changed', e);
  }

  onColumnValueChanged(e) {
    console.log('Event Value Changed', e);
  }

  onColumnMoved(e) {
    console.log('Event Column Moved', e);
  }

  onColumnPinned(e) {
    console.log('Event Column Pinned', e);
  }

  onBtSortOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age') {
        colDef.sort = 'desc';
      }
      if (colDef.field === 'athlete') {
        colDef.sort = 'asc';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtSortOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.sort = null;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtWidthNarrow() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age' || colDef.field === 'athlete') {
        colDef.width = 100;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtWidthNormal() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.width = 200;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtHide() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'age' || colDef.field === 'athlete') {
        colDef.hide = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtShow() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.hide = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtPivotOn() {
    this.gridColumnApi.setPivotMode(true);
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'country') {
        colDef.pivot = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtPivotOff() {
    this.gridColumnApi.setPivotMode(false);
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.pivot = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtRowGroupOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'sport') {
        colDef.rowGroup = true;
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtRowGroupOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.rowGroup = false;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtAggFuncOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (
        colDef.field === 'gold' ||
        colDef.field === 'silver' ||
        colDef.field === 'bronze'
      ) {
        colDef.aggFunc = 'sum';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtAggFuncOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.aggFunc = null;
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtPinnedOn() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      if (colDef.field === 'athlete') {
        colDef.pinned = 'left';
      }
      if (colDef.field === 'age') {
        colDef.pinned = 'right';
      }
    });
    this.gridApi.setColumnDefs(columnDefs);
  }

  onBtPinnedOff() {
    var columnDefs = getColumnDefs();
    columnDefs.forEach(function (colDef) {
      colDef.pinned = null;
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
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ];
}
