import { Component } from '@angular/core';
import { IFloatingFilterAngularComp } from "@ag-grid-community/angular";
import { IFloatingFilterParams } from '@ag-grid-community/core';
import { YearFilter } from './year-filter.component_angular';
@Component({
    selector: 'year-floating-filter',
    template: `
        <div class="year-filter">
            <label>
                <input type="radio" name="isFloatingFilterActive" [checked]="!isActive" (change)="toggleFilter(false)" /> All
            </label>
            <label>
                <input type="radio" name="isFloatingFilterActive" [checked]="isActive" (change)="toggleFilter(true)" /> After 2004
            </label>
        </div>`
})
export class YearFloatingFilter implements IFloatingFilterAngularComp<YearFilter> {
    params!: IFloatingFilterParams<YearFilter>;
    isActive!: boolean;

    // called on init
    agInit(params: IFloatingFilterParams<YearFilter>): void {
        this.params = params;
        this.isActive = false;
    }

    toggleFilter(isFilterActive: boolean): void {
        this.isActive = isFilterActive;
        this.params.parentFilterInstance(instance => instance.onFloatingFilterChanged(isFilterActive));
    }

    onParentModelChanged(model: any): void {
        this.isActive = !!model;
    }

}
