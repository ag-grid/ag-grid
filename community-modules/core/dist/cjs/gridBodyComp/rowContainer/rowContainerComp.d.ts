// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
export declare class RowContainerComp extends Component {
    private beans;
    private eViewport;
    private eContainer;
    private eWrapper;
    private readonly name;
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
