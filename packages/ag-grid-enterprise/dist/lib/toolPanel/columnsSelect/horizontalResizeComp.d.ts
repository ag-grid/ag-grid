// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid";
export declare class HorizontalResizeComp extends Component {
    private horizontalResizeService;
    private gridOptionsWrapper;
    private eventService;
    private startingWidth;
    private props;
    constructor();
    private postConstruct();
    private onResizeStart();
    private onResizing(delta);
}
