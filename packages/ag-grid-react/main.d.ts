export * from './lib/agGridReact';
export * from './lib/agGridColumn';

import {AgGridReactProps} from "./lib/agGridReact";
import {AgGridColumnProps, AgGridColumnGroupProps} from "./lib/agGridColumn";
import {Component} from "react";
declare module "ag-grid-react" {
    export class AgGridReact extends Component<AgGridReactProps, {}> {
    }
    export class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
    }
}
