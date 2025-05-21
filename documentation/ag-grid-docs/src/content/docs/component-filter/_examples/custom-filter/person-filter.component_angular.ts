import type { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFilterDisplayAngularComp } from 'ag-grid-angular';
import type { FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="person-filter">
            <div>Custom Athlete Filter</div>
            <div>
                <input
                    #eFilterText
                    type="text"
                    [(ngModel)]="filterText"
                    (ngModelChange)="onInputChanged()"
                    placeholder="Full name search..."
                />
            </div>
            <div>
                This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.
            </div>
        </div>
    `,
})
export class PersonFilter implements IFilterDisplayAngularComp<any, any, string> {
    @ViewChild('eFilterText') eFilterText!: ElementRef;

    filterParams!: FilterDisplayParams<any, any, string>;
    filterText = '';

    agInit(params: FilterDisplayParams<any, any, string>): void {
        this.filterParams = params;
        this.refresh(params);
    }

    refresh(newParams: FilterDisplayParams<any, any, string, any>): boolean {
        const currentValue = this.filterText;
        const newValue = newParams.model ?? '';
        if (newValue !== currentValue) {
            this.filterText = newValue;
        }
        return true;
    }

    onInputChanged() {
        this.filterParams.onModelChange(this.filterText == null || this.filterText === '' ? null : this.filterText);
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.eFilterText!.nativeElement.focus();
        }
    }
}
