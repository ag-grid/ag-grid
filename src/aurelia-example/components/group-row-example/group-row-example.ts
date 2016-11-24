import {autoinject, customElement} from "aurelia-framework";

import {GridOptions} from "ag-grid";
// only import this if you are using the ag-Grid-Enterprise
import "ag-grid-enterprise/main";

import MedalRenderer from "../../renderers/MedalRenderer";

@autoinject()
@customElement('group-row-example')
export class GroupRowExample {

  private gridOptions: GridOptions;

  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.groupUseEntireRow = true;
    this.gridOptions.groupRowInnerRenderer = MedalRenderer;
  }

  private createRowData() {
    return [
      {country: "United States", name: "Bob", gold: 1, silver: 0, bronze: 0},
      {country: "United States", name: "Jack", gold: 0, silver: 1, bronze: 1},
      {country: "United States", name: "Sue", gold: 1, silver: 0, bronze: 1},
      {country: "United Kingdom", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "United Kingdom", name: "Tess", gold: 0, silver: 1, bronze: 1},
      {country: "United Kingdom", name: "John", gold: 0, silver: 2, bronze: 1},
      {country: "Jamaica", name: "Henry", gold: 1, silver: 1, bronze: 0},
      {country: "South Africa", name: "Kate", gold: 1, silver: 0, bronze: 1},
    ];
  }
}

