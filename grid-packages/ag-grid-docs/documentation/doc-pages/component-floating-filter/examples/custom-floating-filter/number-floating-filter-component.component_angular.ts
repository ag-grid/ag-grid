import { Component } from "@angular/core";

import { AgFloatingFilterComponent } from "@ag-grid-community/angular";
import { IFloatingFilterParams, ISimpleFilter } from "@ag-grid-community/core";

@Component({
    selector: 'number-component',
    template: `&gt; <input [style.color]="params.color" style="width: 30px" type="number" min="0" [(ngModel)]="currentValue"
                           (input)="onInputBoxChanged($event)"/>`
})
export class NumberFloatingFilterComponent implements AgFloatingFilterComponent {
    params!: IFloatingFilterParams<ISimpleFilter>;
    currentValue: Number | null | string = null;
    style: any;

    agInit(params: IFloatingFilterParams<ISimpleFilter> & { color: string }): void {
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
        if (!!!this.currentValue) {
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
