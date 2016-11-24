import {autoinject, customElement} from "aurelia-framework";

import {GridOptions, RowNode} from "ag-grid";
// only import this if you are using the ag-Grid-Enterprise
import "ag-grid-enterprise/main";

import NameAndAgeRenderer from "../../renderers/NameAndAgeRenderer";

@autoinject()
@customElement('full-width-example')
export class FloatingRowExample {

  private gridOptions: GridOptions;

  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.isFullWidthCell = (rowNode: RowNode)=> {
      return (rowNode.id === "0") || (parseInt(rowNode.id) % 2 === 0);
    };
    this.gridOptions.fullWidthCellRenderer = NameAndAgeRenderer
  }

  private createRowData() {
    return [
      {name: "Bob", age: 10},
      {name: "Harry", age: 3},
      {name: "Sally", age: 20},
      {name: "Mary", age: 5},
      {name: "John", age: 15},
    ];
  }
}

