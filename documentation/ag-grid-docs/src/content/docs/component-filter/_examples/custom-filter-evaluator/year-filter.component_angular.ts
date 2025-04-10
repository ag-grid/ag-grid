import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFilterDisplayAngularComp } from 'ag-grid-angular';
import type { FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="year-filter">
            <div>Select Year Range</div>
            <label>
                <input
                    #rbAllYears
                    type="radio"
                    name="year"
                    [(ngModel)]="year"
                    (ngModelChange)="updateFilter()"
                    [value]="'All'"
                />
                All
            </label>
            <label>
                <input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'2010'" />
                Since 2010
            </label>
        </div>
    `,
})
export class YearFilter implements IFilterDisplayAngularComp<any, any, true> {
    @ViewChild('rbAllYears') rbAllYears!: ElementRef;

    params!: FilterDisplayParams<any, any, true>;
    year = 'All';

    agInit(params: FilterDisplayParams<any, any, true>): void {
        this.params = params;
        this.refresh(params);
    }

    refresh(newParams: FilterDisplayParams<any, any, true>): boolean {
        const currentValue = this.year === '2010' || null;
        const newValue = newParams.model;
        if (newValue !== currentValue) {
            this.year = newValue ? 'All' : '2010';
        }
        return true;
    }

    updateFilter() {
        this.params.onStateChange({
            model: this.year === '2010' || null,
        });
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.rbAllYears!.nativeElement.focus();
        }
    }
}
