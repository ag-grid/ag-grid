import type { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IFilterDisplayAngularComp } from 'ag-grid-angular';
import type { FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="partial-match-filter">
            <div>Partial Match Filter</div>
            <div>
                <input #eFilterText type="text" [(ngModel)]="filterText" (ngModelChange)="onInputChanged()" />
            </div>
        </div>
    `,
})
export class PartialMatchFilter implements IFilterDisplayAngularComp<any, any, string> {
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

    componentMethod(message: string): void {
        console.log(`Alert from PartialMatchFilterComponent: ${message}`);
    }
}
