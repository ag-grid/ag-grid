import React, { Component } from 'react';

import type { GridApi } from 'ag-grid-community';

import { AgGridReactUi } from './reactUi/agGridReactUi';
import type { AgGridReactProps, AgReactUiProps } from './shared/interfaces';

export class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, object> {
    /** Grid Api available after onGridReady event has fired. */
    public api!: GridApi<TData>;
    private apiListeners: Array<(params: any) => void> = [];

    public registerApiListener(listener: (api: GridApi) => void) {
        this.apiListeners.push(listener);
    }

    private setGridApi = (api: GridApi) => {
        this.api = api;
        this.apiListeners.forEach((listener) => listener(api));
    };

    override componentWillUnmount() {
        this.apiListeners.length = 0;
    }

    override render() {
        return <AgGridReactUi<TData> {...this.props} setGridApi={this.setGridApi} />;
    }
}
