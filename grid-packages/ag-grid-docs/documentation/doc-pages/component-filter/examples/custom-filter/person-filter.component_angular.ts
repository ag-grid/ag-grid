import { Component } from "@angular/core";

import { IFilterAngularComp } from "@ag-grid-community/angular";
import { IDoesFilterPassParams, IFilterParams } from "@ag-grid-community/core";
import { FormsModule } from "@angular/forms";

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="person-filter">
            <div>Custom Athlete Filter</div>
            <div>
                <input type="text" [(ngModel)]="filterText" (ngModelChange)="onInputChanged()" placeholder="Full name search..."/>
            </div>
            <div>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
        </div>
    `
})
export class PersonFilter implements IFilterAngularComp {
    filterParams!: IFilterParams;
    filterText = '';

    agInit(params: IFilterParams): void {
        this.filterParams = params;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        // make sure each word passes separately, ie search for firstname, lastname
        let passed = true;
        const { node } = params;

        this.filterText.toLowerCase().split(' ').forEach(filterWord => {
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
        if (!this.isFilterActive()) { return null; }

        return { value: this.filterText };
    }

    setModel(model: any) {
        this.filterText = model == null ? null : model.value;
    }

    onInputChanged() {
        this.filterParams.filterChangedCallback();
    }
}
