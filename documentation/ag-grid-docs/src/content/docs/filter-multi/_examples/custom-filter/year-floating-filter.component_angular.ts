import { Component } from '@angular/core';

import type { IFloatingFilterDisplayAngularComp } from 'ag-grid-angular';
import type { FloatingFilterDisplayParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <div class="year-filter">
        <label>
            <input type="radio" name="isFloatingFilterActive" [checked]="!isActive" (change)="toggleFilter(false)" />
            All
        </label>
        <label>
            <input type="radio" name="isFloatingFilterActive" [checked]="isActive" (change)="toggleFilter(true)" />
            After 2010
        </label>
    </div>`,
})
export class YearFloatingFilter implements IFloatingFilterDisplayAngularComp {
    params!: FloatingFilterDisplayParams<any, any, boolean>;
    isActive: boolean = false;

    // called on init
    agInit(params: FloatingFilterDisplayParams<any, any, boolean>): void {
        this.refresh(params);
    }

    refresh(params: FloatingFilterDisplayParams<any, any, boolean>): void {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            this.isActive = !!params.model;
        }
    }

    toggleFilter(isFilterActive: boolean): void {
        this.isActive = isFilterActive;
        this.params.onModelChange(isFilterActive || null);
    }
}
