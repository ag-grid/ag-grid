import {Component} from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {TypeaheadEditorComponent} from "./typeahead-editor.component";

@Component({
    moduleId: module.id,
    selector: 'ag-typeahead-component',
    templateUrl: 'typeahead.component.html'
})
export class TypeaheadComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Name",
                field: "row",
                width: 400,
                colId: "name"
            },
            {
                headerName: "Favourite Fruit",
                field: "fruit",
                width: 399,
                editable:true,
                cellEditorFramework: TypeaheadEditorComponent
            },
        ];
    }

    private createRowData() {
        let rowData: any[] = [];

        for (var i = 0; i < 15; i++) {
            let firstName = this.firstnames[Math.floor(Math.random() * this.firstnames.length)];
            let lastName = this.lastnames[Math.floor(Math.random() * this.lastnames.length)];
            rowData.push({
                row: firstName + ' ' + lastName,
                fruit: this.fruits[i % this.fruits.length]
            });
        }

        return rowData;
    }

    // a list of names we pick from when generating data
    private firstnames: string[] = ['Sophia', 'Emma', 'Olivia', 'Isabella', 'Mia', 'Ava', 'Lily', 'Zoe', 'Emily', 'Chloe', 'Layla', 'Madison', 'Madelyn', 'Abigail', 'Aubrey', 'Charlotte', 'Amelia', 'Ella', 'Kaylee', 'Avery', 'Aaliyah', 'Hailey', 'Hannah', 'Addison', 'Riley', 'Harper', 'Aria', 'Arianna', 'Mackenzie', 'Lila', 'Evelyn', 'Adalyn', 'Grace', 'Brooklyn', 'Ellie', 'Anna', 'Kaitlyn', 'Isabelle', 'Sophie', 'Scarlett', 'Natalie', 'Leah', 'Sarah', 'Nora', 'Mila', 'Elizabeth', 'Lillian', 'Kylie', 'Audrey', 'Lucy', 'Maya'];
    private lastnames: string[] = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson'];

    // random fruit
    private fruits: string[] = ['Apple', 'Orange', 'Banana'];

}