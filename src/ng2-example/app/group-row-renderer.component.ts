import {Component,OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common"

import {AgRendererComponent} from 'ag-grid-ng2/main';
import {GridOptions,RowNode} from 'ag-grid/main';

@Component({
    selector: 'group-row-cell',
    template: `{{country}} Gold: {{gold}}, Silver: {{silver}}, Bronze: {{bronze}}`
})
class GroupInnerRowComponent implements AgRendererComponent {
    private params:any;
    private country:string;
    private gold:string;
    private silver:string;
    private bronze:string;

    agInit(params:any):void {
        this.params = params;
        this.country = params.node.key;
        this.gold = params.data.gold;
        this.silver = params.data.silver;
        this.bronze = params.data.bronze;
    }
}

@Component({
    selector: 'ag-group-row-renderer-component',
    templateUrl: 'app/group-row-renderer.component.html'
})
export class WithGroupRowComponent {
    private gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.groupUseEntireRow = true;
        this.gridOptions.groupRowInnerRendererFramework = {
            component: GroupInnerRowComponent
        }
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Country",
                field: "country",
                width: 100,
                rowGroupIndex: 0
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
            {country: "Jamaica", name: "Henry", gold: 1, silver: 1, bronze: 0},
            {country: "South Africa", name: "Kate", gold: 1, silver: 0, bronze: 1},
        ];
    }
}