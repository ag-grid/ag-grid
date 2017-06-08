import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {SliderFloatingFilter} from "./slider-floating-filter-component";

@Component({
    moduleId: module.id,
    selector: 'ag-floating-filter-component',
    templateUrl: 'floating-filter.component.html'
})
export class FloatingFilterComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData(),
            onGridReady: function (params) {
                params.api.sizeColumnsToFit();
            },
            floatingFilter:true
        }
    }

    private createColumnDefs() {
        return [
            {headerName: "Country", field: "country", suppressFilter:true},
            {headerName: "Language", field: "language", suppressFilter:true},
            {headerName: "Name", field: "name", suppressFilter:true},
            {headerName: "Gold", field: "gold", floatingFilterComponentFramework: SliderFloatingFilter,
                floatingFilterComponentParams:{
                    maxValue:7,
                    suppressFilterButton:true
                }, filter:'number', suppressMenu:true
            },
            {headerName: "Silver", field: "silver", filter:'number', floatingFilterComponentFramework: SliderFloatingFilter,
                floatingFilterComponentParams:{
                    maxValue:5,
                    suppressFilterButton:true
                }, suppressMenu:true
            },
            {headerName: "Bronze", field: "bronze", filter:'number', floatingFilterComponentFramework: SliderFloatingFilter,
                floatingFilterComponentParams:{
                    maxValue:10,
                    suppressFilterButton:true
                },suppressMenu:true
            }
        ];
    }

    private createRowData() {
        return [
            {country: "United States", language: "English", name: "Bob", gold: 1, silver: 3, bronze: 0},
            {country: "United States", language: "English", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "United States", language: "English", name: "Sue", gold: 3, silver: 0, bronze: 1},
            {country: "United Kingdom", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 2},
            {country: "United Kingdom", language: "English", name: "Tess", gold: 2, silver: 1, bronze: 1},
            {country: "United Kingdom", language: "English", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Jamaica", language: "English", name: "Bob", gold: 4, silver: 1, bronze: 2},
            {country: "Jamaica", language: "English", name: "Jack", gold: 3, silver: 1, bronze: 2},
            {country: "Jamaica", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 2},
            {country: "South Africa", language: "English", name: "Bob", gold: 4, silver: 0, bronze: 1},
            {country: "South Africa", language: "English", name: "Jack", gold: 3, silver: 0, bronze: 1},
            {country: "South Africa", language: "English", name: "Mary", gold: 5, silver: 3, bronze: 1},
            {country: "South Africa", language: "English", name: "John", gold: 2, silver: 3, bronze: 1},
            {country: "New Zealand", language: "English", name: "Bob", gold: 5, silver: 3, bronze: 10},
            {country: "New Zealand", language: "English", name: "Jack", gold: 1, silver: 1, bronze: 1},
            {country: "New Zealand", language: "English", name: "Sue", gold: 1, silver: 3, bronze: 1},
            {country: "Australia", language: "English", name: "Mary", gold: 1, silver: 1, bronze: 3},
            {country: "Australia", language: "English", name: "Tess", gold: 2, silver: 1, bronze: 1},
            {country: "Australia", language: "English", name: "John", gold: 3, silver: 2, bronze: 1},
            {country: "Canada", language: "English", name: "Bob", gold: 7, silver: 5, bronze: 3},
            {country: "Canada", language: "English", name: "Jack", gold: 2, silver: 1, bronze: 3},
            {country: "Canada", language: "English", name: "Mary", gold: 0, silver: 1, bronze: 3},
            {country: "Switzerland", language: "French", name: "Bob", gold: 2, silver: 3, bronze: 1},
            {country: "Switzerland", language: "French", name: "Jack", gold: 2, silver: 3, bronze: 1},
            {country: "Switzerland", language: "French", name: "Mary", gold: 1, silver: 3, bronze: 1},
            {country: "Switzerland", language: "French", name: "John", gold: 1, silver: 4, bronze: 1},
            {country: "Spain", language: "Spanish", name: "Bob", gold: 1, silver: 4, bronze: 0},
            {country: "Spain", language: "Spanish", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "Spain", language: "Spanish", name: "Sue", gold: 1, silver: 4, bronze: 1},
            {country: "Portugal", language: "Portuguese", name: "Mary", gold: 2, silver: 1, bronze: 4},
            {country: "Portugal", language: "Portuguese", name: "Tess", gold: 3, silver: 1, bronze: 1},
            {country: "Portugal", language: "Portuguese", name: "John", gold: 5, silver: 2, bronze: 1},
            {country: "Zimbabwe", language: "English", name: "Bob", gold: 3, silver: 1, bronze: 4},
            {country: "Zimbabwe", language: "English", name: "Jack", gold: 4, silver: 1, bronze: 4},
            {country: "Zimbabwe", language: "English", name: "Mary", gold: 2, silver: 1, bronze: 4},
            {country: "Brazil", language: "Brazillian", name: "Bob", gold: 3, silver: 4, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "Jack", gold: 2, silver: 4, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "Mary", gold: 4, silver: 0, bronze: 1},
            {country: "Brazil", language: "Brazillian", name: "John", gold: 1, silver: 0, bronze: 1}];
    }
}