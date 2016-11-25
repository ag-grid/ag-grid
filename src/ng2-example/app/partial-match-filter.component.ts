import {Component, ViewChild, ViewContainerRef} from '@angular/core';

import {IFilterParams, IDoesFilterPassParams, RowNode, IAfterFilterGuiAttachedParams} from 'ag-grid/main';
import {AgFilterComponent} from 'ag-grid-ng2/main';

@Component({
    selector: 'filter-cell',
    template: `
        Filter: <input style="height: 20px" #input (ngModelChange)="onChange($event)" [ngModel]="text">
    `
})
export class PartialMatchFilterComponent implements AgFilterComponent {
    private params: IFilterParams;
    private valueGetter: (rowNode: RowNode) => any;
    public text: string = '';

    @ViewChild('input', {read: ViewContainerRef}) public input;

    agInit(params: IFilterParams): void {
        this.params = params;
        this.valueGetter = params.valueGetter;
    }

    isFilterActive(): boolean {
        return this.text !== null && this.text !== undefined && this.text !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        return this.text.toLowerCase()
            .split(" ")
            .every((filterWord) => {
                return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
            });
    }

    getModel(): any {
        return {value: this.text};
    }

    setModel(model: any): void {
        this.text = model.value;
    }

    afterGuiAttached(params: IAfterFilterGuiAttachedParams): void {
        this.input.element.nativeElement.focus();
    }

    componentMethod(message: string): void {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    onChange(newValue): void {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}
