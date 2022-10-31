// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
export declare class RowContainerComp extends Component {
    private beans;
    private eViewport;
    private eContainer;
    private eWrapper;
    private readonly name;
    private readonly type;
    private rowComps;
    private domOrder;
    private lastPlacedElement;
    constructor();
    private postConstruct;
    private preDestroy;
    private setRowCtrls;
    appendRow(element: HTMLElement): void;
    private ensureDomOrder;
    private newRowComp;
}
