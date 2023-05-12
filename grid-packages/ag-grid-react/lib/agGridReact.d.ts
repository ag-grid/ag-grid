// ag-grid-react v29.3.5
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';
export declare class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    api: GridApi<TData>;
    columnApi: ColumnApi;
    private setGridApi;
    render(): JSX.Element;
}
