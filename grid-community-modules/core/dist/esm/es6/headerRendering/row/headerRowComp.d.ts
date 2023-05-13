// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../../widgets/component';
import { HeaderRowCtrl } from './headerRowCtrl';
export declare enum HeaderRowType {
    COLUMN_GROUP = "group",
    COLUMN = "column",
    FLOATING_FILTER = "filter"
}
export declare class HeaderRowComp extends Component {
    private ctrl;
    private headerComps;
    constructor(ctrl: HeaderRowCtrl);
    private init;
    private destroyHeaderCtrls;
    private setHeaderCtrls;
    private createHeaderComp;
}
