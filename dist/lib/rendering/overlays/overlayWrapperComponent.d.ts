// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Component } from "../../widgets/component";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentRecipes } from "../../components/framework/componentRecipes";
export interface IOverlayWrapperParams {
}
export interface IOverlayWrapperComp extends IComponent<IOverlayWrapperParams> {
    showLoadingOverlay(eOverlayWrapper: HTMLElement): void;
    showNoRowsOverlay(eOverlayWrapper: HTMLElement): void;
    hideOverlay(eOverlayWrapper: HTMLElement): void;
}
export declare class OverlayWrapperComponent extends Component implements IOverlayWrapperComp {
    private static LOADING_WRAPPER_OVERLAY_TEMPLATE;
    private static NO_ROWS_WRAPPER_OVERLAY_TEMPLATE;
    gridOptionsWrapper: GridOptionsWrapper;
    componentRecipes: ComponentRecipes;
    constructor();
    init(): void;
    showLoadingOverlay(eOverlayWrapper: HTMLElement): void;
    showNoRowsOverlay(eOverlayWrapper: HTMLElement): void;
    hideOverlay(eOverlayWrapper: HTMLElement): void;
    private showOverlay(eOverlayWrapper, overlay);
}
