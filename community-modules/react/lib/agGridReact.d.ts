// @ag-grid-community/react v29.1.0
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from '@ag-grid-community/core';
export declare class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    api: GridApi<TData>;
    columnApi: ColumnApi;
    private setGridApi;
    render(): JSX.Element;
}
