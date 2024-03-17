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
    private updateListenerDestroyFunc?;
    constructor();
    updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void;
    private postConstruct;
    private setWrapperTypeClass;
    showOverlay(overlayComp: AgPromise<Component> | null, overlayWrapperCssClass: string, updateListenerDestroyFunc: () => null): void;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
}
