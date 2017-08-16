export * from './lib/agGridReact';
export * from './lib/reactCellRendererFactory';
export * from './lib/reactFilterFactory';

import {AgGridReactProps} from "./lib/agGridReact";
import {Component} from "react";
declare module "ag-grid-react" {
    export class AgGridReact extends Component<AgGridReactProps, {}> {
    }
}
