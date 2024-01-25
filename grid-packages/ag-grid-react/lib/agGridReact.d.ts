// ag-grid-react v31.0.3
import { Component } from 'react';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';
export declare class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    /** Grid Api available after onGridReady event has fired. */
    api: GridApi<TData>;
    /**
     * @deprecated v31 - The `columnApi` has been deprecated and all the methods are now present of the `api`.
     * Please use the `api` instead.
     */
    columnApi: ColumnApi;
    private apiListeners;
    registerApiListener(listener: (api: GridApi) => void): void;
    private setGridApi;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
