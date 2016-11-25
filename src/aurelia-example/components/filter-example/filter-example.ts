import {autoinject, customElement} from "aurelia-framework";

import {GridOptions} from "ag-grid";
// only import this if you are using the ag-Grid-Enterprise
import "ag-grid-enterprise/main";

import PartialMatchFilter from "../../filters/partialMatch";

@autoinject()
@customElement('filter-example')
export class FilterExample {

  private gridOptions: GridOptions;

  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.enableFilter = true;
    this.gridOptions.suppressMenuColumnPanel = true; // ag-enterprise only
    this.gridOptions.suppressMenuMainPanel = true; // ag-enterprise only
  }

  private createRowData() {
    return [
      {"row": "Row 1", "name": "Michael Phelps"},
      {"row": "Row 2", "name": "Natalie Coughlin"},
      {"row": "Row 3", "name": "Aleksey Nemov"},
      {"row": "Row 4", "name": "Alicia Coutts"},
      {"row": "Row 5", "name": "Missy Franklin"},
      {"row": "Row 6", "name": "Ryan Lochte"},
      {"row": "Row 7", "name": "Allison Schmitt"},
      {"row": "Row 8", "name": "Natalie Coughlin"},
      {"row": "Row 9", "name": "Ian Thorpe"},
      {"row": "Row 10", "name": "Bob Mill"},
      {"row": "Row 11", "name": "Willy Walsh"},
      {"row": "Row 12", "name": "Sarah McCoy"},
      {"row": "Row 13", "name": "Jane Jack"},
      {"row": "Row 14", "name": "Tina Wills"}
    ];
  }

  getPartialMatchFilter() {
    return PartialMatchFilter;
  }
}

