import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div style="padding: 4px">
            <div style="font-weight: bold;">Greater than:</div>
            <div>
                <input
                    style="margin: 4px 0 4px 0;"
                    type="number"
                    min="0"
                    [(ngModel)]="filterText"
                    (input)="onInputBoxChanged($event)"
                    placeholder="Number of medals..."
                />
            </div>
        </div>
    `,
})
export class NumberFilterComponent implements IFilterAngularComp {
    filterParams!: IFilterParams;
    filterText: number | null | string = null;

    agInit(params: IFilterParams): void {
        this.filterParams = params;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        if (!this.isFilterActive()) {
            return true;
        }

        var { node } = params;

        var value = this.filterParams.getValue(node);

        if (value == null) return false;
        return Number(value) > Number(this.filterText);
    }

    isFilterActive() {
        return (
            this.filterText !== null &&
            this.filterText !== undefined &&
            this.filterText !== '' &&
            this.isNumeric(this.filterText)
        );
    }

    isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    getModel() {
        return this.isFilterActive() ? Number(this.filterText) : null;
    }

    setModel(model: any) {
        this.filterText = model;
        this.filterParams.filterChangedCallback();
    }

    onInputBoxChanged() {
        this.filterParams.filterChangedCallback();
    }

    getModelAsString() {
        return this.isFilterActive() ? '>' + this.filterText : '';
    }
}
