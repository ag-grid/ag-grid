// @ag-grid-community/react v26.0.0
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './interfaces';
import { ColumnApi, GridApi } from '@ag-grid-community/core';
export declare class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
    api: GridApi;
    columnApi: ColumnApi;
    private setGridApi;
    render(): JSX.Element;
}
