import { IFilterAngularComp } from '@ag-grid-community/angular';
import { IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'All'" />
                All
            </label>
            <label>
                <input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'2010'" />
                Since 2010
            </label>
        </div>
    `,
})
export class YearFilter implements IFilterAngularComp {
    params!: IFilterParams;
    year = 'All';

    agInit(params: IFilterParams): void {
        this.params = params;
    }

    isFilterActive(): boolean {
        return this.year === '2010';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        return params.data.year >= 2010;
    }

    getModel() {}

    setModel(model: any) {}

    updateFilter() {
        this.params.filterChangedCallback();
    }
}
