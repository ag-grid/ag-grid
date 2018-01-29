import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {MdCheckboxComponent} from "./md-checkbox.component";
import {MdInputComponent} from "./md-input.component";
import {MdRadioComponent} from "./md-radio.component";
import {MdSelectComponent} from "./md-select.component";

@Component({
    moduleId: module.id,
    selector: 'ag-md-editor-component-one',
    templateUrl: 'md-editor-one.component.html'
})
export class MdEditorComponentOne {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            rowHeight: 48 // recommended row height for material design data grids,
        }
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Checkbox (inline editing)",
                field: "on_off",
                cellRendererFramework: MdCheckboxComponent
            },
            {
                headerName: "Full Name (popup input editor)",
                field: "full_name",
                cellEditorFramework: MdInputComponent,
                editable: true
            },
            {
                headerName: "Fruit (popup radio editor)",
                field: "fruit",
                cellEditorFramework: MdRadioComponent,
                cellEditorParams: {
                    fruits: ['Apple', 'Orange', 'Banana']
                },
                editable: true
            },
            {
                headerName: "Vegetables (popup select editor)",
                field: "vegetable",
                cellEditorFramework: MdSelectComponent,
                cellEditorParams: {
                    vegetables: ['Carrot', 'Broccoli', 'Potato']
                },
                editable: true
            }
        ];
    }

    private createRowData() {
        return [
            {
                full_name: "Sean Landsman",
                fruit: 'Apple',
                on_off: 'On',
                vegetable: 'Carrot',
                percentage: 5

            },
            {
                full_name: "Niall Crosby",
                fruit: 'Apple',
                on_off: 'On',
                vegetable: 'Potato',
                percentage: 35
            },
            {
                full_name: "Alberto Guiterzzz",
                fruit: 'Orange',
                on_off: 'Off',
                vegetable: 'Broccoli',
                percentage: 78
            },
            {
                full_name: "John Masterson",
                fruit: 'Banana',
                on_off: 'On',
                vegetable: 'Potato',
                percentage: 98
            }
        ];
    }
}