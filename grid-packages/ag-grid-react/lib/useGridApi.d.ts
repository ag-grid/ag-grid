// ag-grid-react v28.0.2
import { RefObject } from 'react';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { AgGridReact } from './agGridReact';
declare const useGridApis: <T extends AgGridReact<any>>(gridRef: RefObject<T>) => [GridApi<any>, ColumnApi];
export default useGridApis;
