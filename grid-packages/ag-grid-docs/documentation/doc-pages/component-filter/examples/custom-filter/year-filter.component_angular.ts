import { Component } from "@angular/core";

import { IFilterAngularComp } from "@ag-grid-community/angular";
import { IDoesFilterPassParams, IFilterParams } from "@ag-grid-community/core";

@Component({
  selector: 'year-component',
  template: `
      <div style="display: inline-block; width: 400px;">
      <div style="padding: 10px; text-align: center;">Select Year Range</div>
      <label style="margin: 10px; padding: 10px; display: inline-block;">
        <input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'All'"/> All
      </label>
      <label style="margin: 10px; padding: 10px; display: inline-block;">
        <input type="radio" name="year" [(ngModel)]="year" (ngModelChange)="updateFilter()" [value]="'2010'"/> Since 2010
      </label>
      </div>
    `
})
export class YearFilter implements IFilterAngularComp {
  params!: IFilterParams;
  year = 'All';

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.year === '2010'
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return params.data.year >= 2010;
  }

  getModel() {
  }

  setModel(model: any) {
  }

  updateFilter() {
    this.params.filterChangedCallback();
  }
}
