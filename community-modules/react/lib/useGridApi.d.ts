// @ag-grid-community/react v28.1.1
import { RefObject } from 'react';
import { ColumnApi, GridApi } from '@ag-grid-community/core';
import { AgGridReact } from './agGridReact';
declare const useGridApis: <T extends AgGridReact<any>>(gridRef: RefObject<T>) => [GridApi<any>, ColumnApi];
export default useGridApis;
