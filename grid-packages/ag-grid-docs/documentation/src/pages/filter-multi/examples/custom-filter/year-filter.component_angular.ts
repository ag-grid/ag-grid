import { Component } from '@angular/core';
import { IFilterAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'year-filter',
    template: `
        <div class="year-filter">
            <label>
                <input type="radio" name="isFilterActive" [checked]="!isActive" (change)="toggleFilter(false)" /> All
            </label>
            <label>
                <input type="radio" name="isFilterActive" [checked]="isActive" (change)="toggleFilter(true)" /> After 2004
            </label>
        </div>`
})
export class YearFilter implements IFilterAngularComp {
    params: any;
    isActive: boolean;

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.isActive = false;
    }

    toggleFilter(isFilterActive): void {
        this.isActive = isFilterActive;
        this.params.filterChangedCallback();
    }

    doesFilterPass(params): boolean {
        return params.data.year > 2004;
    }

    isFilterActive(): boolean {
        return this.isActive;
    }

    getModel(): boolean | null {
        return this.isFilterActive() || null;
    }

    setModel(model): void {
        this.toggleFilter(!!model);
    }

    onFloatingFilterChanged(value): void {
        this.setModel(value);
    }
}
