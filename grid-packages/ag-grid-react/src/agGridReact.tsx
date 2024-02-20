import React, { Component } from 'react';
import { AgGridReactUi } from './reactUi/agGridReactUi';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';


export class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    /** Grid Api available after onGridReady event has fired. */
    public api!: GridApi<TData>;
    /**
     * @deprecated v31 - The `columnApi` has been deprecated and all the methods are now present of the `api`.
     * Please use the `api` instead.
     */
    public columnApi!: ColumnApi;
    private apiListeners: Array<(params: any) => void> = [];

    public registerApiListener(listener: (api: GridApi) => void) {
        this.apiListeners.push(listener);
    }

    private setGridApi = (api: GridApi, columnApi: ColumnApi) => {
        this.api = api;
        this.columnApi = columnApi;
        this.apiListeners.forEach(listener => listener(api));
    }

    componentWillUnmount() {
        this.apiListeners.length = 0;
    }

    render() {
        return <AgGridReactUi<TData> {...this.props} setGridApi={this.setGridApi} />;
    }
}