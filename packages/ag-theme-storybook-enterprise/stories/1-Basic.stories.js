import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine.scss";
import "ag-grid-community/src/styles/ag-theme-alpine-dark/sass/ag-theme-alpine-dark.scss";
import "@ag-community/client-side-row-model";
import { AgGridReact } from "ag-grid-react";
import React from "react";
import "ag-grid-enterprise";
import { themeKnob, rtlKnob } from "./knobs";

export default {
  title: "Tutorial Steps (enterprise)"
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
    headerName: "Make",
    field: "make"
  },
  {
    headerName: "Model",
    field: "model"
  },
  {
    headerName: "Price",
    field: "price"
  }
];

export const BasicConfig = () => (
  <div
    className={themeKnob()}
    style={{
      height: "500px",
      width: "600px"
    }}
  >
    <AgGridReact
      enableRtl={rtlKnob()}
      columnDefs={columnDefs}
      rowData={data}
    ></AgGridReact>
  </div>
);

export const FilterEnabled = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "500px",
        width: "600px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        defaultColDef={{ resizable: true }}
        columnDefs={columnDefs.map(def => ({
          ...def,
          sortable: true,
          filter: true,
          filterParams: {
            applyButton: true,
            clearButton: true
          }
        }))}
        rowData={data}
      ></AgGridReact>
    </div>
  );
};

export const SelectionEnabled = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "500px",
        width: "600px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        columnDefs={columnDefs.map((def, index) => ({
          ...def,
          ...(index === 0
            ? { checkboxSelection: true, headerCheckboxSelection: true }
            : {}),
          sortable: true,
          filter: true,
          filterParams: {
            applyButton: true,
            clearButton: true
          }
        }))}
        rowSelection="multiple"
        rowData={data}
      ></AgGridReact>
    </div>
  );
};

const groupColumnDefs = [
  {
    headerName: "Make",
    field: "make",
    rowGroup: true
  },
  {
    headerName: "Model",
    field: "model"
  }
];

export const Grouping = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "500px",
        width: "600px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        animateRows={true}
        columnDefs={groupColumnDefs}
        groupSelectsChildren={true}
        rowSelection="multiple"
        rowData={data}
        rowGroupPanelShow="always"
        autoGroupColumnDef={{
          headerName: "Model",
          field: "model",
          cellRenderer: "agGroupCellRenderer",
          headerCheckboxSelection: true,
          cellRendererParams: {
            checkbox: true
          }
        }}
      ></AgGridReact>
    </div>
  );
};

export const RangeSelectionAndStatusBar = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "500px",
        width: "900px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        enableRangeSelection
        columnDefs={columnDefs}
        rowData={data}
        statusBar={{
          statusPanels: [
            {
              statusPanel: "agTotalAndFilteredRowCountComponent",
              align: "left"
            },
            { statusPanel: "agTotalRowCountComponent", align: "center" },
            { statusPanel: "agFilteredRowCountComponent" },
            { statusPanel: "agSelectedRowCountComponent" },
            { statusPanel: "agAggregationComponent" }
          ]
        }}
      ></AgGridReact>
    </div>
  );
};
