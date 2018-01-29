import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {BootstrapRadioComponent} from "./radio-buttons.component";
import {BootstrapDropdownComponent} from "./dropdown.component";
import {BootstrapDatePickerComponent} from "./date-picker.component";

@Component({
    selector: 'my-app',
    templateUrl: './bootstrap-editor.component.html',
})
export class BootstrapEditorComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            enableFilter: true,
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            frameworkComponents: {
                'dateEditor': BootstrapDatePickerComponent,
                'dropdownEditor': BootstrapDropdownComponent,
                'radioRenderer': BootstrapRadioComponent
            }
        }
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Date Picker",
                field: "date",
                cellEditor: 'dateEditor',
                editable: true
            },
            {
                headerName: "Dropdown",
                field: "fruit_vegetables",
                cellEditor: 'dropdownEditor',
                cellEditorParams: {
                    fruits: ['Apple', 'Orange', 'Banana'],
                    vegetables: ['Carrot', 'Pea', 'Broccoli']
                },
                editable: true
            },
            {
                headerName: "Radio (inline editing)",
                field: "on_off",
                cellRenderer: 'radioRenderer'
            }
        ];
    }

    private createRowData() {
        return [
            {date: "11/07/2017", fruit_vegetables: 'Apple', on_off: 'On'},
            {date: "20/02/2015", fruit_vegetables: 'Broccoli', on_off: 'On'},
            {date: "05/05/1969", fruit_vegetables: 'Carrot', on_off: 'Off'},
            {date: "10/01/1980", fruit_vegetables: 'Banana', on_off: 'On'}
        ];
    }
}