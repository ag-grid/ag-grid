import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular'; // Core Grid Logic
import { ColDef, GridReadyEvent, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community'; // Column Definitions Interface
import { HttpClient } from '@angular/common/http';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Custom Cell Renderer Component
@Component({
  selector: 'app-country-flag-cell-renderer',
  standalone: true,
  imports: [CommonModule],
  template:
  `
  <span *ngIf="value">
    <img
      [alt]="' ' + value + ' Flag'"
      [src]="'https://www.ag-grid.com/example-assets/flags/' + value.toLowerCase() + '-flag-sm.png'"
      [height]="30"
    />
  </span>
  `
})

export class CountryFlagCellRendererComponent implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  // Return Cell Value
  refresh(params: ICellRendererParams<any, any, any>): boolean {
    this.value = params.value;
    return true;
  }
}

@Component({
  selector: 'my-app',
  template: 
  `
  <main class="main">
    <div class="content">
        <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
        <ag-grid-angular
          style="width: 100%; height: 550px;"
          [class]="themeClass"
          [rowData]="rowData"
          [columnDefs]="colDefs"
          [defaultColDef]="defaultColDefs" 
          (gridReady)="onGridReady($event)"
          [pagination]="true"
        >
        </ag-grid-angular>
    </div>
  </main>
  `
})

export class AppComponent {
  themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;

  // Row Data: The data to be displayed.
  rowData = [
    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "mission", resizable: true },
    { 
      field: "country",
      cellRenderer: CountryFlagCellRendererComponent // Render a custom component
    },
    { field: "successful" },
    { field: "date" },
    { 
      field: "price",
      valueFormatter: (params: ValueFormatterParams) => { return '£' + params.value.toLocaleString(); } // Format with inline function  
    },
    { field: "company" }
  ];

  // Default Column Definitions: Apply configuration across all columns
  defaultColDefs: ColDef = {
    resizable: true
  }

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://downloads.jamesswinton.com/space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }
}
