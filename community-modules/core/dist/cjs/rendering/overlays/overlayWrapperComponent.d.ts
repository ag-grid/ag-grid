// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../../widgets/component';
import { UserComponentFactory } from '../../components/framework/userComponentFactory';
import { LayoutView, UpdateLayoutClassesParams } from "../../styling/layoutFeature";
export declare class OverlayWrapperComponent extends Component implements LayoutView {
    private static TEMPLATE;
    userComponentFactory: UserComponentFactory;
    private paginationProxy;
    private gridApi;
    private columnController;
    eOverlayWrapper: HTMLElement;
    private activeOverlay;
    private inProgress;
    private destroyRequested;
    constructor();
    updateLayoutClasses(params: UpdateLayoutClassesParams): void;
    private postConstruct;
    private setWrapperTypeClass;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    private showOverlay;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
    private showOrHideOverlay;
    private onRowDataChanged;
    private onNewColumnsLoaded;
}
