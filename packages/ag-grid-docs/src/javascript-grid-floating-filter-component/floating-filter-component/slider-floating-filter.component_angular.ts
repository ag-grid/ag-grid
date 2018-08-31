import {AfterViewInit, Component} from "@angular/core";

import {IFloatingFilter, IFloatingFilterParams, SerializedNumberFilter} from "ag-grid-community";
import {AgFrameworkComponent} from "ag-grid-angular";

export interface SliderFloatingFilterChange {
    model: SerializedNumberFilter
}

export interface SliderFloatingFilterParams extends IFloatingFilterParams<SerializedNumberFilter, SliderFloatingFilterChange> {
    value: number
    maxValue: number
}

@Component({
    template: `
        <input type="range"
               min="0" [max]="maxValue"
               data-show-value="true" data-popup-enabled="true"
               [(ngModel)]="currentValue"
               (ngModelChange)="valueChanged()"/>`
})
export class SliderFloatingFilter implements IFloatingFilter<SerializedNumberFilter, SliderFloatingFilterChange, SliderFloatingFilterParams>, AgFrameworkComponent<SliderFloatingFilterParams> {
    private params: SliderFloatingFilterParams;
    public maxValue: number;
    public currentValue: number;

    agInit(params: SliderFloatingFilterParams): void {
        this.params = params;
        this.maxValue = this.params.maxValue;
        this.currentValue = 0;
    }

    valueChanged() {
        this.params.onFloatingFilterChanged({model: this.buildModel()});
    }

    onParentModelChanged(parentModel: SerializedNumberFilter): void {
        if (!parentModel) {
            this.currentValue = 0;
        } else {
            // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
            // so just read off the value and use that
            this.currentValue = parentModel.filter
        }
    }

    buildModel(): SerializedNumberFilter {
        if (this.currentValue === 0) {
            return null;
        }
        return {
            filterType: 'number',
            type: 'greaterThan',
            filter: this.currentValue,
            filterTo: null
        };
    }

}