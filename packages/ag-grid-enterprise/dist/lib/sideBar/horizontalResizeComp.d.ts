// ag-grid-enterprise v19.0.0
import { Component } from "ag-grid-community/main";
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
