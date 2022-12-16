import { Component } from "@angular/core";

import { IFilterAngularComp } from "@ag-grid-community/angular";
import { IDoesFilterPassParams, IFilterParams } from "@ag-grid-community/core";

@Component({
    selector: 'year-component',
    template: `
      <div style="padding: 4px; width: 200px;">
      <div style="font-weight: bold;">Custom Athlete Filter</div>
      <div>
        <input style="margin: 4px 0 4px 0;" type="text" [(ngModel)]="filterText" (ngModelChange)="onInputChanged()" placeholder="Full name search..."/>
      </div>
      <div style="margin-top: 20px;">This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
      <div style="margin-top: 20px;">Just to emphasise that anything can go in here, here is an image!!</div>
      <div>
        <img src="https://www.ag-grid.com/images/ag-Grid2-200.png"
             style="width: 150px; text-align: center; padding: 10px; margin: 10px; border: 1px solid lightgrey;"/>
      </div>
      </div>
    `
})
export class PersonFilter implements IFilterAngularComp {
    params!: IFilterParams;
    filterText = '';

    agInit(params: IFilterParams): void {
        this.params = params;
    }

    doesFilterPass(params: IDoesFilterPassParams) {
        // make sure each word passes separately, ie search for firstname, lastname
        let passed = true;
        const { api, colDef, column, columnApi, context } = this.params;
        const { node } = params;

        this.filterText.toLowerCase().split(' ').forEach(filterWord => {
            const value = this.params.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });

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
        this.params.filterChangedCallback();
    }
}
