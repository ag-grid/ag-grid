import type { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';

import type { IFilterAngularComp } from 'ag-grid-angular';
import type { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <div class="year-filter">
        <label>
            <input
                #eFilterAll
                type="radio"
                name="isFilterActive"
                [checked]="!isActive"
                (change)="toggleFilter(false)"
            />
            All
        </label>
        <label>
            <input type="radio" name="isFilterActive" [checked]="isActive" (change)="toggleFilter(true)" /> After 2004
        </label>
    </div>`,
})
export class YearFilter implements IFilterAngularComp {
    @ViewChild('eFilterAll') eFilterAll!: ElementRef;

    params!: IFilterParams;
    isActive!: boolean;

    // called on init
    agInit(params: IFilterParams): void {
        this.params = params;
        this.isActive = false;
    }

    toggleFilter(isFilterActive: boolean): void {
        this.isActive = isFilterActive;
        this.params.filterChangedCallback();
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        return params.data.year > 2004;
    }

    isFilterActive(): boolean {
        return this.isActive;
    }

    getModel(): boolean | null {
        return this.isFilterActive() || null;
    }

    setModel(model: any): void {
        this.toggleFilter(!!model);
    }

    onFloatingFilterChanged(value: any): void {
        this.setModel(value);
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            this.eFilterAll.nativeElement.focus();
        }
    }
}
