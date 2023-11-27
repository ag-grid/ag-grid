// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../../widgets/component';
import { AgPromise } from '../../utils';
import { LayoutView, UpdateLayoutClassesParams } from "../../styling/layoutFeature";
export declare class OverlayWrapperComponent extends Component implements LayoutView {
    private static TEMPLATE;
    private readonly overlayService;
    eOverlayWrapper: HTMLElement;
    private activeOverlay;
    private inProgress;
    private destroyRequested;
    private activeOverlayWrapperCssClass;
    constructor();
    updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void;
    private postConstruct;
    private setWrapperTypeClass;
    showOverlay(overlayComp: AgPromise<Component> | null, overlayWrapperCssClass: string): void;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
}
