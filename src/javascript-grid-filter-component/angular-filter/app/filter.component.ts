import {Component} from "@angular/core";

import {GridOptions} from "ag-grid";

import {PartialMatchFilterComponent} from "./partial-match-filter.component";

@Component({
    selector: 'my-app',
    templateUrl: './filter.component.html'
})
export class FilterComponentComponent {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{
            rowData: FilterComponentComponent.createRowData(),
            columnDefs: FilterComponentComponent.createColumnDefs(),
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            },
            enableFilter: true
        };
    }

    onClicked(): void {
        this.gridOptions.api.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
    }

    private static createColumnDefs() {
        return [
            {
                headerName: "Row",
                field: "row",
                width: 400
            },
            {
                headerName: "Filter Component",
                field: "name",
                filterFramework: PartialMatchFilterComponent,
                width: 400,
                menuTabs: ['filterMenuTab']
            }
        ];
    }

    private static createRowData() {
        return [
            {"row": "Row 1", "name": "Michael Phelps"},
            {"row": "Row 2", "name": "Natalie Coughlin"},
            {"row": "Row 3", "name": "Aleksey Nemov"},
            {"row": "Row 4", "name": "Alicia Coutts"},
            {"row": "Row 5", "name": "Missy Franklin"},
            {"row": "Row 6", "name": "Ryan Lochte"},
            {"row": "Row 7", "name": "Allison Schmitt"},
            {"row": "Row 8", "name": "Natalie Coughlin"},
            {"row": "Row 9", "name": "Ian Thorpe"},
            {"row": "Row 10", "name": "Bob Mill"},
            {"row": "Row 11", "name": "Willy Walsh"},
            {"row": "Row 12", "name": "Sarah McCoy"},
            {"row": "Row 13", "name": "Jane Jack"},
            {"row": "Row 14", "name": "Tina Wills"}
        ];
    }
}