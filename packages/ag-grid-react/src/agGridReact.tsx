import React, { Component } from 'react';
import { AgGridReactUi } from './reactUi/agGridReactUi';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { GridApi } from 'ag-grid-community';


export class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    /** Grid Api available after onGridReady event has fired. */
    public api!: GridApi<TData>;
    private apiListeners: Array<(params: any) => void> = [];

    public registerApiListener(listener: (api: GridApi) => void) {
        this.apiListeners.push(listener);
    }

    private setGridApi = (api: GridApi) => {
        this.api = api;
        this.apiListeners.forEach(listener => listener(api));
    }

    componentWillUnmount() {
        this.apiListeners.length = 0;
    }

    render() {
        return <AgGridReactUi<TData> {...this.props} setGridApi={this.setGridApi} />;
    }
}