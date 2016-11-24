import {autoinject, customElement} from 'aurelia-framework'

import {GridOptions} from 'ag-grid';
// only import this if you are using the ag-Grid-Enterprise
import 'ag-grid-enterprise/main';

@autoinject()
@customElement('editor-example')
export class EditorExample {

  private gridOptions: GridOptions;

  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.rowData = this.createRowData();
  }

  private createRowData() {
    return [
      {name: "Bob", happy: "Happy", number: 10},
      {name: "Harry", happy: "Sad", number: 3},
      {name: "Sally", happy: "Happy", number: 20},
      {name: "Mary", mood: "Sad", number: 5},
      {name: "John", mood: "Happy", number: 15},
    ];
  }
}
