import { html, PolymerElement } from "../node_modules/@polymer/polymer/polymer-element.js";
import "../node_modules/ag-grid-polymer/index.js";

class AgGridPolymerExample extends PolymerElement {
  static get template() {
    return html`
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-balham.css">
          
            <ag-grid-polymer style="width: 100%; height: 150px;"
                             class="ag-theme-balham"
                             rowData="{{rowData}}"
                             columnDefs="{{columnDefs}}"
                             enableSorting
                             enableFilter
                             on-first-data-rendered="{{firstDataRendered}}"
                             ></ag-grid-polymer>
    `;
  }

  constructor() {
    super();
    this.columnDefs = [{
      headerName: "Make",
      field: "make"
    }, {
      headerName: "Model",
      field: "model"
    }, {
      headerName: "Price",
      field: "price"
    }];
    this.rowData = [{
      make: "Toyota",
      model: "Celica",
      price: 35000
    }, {
      make: "Ford",
      model: "Mondeo",
      price: 32000
    }, {
      make: "Porsche",
      model: "Boxter",
      price: 72000
    }];
  }

  firstDataRendered(params) {
    params.api.sizeColumnsToFit();
  }

}

customElements.define('ag-grid-polymer-example', AgGridPolymerExample);