import { Component } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular'; // Core Grid Logic
import { CellValueChangedEvent, ColDef, GridReadyEvent, SelectionChangedEvent, ValueFormatterParams } from 'ag-grid-community'; // Column Definitions Interface
import { HttpClient } from '@angular/common/http';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { CountryFlagCellRendererComponent } from './country-flag-cell-renderer.component'

@Component({
  selector: 'my-app',
  template: 
  `
  <main class="main">
    <div class="content">
        <!-- The AG Grid component, with various Grid Option properties -->
        <ag-grid-angular
          style="width: 100%; height: 550px;"
          class="ag-theme-quartz-dark"
          [rowData]="rowData"
          [columnDefs]="colDefs"
          [defaultColDef]="defaultColDefs" 
          [pagination]="true" 
          [rowSelection]="'multiple'" 
          (gridReady)="onGridReady($event)"
          (cellValueChanged)="onCellValueChanged($event)"
          (selectionChanged)="onSelectionChanged($event)"
        >
        </ag-grid-angular>
    </div>
  </main>
  `
})

export class AppComponent {

  // Return formatted date value
  dateFormatter(params: ValueFormatterParams) {
    return new Date(params.value).toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Row Data: The data to be displayed.
  rowData = [
    {company: "CASC", country: "China", date: "2022-07-24", mission: "Wentian", price: 2150000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-24", mission: "Starlink Group 4-25", price: 3230000, successful: true},
    {company: "SpaceX", country: "USA", date: "2022-07-22", mission: "Starlink Group 3-2", price: 8060000, successful: true}
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { 
      field: "mission", 
      resizable: true, // Disable resizing
      checkboxSelection: true // Enable row selection via checkbox
    },
    { 
      field: "country",
      cellRenderer: CountryFlagCellRendererComponent // Render a custom component
    },
    { field: "successful" },
    { 
      field: "date",
      valueFormatter: this.dateFormatter // Format with a function
    },
    { 
      field: "price",
      valueFormatter: params => { return '£' + params.value.toLocaleString(); } // Format with inline function
    },
    { field: "company" }
  ];

  // Default Column Definitions: Apply configuration across all columns
  defaultColDefs: ColDef = {
    resizable: true, // Enable resizing on all columns
    editable: true // Enable editing on all columns
  }

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://downloads.jamesswinton.com/space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }

  // Handle row selection changed event
  onSelectionChanged = (event: SelectionChangedEvent) => {
    console.log('Row Selected!')
  }

  // Handle cell editing event
  onCellValueChanged = (event: CellValueChangedEvent) => {
    console.log(`New Cell Value: ${event.value}`)
  }

}
