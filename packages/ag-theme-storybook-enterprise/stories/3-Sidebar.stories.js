import { storiesOf } from "@storybook/react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine.scss";
import { withKnobs, text } from "@storybook/addon-knobs";
import { themeKnob, rtlKnob } from "./knobs";

import "@ag-community/client-side-row-model";
import { AgGridReact } from "ag-grid-react";
import React from "react";
import "ag-grid-enterprise";
import "ag-grid-enterprise/chartsModule";

export default {
  title: "Sidebar and Charts"
};

const stories = storiesOf("Storybook Knobs", module);

// Add the `withKnobs` decorator to add knobs support to your stories.
// You can also configure `withKnobs` as a global decorator.
stories.addDecorator(withKnobs);

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
  },
  {
    headerName: "Make + Model",
    children: [
      {
        headerName: "Make",
        field: "make"
      },
      {
        headerName: "Model",
        field: "model"
      }
    ]
  }
];

export const SideBarDefaultFeatureSet = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "800px",
        width: "1200px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        animateRows={true}
        rowGroupPanelShow="always"
        defaultColDef={{
          resizable: true,
          enableValue: true,
          enableRowGroup: true,
          sortable: true,
          filter: true
        }}
        columnDefs={columnDefs.map(def => ({
          ...def,
          sortable: true,
          filter: true,

          filterParams: {
            applyButton: true,
            clearButton: true
          }
        }))}
        sideBar
        floatingFilter
        rowData={data}
      ></AgGridReact>
    </div>
  );
};

export const Charts = () => {
  return (
    <div
      className={themeKnob()}
      style={{
        height: "800px",
        width: "1200px"
      }}
    >
      <AgGridReact
        enableRtl={rtlKnob()}
        animateRows={true}
        rowGroupPanelShow="always"
        enableCharts={true}
        enableRangeSelection={true}
        defaultColDef={{
          resizable: true,
          enableValue: true,
          enableRowGroup: true,
          sortable: true,
          filter: true
        }}
        columnDefs={columnDefs.map(def => ({
          ...def,
          filterParams: {
            applyButton: true,
            clearButton: true
          }
        }))}
        sideBar
        floatingFilter
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
