import { Component } from '@angular/core';
import { IFloatingFilterComp } from "@ag-grid-community/angular";
import { IFloatingFilterParams } from '@ag-grid-community/core';

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
export class YearFloatingFilter implements IFloatingFilterComp {
    params!: IFloatingFilterParams;
    isActive!: boolean;

    // called on init
    agInit(params: IFloatingFilterParams): void {
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
