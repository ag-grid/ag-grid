import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Component } from "../../widgets/component";
import { UserComponentFactory } from "../../components/framework/userComponentFactory";
export declare class OverlayWrapperComponent extends Component {
    private static TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    userComponentFactory: UserComponentFactory;
    eOverlayWrapper: HTMLElement;
    private activeOverlay;
    private inProgress;
    private destroyRequested;
    constructor();
    private postConstruct;
    private setWrapperTypeClass;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    private showOverlay;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
}
