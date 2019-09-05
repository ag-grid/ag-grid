// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Component } from "../../widgets/component";
import { UserComponentFactory } from "../../components/framework/userComponentFactory";
export declare class OverlayWrapperComponent extends Component {
    private static TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    userComponentFactory: UserComponentFactory;
    eOverlayWrapper: HTMLElement;
    private activeOverlay;
    constructor();
    private postConstruct;
    private setWrapperTypeClass;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
}
