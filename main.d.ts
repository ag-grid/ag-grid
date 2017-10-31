export * from './lib/agGridReact';

import {AgGridReactProps} from "./lib/agGridReact";
import {Component} from "react";
declare module "ag-grid-react" {
    export class AgGridReact extends Component<AgGridReactProps, {}> {
    }
}
