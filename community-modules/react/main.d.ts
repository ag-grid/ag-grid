import {Component} from "react";
import {AgGridReactProps, AgReactUiProps} from "./lib/interfaces";
import {AgGridColumnGroupProps, AgGridColumnProps} from "./lib/agGridColumn";

export * from './lib/agGridReact';
export * from './lib/agGridColumn';

export declare class AgGridReact extends Component<AgGridReactProps | AgReactUiProps, {}> {
}

export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
}

export * from "./lib/interfaces";
