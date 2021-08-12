// @ag-grid-community/react v26.0.0
import { RefObject } from 'react';
import { ColumnApi, GridApi } from '@ag-grid-community/core';
import { AgGridReact } from './agGridReact';
declare const useGridApis: <T extends AgGridReact>(gridRef: RefObject<T>) => [GridApi, ColumnApi];
export default useGridApis;
