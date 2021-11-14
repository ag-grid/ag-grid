// ag-grid-react v26.2.0
import { RefObject } from 'react';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { AgGridReact } from './agGridReact';
declare const useGridApis: <T extends AgGridReact>(gridRef: RefObject<T>) => [GridApi, ColumnApi];
export default useGridApis;
