import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IFloatingFilterDisplayAngularComp } from 'ag-grid-angular';
import {
    FloatingFilterDisplayParams,
    ICombinedSimpleModel,
    NumberFilterModel,
    isCombinedFilterModel,
} from 'ag-grid-community';

export interface CustomParams {
    color: string;
}
@Component({
    standalone: true,
    imports: [FormsModule],
    template: `&gt;
        <input
            [style.borderColor]="params.color"
            style="width: 30px;"
            type="number"
            min="0"
            [(ngModel)]="currentValue"
            (input)="onInputBoxChanged()"
        />`,
})
export class NumberFloatingFilterComponent implements IFloatingFilterDisplayAngularComp {
    params!: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
        CustomParams;
    currentValue: number | null | string = null;
    style: any;

    agInit(
        params: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
            CustomParams
    ): void {
        this.params = params;

        this.style = {
            color: params.color,
        };
    }

    refresh(
        params: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
            CustomParams
    ): void {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            const model = params.model;
            if (model == null) {
                this.currentValue = null;
            } else {
                const value = isCombinedFilterModel(model) ? model.conditions[0]?.filter : model.filter;
                this.currentValue = String(value);
            }
        }
    }

    onInputBoxChanged() {
        if (!this.currentValue) {
            // Remove the filter
            this.params.onModelChange(null);
            return;
        }

        this.currentValue = Number(this.currentValue);
        this.params.onModelChange({
            filterType: 'number',
            type: 'greaterThan',
            filter: this.currentValue,
        });
    }
}
