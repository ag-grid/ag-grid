import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {CountryRendererComponent} from "./country-renderer.component";

@Component({
    moduleId: module.id,
    selector: 'ag-grouped-data-component',
    templateUrl: 'grouped-data.component.html'
})
export class GroupedDataComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData(),
            // by default the grid will create auto columns, however the default
            // behaviour is one column, set this property to true to get column
            // per group
            groupMultiAutoColumn: true,
            onGridReady: function (params) {
                params.api.sizeColumnsToFit();
            }
        }
    }

    private createColumnDefs() {
        return [
            // group by these cols, and hide them, and let grid sort out the grouping columns
            {headerName: "Country", field: "country", rowGroup: true, showRowGroup:true, hide: true, cellRendererFramework: CountryRendererComponent},
            {headerName: "Language", field: "language", rowGroup: true, showRowGroup:true, hide: true},
            {headerName: "Name", field: "name"},
            {headerName: "Gold", field: "gold"},
            {headerName: "Silver", field: "silver"},
            {headerName: "Bronze", field: "bronze"}
        ];
    }

    private createRowData() {
        return [
            {country: "United States", language: "English", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "United States", language: "English", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "United States", language: "English", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "United Kingdom", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "United Kingdom", language: "English", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "United Kingdom", language: "English", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Jamaica", language: "English", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", language: "English", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "South Africa", language: "English", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", language: "English", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", language: "English", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", language: "English", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "New Zealand", language: "English", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "New Zealand", language: "English", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "New Zealand", language: "English", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Australia", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Australia", language: "English", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Australia", language: "English", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Canada", language: "English", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", language: "English", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Switzerland", language: "French", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", language: "French", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", language: "French", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", language: "French", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "Spain", language: "Spanish", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "Spain", language: "Spanish", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "Spain", language: "Spanish", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Portugal", language: "Portuguese", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Portugal", language: "Portuguese", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Portugal", language: "Portuguese", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Zimbabwe", language: "English", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", language: "English", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Brazil", language: "Brazillian", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "John", gold: 1, silver: 0, bronze: 1}
          ];
    }
}
