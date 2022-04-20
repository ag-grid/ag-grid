// ag-grid-react v27.2.1
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';
export declare class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
    api: GridApi;
    columnApi: ColumnApi;
    private setGridApi;
    render(): JSX.Element;
}
