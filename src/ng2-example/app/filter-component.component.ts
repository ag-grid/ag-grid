import {Component,ViewChild,ViewContainerRef} from '@angular/core';
import {FormsModule} from "@angular/forms"

import {GridOptions, IFilterParams, IDoesFilterPassParams, RowNode, IAfterFilterGuiAttachedParams} from 'ag-grid/main';
import {AgFilterComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'filter-cell',
    template: `
        Filter: <input style="height: 10px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
    `
})
class PartialMatchFilterComponent implements AgFilterComponent {
    private params:IFilterParams;
    private valueGetter:(rowNode:RowNode) => any;
    private text:string = '';

    @ViewChild('input', {read: ViewContainerRef}) private input;

    agInit(params:IFilterParams):void {
        this.params = params;
        this.valueGetter = params.valueGetter;
    }

    isFilterActive():boolean {
        return this.text !== null && this.text !== undefined && this.text !== '';
    }

    doesFilterPass(params:IDoesFilterPassParams):boolean {
        return this.text.toLowerCase()
            .split(" ")
            .every((filterWord) => {
                return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
            });
    }

    getModel():any {
        return {value: this.text};
    }

    setModel(model:any):void {
        this.text = model.value;
    }

    afterGuiAttached(params:IAfterFilterGuiAttachedParams):void {
        this.input.element.nativeElement.focus();
    }

    componentMethod(message:string) : void {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    onChange(newValue):void {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}

@Component({
    selector: 'ag-filter-component',
    templateUrl: 'app/filter-component.component.html'
})
export class FilterComponentComponent {
    private gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.enableFilter = true;
        this.gridOptions.suppressMenuColumnPanel = true; // ag-enterprise only
        this.gridOptions.suppressMenuMainPanel = true; // ag-enterprise only
    }

    onClicked(event) :void {
        this.gridOptions.api.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
    }

    private createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 200},
            {
                headerName: "Filter Component",
                field: "name",
                filterFramework: {
                    component: PartialMatchFilterComponent,
                    moduleImports: [FormsModule]
                },
                width: 198
            }
        ];
    }

    private createRowData() {
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
            {"row": "Row 10", "name": "Dara Torres"}
        ];
    }
}