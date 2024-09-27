import type { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFilterAngularComp } from 'ag-grid-angular';
import type { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

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
export class PersonFilter implements IFilterAngularComp {
    @ViewChild('eFilterText') eFilterText!: ElementRef;

    filterParams!: IFilterParams;
    filterText = '';

    agInit(params: IFilterParams): void {
        this.filterParams = params;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        // make sure each word passes separately, ie search for firstname, lastname
        let passed = true;
        const { node } = params;

        this.filterText
            .toLowerCase()
            .split(' ')
            .forEach((filterWord) => {
                const value = this.filterParams.getValue(node);

                if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                    passed = false;
                }
            });

        return passed;
    }

    isFilterActive(): boolean {
        return this.filterText != null && this.filterText !== '';
    }

    getModel() {
        if (!this.isFilterActive()) {
            return null;
        }

        return { value: this.filterText };
    }

    setModel(model: any) {
        this.filterText = model == null ? null : model.value;
    }

    onInputChanged() {
        this.filterParams.filterChangedCallback();
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!params?.suppressFocus) {
            // focus the input element for keyboard navigation
            this.eFilterText!.nativeElement.focus();
        }
    }
}
