import {Component} from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {NumericEditorComponent} from "./numeric-editor.component";
import {MoodRendererComponent} from "./mood-renderer.component";
import {MoodEditorComponent} from "./mood-editor.component";

@Component({
    moduleId: module.id,
    selector: 'ag-editor-component',
    templateUrl: 'editor-component.component.html'
})
export class EditorComponent {
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
                headerName: "Mood",
                field: "mood",
                cellRendererFramework: MoodRendererComponent,
                cellEditorFramework: MoodEditorComponent,
                editable: true,
                width: 250
            },
            {
                headerName: "Numeric",
                field: "number",
                cellEditorFramework: NumericEditorComponent,
                editable: true,
                width: 250
            }
        ];
    }

    private createRowData() {
        return [
            {name: "Bob", mood: "Happy", number: 10},
            {name: "Harry", mood: "Sad", number: 3},
            {name: "Sally", mood: "Happy", number: 20},
            {name: "Mary", mood: "Sad", number: 5},
            {name: "John", mood: "Happy", number: 15},
            {name: "Jack", mood: "Happy", number: 25},
            {name: "Sue", mood: "Sad", number: 43},
            {name: "Sean", mood: "Sad", number: 1335},
            {name: "Niall", mood: "Happy", number: 2},
            {name: "Alberto", mood: "Happy", number: 123},
            {name: "Fred", mood: "Sad", number: 532},
            {name: "Jenny", mood: "Happy", number: 34},
            {name: "Larry", mood: "Happy", number: 13},
        ];
    }
}