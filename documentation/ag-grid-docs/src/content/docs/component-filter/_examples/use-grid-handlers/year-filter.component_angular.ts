import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFilterDisplayAngularComp } from 'ag-grid-angular';
import type {
    FilterDisplayParams,
    FilterWrapperParams,
    IAfterGuiAttachedParams,
    ISimpleFilterModelType,
    NumberFilterModel,
} from 'ag-grid-community';

let id = 1;

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
                    [name]="name"
                    [(ngModel)]="year"
                    (ngModelChange)="updateFilter()"
                    [value]="'All'"
                />
                All
            </label>
            <label>
                <input
                    type="radio"
                    [name]="name"
                    [(ngModel)]="year"
                    (ngModelChange)="updateFilter()"
                    [value]="'lessThan'"
                />
                Before 2010
            </label>
            <label>
                <input
                    type="radio"
                    [name]="name"
                    [(ngModel)]="year"
                    (ngModelChange)="updateFilter()"
                    [value]="'greaterThan'"
                />
                Since 2010
            </label>
        </div>
    `,
})
export class YearFilter implements IFilterDisplayAngularComp<any, any, NumberFilterModel> {
    @ViewChild('rbAllYears') rbAllYears!: ElementRef;

    // name needs to be unique within the DOM.
    // e.g. if filter is on multiple columns and open simultaneously in filter tool panel
    name = `year${id++}`;
    params!: FilterDisplayParams<any, any, NumberFilterModel> & FilterWrapperParams;
    year: ISimpleFilterModelType | 'All' = 'All';

    agInit(params: FilterDisplayParams<any, any, NumberFilterModel> & FilterWrapperParams): void {
        this.refresh(params);
    }

    refresh(newParams: FilterDisplayParams<any, any, NumberFilterModel> & FilterWrapperParams): boolean {
        this.params = newParams;
        const currentValue = this.year === 'All' ? undefined : this.year;
        const newValue = newParams.state.model?.type;
        if (newValue !== currentValue) {
            this.year = newValue ?? 'All';
        }
        return true;
    }

    updateFilter() {
        const { onStateChange, onAction, buttons } = this.params;
        const type = this.year === 'All' ? undefined : this.year;
        const model: NumberFilterModel | null = type
            ? {
                  type,
                  filterType: 'number',
                  filter: 2010,
              }
            : null;
        onStateChange({
            model,
        });
        if (!buttons?.includes('apply')) {
            onAction('apply');
        }
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.rbAllYears!.nativeElement.focus();
        }
    }
}
