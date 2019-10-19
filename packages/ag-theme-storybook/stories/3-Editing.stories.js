import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine.scss";
import "@ag-community/client-side-row-model";
import { AgGridReact } from "ag-grid-react";
import React from "react";
import { themeKnob, rtlKnob } from "./knobs";

export default {
  title: "Editing"
};

const data = [
  {
    make: "Toyota",
    model: "Celica",
    price: 35000
  },
  {
    make: "Ford",
    model: "Mondeo",
    price: 32000
  },
  {
    make: "Porsche",
    model: "Boxter",
    price: 72000
  },
  {
    make: "Toyota",
    model: "Celica",
    price: 35000
  },
  {
    make: "Ford",
    model: "Mondeo",
    price: 32000
  },
  {
    make: "Porsche",
    model: "Boxter",
    price: 72000
  },
  {
    make: "Toyota",
    model: "Celica",
    price: 35000
  },
  {
    make: "Ford",
    model: "Mondeo",
    price: 32000
  },
  {
    make: "Porsche",
    model: "Boxter",
    price: 72000
  }
];

const columnDefs = [
  {
    headerName: "Make (select)",
    field: "make",
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["Toyota", "Ford", "Porsche"]
    }
  },
  {
    headerName: "Model (text)",
    field: "model",
    editable: true
  },
  {
    headerName: "Model (popup text)",
    field: "model",
    cellEditor: "agPopupTextCellEditor",
    editable: true
  },
  {
    headerName: "Model (popup large text)",
    field: "model",
    cellEditor: "agLargeTextCellEditor",
    cellEditorParams: {
      rows: 3,
      cols: 26
    },
    editable: true
  },
  {
    headerName: "Make (popup select)",
    field: "make",
    editable: true,
    cellEditor: "agPopupSelectCellEditor",
    cellEditorParams: {
      values: ["Toyota", "Ford", "Porsche"]
    }
  }
];

export const EditorsAvailableInCommunity = () => (
  <div
    className={themeKnob()}
    style={{
      height: "500px",
      width: "100%"
    }}
  >
    <AgGridReact
      enableRtl={rtlKnob()}
      columnDefs={columnDefs}
      rowData={data}
      rowSelection="multiple"
    ></AgGridReact>
  </div>
);
