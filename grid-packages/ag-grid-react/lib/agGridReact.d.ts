// ag-grid-react v26.1.0
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';
export declare class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
    api: GridApi;
    columnApi: ColumnApi;
    private setGridApi;
    render(): JSX.Element;
}
