import {autoinject, customElement} from "aurelia-framework";

import {GridOptions} from "ag-grid";
// only import this if you are using the ag-Grid-Enterprise
import "ag-grid-enterprise/main";

@autoinject()
@customElement('floating-row-example')
export class FloatingRowExample {

  private gridOptions: GridOptions;

  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.floatingTopRowData = [
      {row: "Top Row", number: "Top Number"}
    ];
    this.gridOptions.floatingBottomRowData = [
      {row: "Bottom Row", number: "Bottom Number"}
    ];
  }

  private createRowData() {
    let rowData: any[] = [];

    for (var i = 0; i < 15; i++) {
      rowData.push({
        row: "Row " + i,
        number: Math.round(Math.random() * 100)
      });
    }

    return rowData;
  }
}

