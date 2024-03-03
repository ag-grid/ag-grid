import { ColDef,GridApi,GridReadyEvent } from '@ag-grid-community/core';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridAngular } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { getData } from './data';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ClientSideRowModelModule])

@Component({
  standalone: true,
  imports: [AgGridAngular, NgIf],
  selector: "my-app",
  template: `
    <div class="test-container">
      <div class="test-header">
        <div style="margin-bottom: 1rem;">
          <input type="checkbox" id="pinFirstColumnOnLoad" />
          <label for="pinFirstColumnOnLoad">Pin first column on load</label>
        </div>
        <div style="margin-bottom: 1rem;">
          <button id="reloadGridButton" (click)="reloadGrid()">
            Reload Grid
          </button>
        </div>
      </div>
      <ag-grid-angular
        *ngIf="isVisible"
        style="width: 100%; height: 100%;"
        [class]="themeClass"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [rowSelection]="rowSelection"
        (gridReady)="onGridReady($event)"
      ></ag-grid-angular>
    </div>
  `,
})
export class AppComponent {
    themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
  public isVisible = true
  private gridApi!: GridApi
  public columnDefs: ColDef[] = [
    { field: "name", headerName: "Athlete", width: 250 },
    { field: "person.country", headerName: "Country" },
    { field: "person.age", headerName: "Age" },
    { field: "medals.gold", headerName: "Gold Medals" },
    { field: "medals.silver", headerName: "Silver Medals" },
    { field: "medals.bronze", headerName: "Bronze Medals" },
  ]

  public rowData: any[] | null = getData()
  public rowSelection: "single" | "multiple" = "multiple"

  reloadGrid() {
    this.isVisible = false
    setTimeout(() => (this.isVisible = true), 1)
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api
    const checkbox = document.querySelector<HTMLInputElement>(
      "#pinFirstColumnOnLoad"
    )!
    const shouldPinFirstColumn = checkbox && checkbox.checked
    if (shouldPinFirstColumn) {
      params.api.applyColumnState({
        state: [{ colId: "name", pinned: "left" }],
      })
    }
  }
}
