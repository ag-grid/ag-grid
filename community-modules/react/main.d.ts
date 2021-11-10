import {Component} from "react";
import {AgGridReactProps, AgReactUiProps} from "./lib/shared/interfaces";
import {AgGridColumnGroupProps, AgGridColumnProps} from "./lib/shared/agGridColumn";

export * from './lib/agGridReact';
export * from './lib/shared/agGridColumn';

export declare class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
}

export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
}

export * from "./lib/shared/interfaces";
