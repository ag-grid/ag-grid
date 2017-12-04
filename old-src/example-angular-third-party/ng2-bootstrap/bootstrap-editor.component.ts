import {Component} from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {BootstrapDatePickerComponent} from "./date-picker.component";
import {BootstrapDropdownComponent} from "./dropdown.component";

@Component({
    moduleId: module.id,
    selector: 'ag-bs-editor-component',
    templateUrl: 'bootstrap-editor.component.html'
})
export class BootstrapEditorComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    private createColumnDefs() {
        return [
            {headerName: "Name", field: "name", width: 300},
            {
                headerName: "Date Picker",
                field: "date",
                cellEditorFramework: BootstrapDatePickerComponent,
                editable: true,
                width: 250
            },
            {
                headerName: "Dropdown",
                field: "fruit_vegetables",
                cellEditorFramework: BootstrapDropdownComponent,
                cellEditorParams: {
                    fruits: ['Apple', 'Orange', 'Banana'],
                    vegetables: ['Carrot', 'Pea', 'Broccoli']
                },
                editable: true,
                width: 250
            }
        ];
    }

    private createRowData() {
        return [
            {name: "Bob", date: "10/01/2005", fruit_vegetables: 'Apple'},
            {name: "Harry", date: "20/02/2015", fruit_vegetables: 'Broccoli'},
            {name: "Sally", date: "05/05/1969", fruit_vegetables: 'Carrot'},
            {name: "Mary", date: "10/01/1980", fruit_vegetables: 'Banana'}
        ];
    }
}