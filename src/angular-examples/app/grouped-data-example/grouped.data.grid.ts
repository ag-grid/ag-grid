import {Component} from "@angular/core";

import {
    GridOptions,
    ICellRendererParams,
    IAfterGuiAttachedParams
} from "ag-grid/main";
import {ICellRendererAngularComp} from "ag-grid-angular/main";

@Component({
    selector: 'my-renderer',
    template: `Custom: {{params.value}}`
})
export class CustomGroupRenderer implements ICellRendererAngularComp {
    public params:ICellRendererParams;

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {}

}

@Component({
    selector: 'ag-grouped-data-grid',
    templateUrl: './grouped.data.grid.html'
})
export class GroupedDataGrid {
    public gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.frameworkComponents = {
            myRenderer:CustomGroupRenderer
        };
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.onGridReady = () => {
            this.gridOptions.api.sizeColumnsToFit();
        };
        this.gridOptions.autoGroupColumnDef = {
            cellRendererParams: {
                innerRendererFramework: CustomGroupRenderer
            }
        }
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Country",
                field: "country",
                width: 100,
                rowGroup: true,
                hide:true
            },
            {
                headerName: "Name",
                field: "name",
                width: 100
            },
            {
                headerName: "Gold",
                field: "gold",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Silver",
                field: "silver",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Bronze",
                field: "bronze",
                width: 100,
                aggFunc: 'sum'
            },
        ];
    }


    private createRowData() {
        return [
            {country: "United States", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "United States", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "United States", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "United Kingdom", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "United Kingdom", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "United Kingdom", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Jamaica", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Jamaica", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "South Africa", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "South Africa", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "New Zealand", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "New Zealand", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "New Zealand", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Australia", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Australia", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Australia", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Canada", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Canada", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Switzerland", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Switzerland", name: "John", gold: 1, silver: 0, bronze: 1},
            {country: "Spain", name: "Bob", gold: 1, silver: 0, bronze: 0},
            {country: "Spain", name: "Jack", gold: 0, silver: 1, bronze: 1},
            {country: "Spain", name: "Sue", gold: 1, silver: 0, bronze: 1},
            {country: "Portugal", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Portugal", name: "Tess", gold: 0, silver: 1, bronze: 1},
            {country: "Portugal", name: "John", gold: 0, silver: 2, bronze: 1},
            {country: "Zimbabwe", name: "Bob", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", name: "Jack", gold: 1, silver: 1, bronze: 0},
            {country: "Zimbabwe", name: "Mary", gold: 1, silver: 1, bronze: 0},
            {country: "Brazil", name: "Bob", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "Jack", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "Mary", gold: 1, silver: 0, bronze: 1},
            {country: "Brazil", name: "John", gold: 1, silver: 0, bronze: 1}];
    }

}