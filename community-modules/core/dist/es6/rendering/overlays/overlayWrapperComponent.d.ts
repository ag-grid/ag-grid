// Type definitions for @ag-grid-community/core v25.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../../widgets/component';
import { UserComponentFactory } from '../../components/framework/userComponentFactory';
export declare class OverlayWrapperComponent extends Component {
    private static TEMPLATE;
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
