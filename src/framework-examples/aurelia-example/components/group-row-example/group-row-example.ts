import {autoinject, customElement} from "aurelia-framework";
import {GridOptions} from "ag-grid";
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
    this.gridOptions.onGridReady = () => {
      this.gridOptions.api.sizeColumnsToFit();
    };
  }

  private createRowData() {
    return [
      {country: "United States", name: "Bob", gold: 1, silver: 0, bronze: 0},
      {country: "United States", name: "Jack", gold: 0, silver: 1, bronze: 1},
      {country: "United States", name: "Sue", gold: 1, silver: 0, bronze: 1},
      {country: "United Kingdom", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "United Kingdom", name: "Tess", gold: 0, silver: 1, bronze: 1},
      {country: "United Kingdom", name: "John", gold: 0, silver: 2, bronze: 1},
      {country: "Jamaica", name: "Bob", gold: 1, silver: 1, bronze: 0},
      {country: "Jamaica", name: "Jack", gold: 1, silver: 1, bronze: 0},
      {country: "Jamaica", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "South Africa", name: "Bob", gold: 1, silver: 0, bronze: 1},
      {country: "South Africa", name: "Jack", gold: 1, silver: 0, bronze: 1},
      {country: "South Africa", name: "Mary", gold: 1, silver: 0, bronze: 1},
      {country: "South Africa", name: "John", gold: 1, silver: 0, bronze: 1},
      {country: "New Zealand", name: "Bob", gold: 1, silver: 0, bronze: 0},
      {country: "New Zealand", name: "Jack", gold: 0, silver: 1, bronze: 1},
      {country: "New Zealand", name: "Sue", gold: 1, silver: 0, bronze: 1},
      {country: "Australia", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "Australia", name: "Tess", gold: 0, silver: 1, bronze: 1},
      {country: "Australia", name: "John", gold: 0, silver: 2, bronze: 1},
      {country: "Canada", name: "Bob", gold: 1, silver: 1, bronze: 0},
      {country: "Canada", name: "Jack", gold: 1, silver: 1, bronze: 0},
      {country: "Canada", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "Switzerland", name: "Bob", gold: 1, silver: 0, bronze: 1},
      {country: "Switzerland", name: "Jack", gold: 1, silver: 0, bronze: 1},
      {country: "Switzerland", name: "Mary", gold: 1, silver: 0, bronze: 1},
      {country: "Switzerland", name: "John", gold: 1, silver: 0, bronze: 1},
      {country: "Spain", name: "Bob", gold: 1, silver: 0, bronze: 0},
      {country: "Spain", name: "Jack", gold: 0, silver: 1, bronze: 1},
      {country: "Spain", name: "Sue", gold: 1, silver: 0, bronze: 1},
      {country: "Portugal", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "Portugal", name: "Tess", gold: 0, silver: 1, bronze: 1},
      {country: "Portugal", name: "John", gold: 0, silver: 2, bronze: 1},
      {country: "Zimbabwe", name: "Bob", gold: 1, silver: 1, bronze: 0},
      {country: "Zimbabwe", name: "Jack", gold: 1, silver: 1, bronze: 0},
      {country: "Zimbabwe", name: "Mary", gold: 1, silver: 1, bronze: 0},
      {country: "Brazil", name: "Bob", gold: 1, silver: 0, bronze: 1},
      {country: "Brazil", name: "Jack", gold: 1, silver: 0, bronze: 1},
      {country: "Brazil", name: "Mary", gold: 1, silver: 0, bronze: 1},
      {country: "Brazil", name: "John", gold: 1, silver: 0, bronze: 1}
    ];
  }
}

