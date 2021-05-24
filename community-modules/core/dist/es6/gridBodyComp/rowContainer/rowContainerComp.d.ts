// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
export declare class RowContainerComp extends Component {
    private rowRenderer;
    private beans;
    private eViewport;
    private eContainer;
    private eWrapper;
    private readonly name;
    private renderedRows;
    private embedFullWidthRows;
    private domOrder;
    private lastPlacedElement;
    constructor();
    private postConstruct;
    private forContainers;
    private stopHScrollOnPinnedRows;
    private listenOnDomOrder;
    getViewportElement(): HTMLElement;
    clearLastPlacedElement(): void;
    appendRow(element: HTMLElement): void;
    ensureDomOrder(eRow: HTMLElement): void;
    removeRow(eRow: HTMLElement): void;
    private onDisplayedRowsChanged;
    private getRowCons;
    private newRowComp;
}
