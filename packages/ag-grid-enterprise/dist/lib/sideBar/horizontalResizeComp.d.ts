// ag-grid-enterprise v20.1.0
import { Component } from "ag-grid-community";
export declare class HorizontalResizeComp extends Component {
    private horizontalResizeService;
    private gridOptionsWrapper;
    private eventService;
    private startingWidth;
    props: {
        componentToResize: Component;
    };
    constructor();
    private postConstruct;
    private onResizeStart;
    private onResizing;
}
