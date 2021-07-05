import React from "react";
import {Component} from "react";
import {AgGridReactLegacy} from "./agGridReactLegacy";
import {AgGridReactFire} from "./next/agGridReactFire";
import {AgGridReactProps, AgReactUiProps} from "./interfaces";
import {ColumnApi, GridApi} from "ag-grid-community";


export class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
    public api!: GridApi;
    public columnApi!: ColumnApi;

    constructor(props: AgGridReactProps | AgReactUiProps) {
        super(props);
    }

    private setGridApi = (api: GridApi, columnApi: ColumnApi) => {
        this.api = api;
        this.columnApi = columnApi
    }

    render() {
        if (this.props.reactUi) {
            return <AgGridReactFire {...this.props} setGridApi={this.setGridApi} />;
        }
        return <AgGridReactLegacy {...this.props} setGridApi={this.setGridApi} />;
    }
}
