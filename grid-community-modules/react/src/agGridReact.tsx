import React, { Component } from 'react';
import { AgGridReactUi } from './reactUi/agGridReactUi';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from '@ag-grid-community/core';


export class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    public api!: GridApi<TData>;
    public columnApi!: ColumnApi;
    private apiListeners: Array<(params: any) => void> = [];

    public registerApiListener(listener: (params: any) => void) {
        this.apiListeners.push(listener);
    }

    private setGridApi = (api: GridApi, columnApi: ColumnApi) => {
        this.api = api;
        this.columnApi = columnApi;
        this.apiListeners.forEach(listener => listener({ api, columnApi }));
    }

    componentWillUnmount() {
        this.apiListeners.length = 0;
    }

    render() {
        return <AgGridReactUi<TData> {...this.props} setGridApi={this.setGridApi} />;
    }
}