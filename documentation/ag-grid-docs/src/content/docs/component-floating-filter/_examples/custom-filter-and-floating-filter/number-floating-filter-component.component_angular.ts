import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IFloatingFilterDisplayAngularComp } from 'ag-grid-angular';
import { FloatingFilterDisplayParams } from 'ag-grid-community';

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
    params!: FloatingFilterDisplayParams<any, any, number> & CustomParams;
    currentValue: string = '';
    style: any;

    agInit(params: FloatingFilterDisplayParams<any, any, number> & CustomParams): void {
        this.params = params;

        this.style = {
            color: params.color,
        };
    }

    refresh(params: FloatingFilterDisplayParams<any, any, number> & CustomParams): void {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            const model = params.model;
            this.currentValue = model == null ? '' : String(model);
        }
    }

    onInputBoxChanged() {
        const newValue = this.currentValue ?? '';
        this.params.onModelChange(newValue === '' ? null : Number(newValue));
    }
}
