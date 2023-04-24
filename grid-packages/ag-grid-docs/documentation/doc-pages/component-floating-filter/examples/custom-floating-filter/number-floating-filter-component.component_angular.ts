import { Component } from "@angular/core";

import { IFloatingFilterAngularComp } from "@ag-grid-community/angular";
import { IFloatingFilterParams, ISimpleFilter } from "@ag-grid-community/core";

export interface CustomParams {
    suppressFilterButton: boolean;
    color: string
}
@Component({
    selector: 'number-component',
    template: `&gt; <input [style.color]="params.color" style="width: 30px" type="number" min="0" [(ngModel)]="currentValue"
                           (input)="onInputBoxChanged($event)"/>`
})
export class NumberFloatingFilterComponent implements IFloatingFilterAngularComp {
    params!: IFloatingFilterParams<ISimpleFilter> & CustomParams;
    currentValue: number | null | string = null;
    style: any;

    agInit(params: IFloatingFilterParams<ISimpleFilter> & CustomParams): void {
        this.params = params;

        this.style = {
            color: params.color
        }
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null value here
        if (!parentModel) {
            this.currentValue = null;
        } else {
            this.currentValue = parentModel.filter;
        }
    }

    onInputBoxChanged() {
        if (!this.currentValue) {
            // Remove the filter
            this.params.parentFilterInstance((instance) => {
                instance.onFloatingFilterChanged(null, null);
            });
            return;
        }

        this.currentValue = Number(this.currentValue);
        this.params.parentFilterInstance((instance: any) => {
            instance.onFloatingFilterChanged('greaterThan', this.currentValue);
        });
    }
}
