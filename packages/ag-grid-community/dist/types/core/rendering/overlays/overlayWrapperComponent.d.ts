import type { BeanCollection } from '../../context/context';
import type { GridOptions } from '../../entities/gridOptions';
import type { LayoutView, UpdateLayoutClassesParams } from '../../styling/layoutFeature';
import type { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import type { IOverlayComp } from './overlayComponent';
export declare class OverlayWrapperComponent extends Component implements LayoutView {
    private overlayService;
    wireBeans(beans: BeanCollection): void;
    private readonly eOverlayWrapper;
    private activePromise;
    private activeOverlay;
    private updateListenerDestroyFunc;
    private activeOverlayWrapperCssClass;
    constructor();
    updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void;
    postConstruct(): void;
    private setWrapperTypeClass;
    showOverlay(overlayComponentPromise: AgPromise<IOverlayComp> | null, overlayWrapperCssClass: string, gridOption?: keyof GridOptions): void;
    private destroyActiveOverlay;
    hideOverlay(): void;
    destroy(): void;
}
export declare const OverlayWrapperSelector: ComponentSelector;
