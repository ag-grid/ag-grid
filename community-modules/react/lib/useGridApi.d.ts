// @ag-grid-community/react v25.3.0
import { RefObject } from 'react';
import { ColumnApi, GridApi } from "@ag-grid-community/core";
import { AgGridReact } from "./agGridReact";
export declare function useGridApis<T extends AgGridReact>(gridRef: RefObject<T>): [GridApi | null, ColumnApi | null];
