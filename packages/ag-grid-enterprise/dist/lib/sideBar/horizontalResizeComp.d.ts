// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
export declare class HorizontalResizeComp extends Component {
    private horizontalResizeService;
    private gridOptionsWrapper;
    private eventService;
    private startingWidth;
    private elementToResize;
    constructor();
    setElementToResize(elementToResize: HTMLElement): void;
    private postConstruct;
    private onResizeStart;
    private onResizing;
}
