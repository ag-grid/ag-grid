import { Component } from "@angular/core";

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-material.css";

import { MatCheckboxComponent } from "./mat-checkbox.component";
import { MatInputComponent } from "./mat-input.component";
import { MatRadioComponent } from "./mat-radio.component";
import { MatSelectComponent } from "./mat-select.component";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ColDef, GridOptions, Module } from "@ag-grid-community/core";

@Component({
    selector: "my-app",
    template: `
    <div style="width: 100%;">
        <ag-grid-angular style="width: 100%; height: 450px;" class="ag-theme-material"
                     [gridOptions]="gridOptions"
                     [modules]="modules">
        </ag-grid-angular>
    </div>
    `
})
export class MatEditorComponentOne {
    public gridOptions: GridOptions;
    modules: Module[] = [ClientSideRowModelModule];

    constructor() {
        this.gridOptions = {
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api!.sizeColumnsToFit();
            },
            rowHeight: 48 // recommended row height for material design data grids,
        };
    }

    private createColumnDefs(): ColDef[] {
        return [
            {
                headerName: "Checkbox (inline editing)",
                field: "on_off",
                cellRenderer: MatCheckboxComponent
            },
            {
                headerName: "Full Name (popup input editor)",
                field: "full_name",
                cellEditor: MatInputComponent,
                editable: true
            },
            {
                headerName: "Fruit (popup radio editor)",
                field: "fruit",
                cellEditor: MatRadioComponent,
                cellEditorParams: {
                    fruits: ["Apple", "Orange", "Banana"]
                },
                editable: true
            },
            {
                headerName: "Vegetables (popup select editor)",
                field: "vegetable",
                cellEditor: MatSelectComponent,
                cellEditorParams: {
                    vegetables: ["Carrot", "Broccoli", "Potato"]
                },
                editable: true
            }
        ];
    }

    private createRowData() {
        return [
            {
                full_name: "Sean Landsman",
                fruit: "Apple",
                on_off: "On",
                vegetable: "Carrot",
                percentage: 5
            },
            {
                full_name: "Niall Crosby",
                fruit: "Apple",
                on_off: "On",
                vegetable: "Potato",
                percentage: 35
            },
            {
                full_name: "Alberto Guiterzzz",
                fruit: "Orange",
                on_off: "Off",
                vegetable: "Broccoli",
                percentage: 78
            },
            {
                full_name: "John Masterson",
                fruit: "Banana",
                on_off: "On",
                vegetable: "Potato",
                percentage: 98
            }
        ];
    }
}
