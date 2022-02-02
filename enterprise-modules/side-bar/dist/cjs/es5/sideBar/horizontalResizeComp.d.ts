import { Component } from "@ag-grid-community/core";
export declare class HorizontalResizeComp extends Component {
    private horizontalResizeService;
    private startingWidth;
    private elementToResize;
    private inverted;
    private minWidth;
    private maxWidth;
    constructor();
    setElementToResize(elementToResize: HTMLElement): void;
    private postConstruct;
    private onResizeStart;
    private onResizing;
    setInverted(inverted: boolean): void;
    setMaxWidth(value: number | null): void;
    setMinWidth(value: number | null): void;
}
