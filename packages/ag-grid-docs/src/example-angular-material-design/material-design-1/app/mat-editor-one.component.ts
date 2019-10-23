import { Component } from "@angular/core";

import {GridOptions, Module, AllModules} from "@ag-enterprise/grid-all-modules";

import "@ag-community/grid-all-modules/dist/styles/ag-grid.css";
import "@ag-community/grid-all-modules/dist/styles/ag-theme-balham.css";

import { MatCheckboxComponent } from "./mat-checkbox.component";
import { MatInputComponent } from "./mat-input.component";
import { MatRadioComponent } from "./mat-radio.component";
import { MatSelectComponent } from "./mat-select.component";

@Component({
    selector: "my-app",
    templateUrl: "./mat-editor-one.component.html"
})
export class MatEditorComponentOne {
    public gridOptions: GridOptions;
    modules: Module[] = AllModules;

    constructor() {
        this.gridOptions = <GridOptions>{
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            rowHeight: 48, // recommended row height for material design data grids,
            frameworkComponents: {
                checkboxRenderer: MatCheckboxComponent,
                inputRenderer: MatInputComponent,
                radioEditor: MatRadioComponent,
                selectEditor: MatSelectComponent
            }
        };
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Checkbox (inline editing)",
                field: "on_off",
                cellRenderer: "checkboxRenderer"
            },
            {
                headerName: "Full Name (popup input editor)",
                field: "full_name",
                cellEditor: "inputRenderer",
                editable: true
            },
            {
                headerName: "Fruit (popup radio editor)",
                field: "fruit",
                cellEditor: "radioEditor",
                cellEditorParams: {
                    fruits: ["Apple", "Orange", "Banana"]
                },
                editable: true
            },
            {
                headerName: "Vegetables (popup select editor)",
                field: "vegetable",
                cellEditor: "selectEditor",
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
