import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IFilterDisplayAngularComp } from 'ag-grid-angular';
import { FilterDisplayParams } from 'ag-grid-community';

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
                    (input)="onInputBoxChanged()"
                    placeholder="Number of medals..."
                />
            </div>
        </div>
    `,
})
export class NumberFilterComponent implements IFilterDisplayAngularComp<any, any, number> {
    filterParams!: FilterDisplayParams<any, any, number>;
    filterText: string = '';

    agInit(params: FilterDisplayParams<any, any, number>): void {
        this.refresh(params);
    }

    refresh(params: FilterDisplayParams<any, any, number>): boolean {
        this.filterParams = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            this.filterText = String(params.model ?? '');
        }
        return true;
    }

    onInputBoxChanged() {
        const newValue = this.filterText;
        this.filterParams.onModelChange(newValue === '' ? null : Number(newValue));
    }
}
