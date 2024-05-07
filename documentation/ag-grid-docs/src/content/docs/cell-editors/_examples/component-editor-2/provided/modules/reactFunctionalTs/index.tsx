"use strict";

import React, {
  useMemo,
  useState,
  StrictMode,
} from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "./styles.css";
import {
  ColDef,
  ModuleRegistry,
} from "@ag-grid-community/core";
import { getData } from "./data";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import GenderRenderer from "./genderRenderer";
import MoodEditor from "./moodEditor";
import MoodRenderer from "./moodRenderer";
import SimpleTextEditor from "./simpleTextEditor";

ModuleRegistry.registerModules([ClientSideRowModelModule, RichSelectModule]);

const GridExample = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState<any[]>(getData());
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { field: "first_name", headerName: "Provided Text" },
    {
      field: "last_name",
      headerName: "Custom Text",
      cellEditor: SimpleTextEditor,
    },
    {
      field: "age",
      headerName: "Provided Number",
      cellEditor: "agNumberCellEditor",
    },
    {
      field: "gender",
      headerName: "Provided Rich Select",
      cellRenderer: GenderRenderer,
      cellEditor: "agRichSelectCellEditor",
      cellEditorParams: {
        cellRenderer: GenderRenderer,
        values: ["Male", "Female"],
      },
    },
    {
      field: "mood",
      headerName: "Custom Mood",
      cellRenderer: MoodRenderer,
      cellEditor: MoodEditor,
      cellEditorPopup: true,
    },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div
        style={gridStyle}
        className={
          "ag-theme-quartz-dark"
        }
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          reactiveCustomComponents={true}
          defaultColDef={defaultColDef}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <GridExample />
  </StrictMode>,
);
