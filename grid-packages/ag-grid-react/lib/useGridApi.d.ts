// ag-grid-react v25.2.0
import { RefObject } from 'react';
import { ColumnApi, GridApi } from "ag-grid-community";
import { AgGridReact } from "./agGridReact";
export declare function useGridApis<T extends AgGridReact>(gridRef: RefObject<T>): [GridApi | null, ColumnApi | null];
