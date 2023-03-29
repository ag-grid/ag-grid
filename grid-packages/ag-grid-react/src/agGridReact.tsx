import React, { Component } from 'react';
import { AgGridReactLegacy } from './legacy/agGridReactLegacy';
import { AgGridReactUi } from './reactUi/agGridReactUi';
import { AgGridReactProps, AgReactUiProps } from './shared/interfaces';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { AgGridReactUiFunc } from './reactUi/agGridReactUiFunc';


export class AgGridReact<TData = any> extends Component<AgGridReactProps<TData> | AgReactUiProps<TData>, {}> {
    public api!: GridApi<TData>;
    public columnApi!: ColumnApi;

    private setGridApi = (api: GridApi, columnApi: ColumnApi) => {
        this.api = api;
        this.columnApi = columnApi
    }

    render() {
        const ReactComponentToUse = this.props.suppressReactUi ?
            <AgGridReactLegacy<TData> {...this.props} setGridApi={this.setGridApi} />
            : <AgGridReactUiFunc {...this.props} setGridApi={this.setGridApi} />;
        return ReactComponentToUse;
    }
}
