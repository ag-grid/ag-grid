// @ag-grid-community/react v25.3.0
import { Component } from "react";
import { ColDef, ColGroupDef } from "@ag-grid-community/core";
export interface AgGridColumnProps extends ColDef {
}
export interface AgGridColumnGroupProps extends ColGroupDef {
}
export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    props: any;
    constructor(props: any);
    render(): any;
    static mapChildColumnDefs(children: any): any;
    static toColDef(columnProps: any): ColDef;
    static hasChildColumns(children: any): boolean;
}
