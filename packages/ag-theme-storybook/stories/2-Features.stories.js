import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine.scss";
import "@ag-community/client-side-row-model";
import { AgGridReact } from "ag-grid-react";
import React, { useRef } from "react";
import { themeKnob, rtlKnob } from "./knobs";

export default {
  title: "Basic Features"
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
    field: "make",
    headerTooltip: "The Make of the car"
  },
  {
    headerName: "Model",
    field: "model",
    headerTooltip: "The model of the car, very long!"
  },
  {
    headerName: "Price",
    field: "price",
    headerTooltip: "Price"
  }
];

export const HeaderTooltip = () => (
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

const columnGroupDefs = [
  {
    headerName: "Make and Model",
    children: [
      {
        headerName: "Make",
        field: "make",
        headerTooltip: "The Make of the car"
      },
      {
        headerName: "Model",
        field: "model",
        headerTooltip: "The model of the car, very long!",
        columnGroupShow: "closed"
      }
    ]
  },
  {
    headerName: "Price",
    field: "price",
    headerTooltip: "Price"
  }
];

export const ColumnGroups = () => (
  <div
    className={themeKnob()}
    style={{
      height: "500px",
      width: "600px"
    }}
  >
    <AgGridReact
      enableRtl={rtlKnob()}
      columnDefs={columnGroupDefs}
      rowData={data}
    ></AgGridReact>
  </div>
);

export const ResizableColumnGroups = () => (
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
      columnDefs={columnGroupDefs}
      rowData={data}
    ></AgGridReact>
  </div>
);

const pinnedColumnDefs = [
  {
    headerName: "Make",
    field: "make",
    pinned: "left"
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
    headerName: "Make",
    field: "make"
  },
  {
    headerName: "Model",
    field: "model"
  },
  {
    headerName: "Price",
    field: "price",
    pinned: "right"
  }
];

export const PinnedColumns = () => (
  <div
    className={themeKnob()}
    style={{
      height: "500px",
      width: "700px"
    }}
  >
    <AgGridReact
      enableRtl={rtlKnob()}
      defaultColDef={{ resizable: true }}
      columnDefs={pinnedColumnDefs}
      rowData={data}
    ></AgGridReact>
  </div>
);

export const DraggableRows = () => (
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
      defaultColDef={{ resizable: true }}
      rowDragManaged={true}
      columnDefs={columnDefs.map((row, index) =>
        index === 0 ? { rowDrag: true, ...row } : row
      )}
      rowData={data}
    ></AgGridReact>
  </div>
);

export const Selection = () => (
  <div
    className={themeKnob()}
    style={{
      height: "500px",
      width: "600px"
    }}
  >
    <AgGridReact
      enableRtl={rtlKnob()}
      rowSelection={"multiple"}
      columnDefs={columnDefs}
      rowData={data}
    ></AgGridReact>
  </div>
);

export const FloatingFilter = () => {
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
        columnDefs={columnDefs.map(def => ({
          ...def,
          floatingFilterComponentParams: { suppressFilterButton: false },

          sortable: true,
          filter: true,
          filterParams: {
            applyButton: true,
            clearButton: true
          }
        }))}
        floatingFilter={true}
        rowData={data}
      ></AgGridReact>
    </div>
  );
};

export const Overlay = () => {
  const gridRef = useRef(null);

  return (
    <div>
      <button onClick={e => gridRef.current.api.showLoadingOverlay()}>
        Show Overlay
      </button>
      <div
        className={themeKnob()}
        style={{
          height: "500px",
          width: "100%"
        }}
      >
        <AgGridReact
          enableRtl={rtlKnob()}
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={data}
          rowSelection="multiple"
          overlayLoadingTemplate='<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
        ></AgGridReact>
      </div>
    </div>
  );
};
