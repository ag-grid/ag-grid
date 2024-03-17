import { Component } from "ag-grid-community";
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
    private dispatchResizeEvent;
    private onResizeStart;
    private onResizeEnd;
    private onResizing;
    setInverted(inverted: boolean): void;
    setMaxWidth(value: number | null): void;
    setMinWidth(value: number | null): void;
}
