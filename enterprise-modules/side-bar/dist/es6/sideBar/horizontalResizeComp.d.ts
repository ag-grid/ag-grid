import { Component } from "@ag-grid-community/core";
export declare class HorizontalResizeComp extends Component {
    private horizontalResizeService;
    private gridOptionsWrapper;
    private startingWidth;
    private elementToResize;
    private inverted;
    constructor();
    setElementToResize(elementToResize: HTMLElement): void;
    private postConstruct;
    private onResizeStart;
    private onResizing;
    setInverted(inverted: boolean): void;
}
