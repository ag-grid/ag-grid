export * from './lib/agGridReact';
export * from './lib/agGridColumn';

import {AgGridReactProps} from "./lib/agGridReact";
import {AgGridColumnGroupProps, AgGridColumnProps} from "./lib/agGridColumn";
import {Component} from "react";

export declare class AgGridReact extends Component<AgGridReactProps, {}> {
}

export declare class AgGridColumn extends Component<AgGridColumnProps | AgGridColumnGroupProps, {}> {
}

export {ICellEditorReactComp} from './lib/interfaces';
export {AgReactFrameworkComponent}  from './lib/interfaces';
export {IHeaderGroupReactComp}  from './lib/interfaces';
export {IHeaderReactComp}  from './lib/interfaces';
export {IDateReactComp}  from './lib/interfaces';
export {IFilterReactComp}  from './lib/interfaces';
export {ICellRendererReactComp}  from './lib/interfaces';
export {ILoadingCellRendererReactComp}  from './lib/interfaces';
export {ILoadingOverlayReactComp}  from './lib/interfaces';
export {INoRowsOverlayReactComp}  from './lib/interfaces';
export {IStatusPanelReactComp}  from './lib/interfaces';
export {IToolPanelReactComp}  from './lib/interfaces';


