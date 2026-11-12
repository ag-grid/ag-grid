import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFloatingFilterAngularComp } from 'ag-grid-angular';
import type { IFloatingFilterParams, ISimpleFilter } from 'ag-grid-community';

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
export class NumberFloatingFilterComponent implements IFloatingFilterAngularComp {
    params!: IFloatingFilterParams<ISimpleFilter> & CustomParams;
    currentValue = signal<number | null | string>(null);
    style: any;

    agInit(params: IFloatingFilterParams<ISimpleFilter> & CustomParams): void {
        this.params = params;

        this.style = {
            color: params.color,
        };
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null value here
        if (!parentModel) {
            this.currentValue.set(null);
        } else {
            this.currentValue.set(parentModel.filter);
        }
    }

    onInputBoxChanged() {
        if (!this.currentValue()) {
            // Remove the filter
            this.params.parentFilterInstance((instance) => {
                instance.onFloatingFilterChanged(null, null);
            });
            return;
        }

        this.currentValue.set(Number(this.currentValue()));
        this.params.parentFilterInstance((instance: any) => {
            instance.onFloatingFilterChanged('greaterThan', this.currentValue());
        });
    }
}
