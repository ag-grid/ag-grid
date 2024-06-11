import type { BeanCollection } from '../../context/context';
import type { LayoutView, UpdateLayoutClassesParams } from '../../styling/layoutFeature';
import { LayoutCssClasses, LayoutFeature } from '../../styling/layoutFeature';
import { _clearElement } from '../../utils/dom';
import type { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component, RefPlaceholder } from '../../widgets/component';
import type { OverlayService } from './overlayService';

export class OverlayWrapperComponent extends Component implements LayoutView {
    private overlayService: OverlayService;

    public wireBeans(beans: BeanCollection): void {
        this.overlayService = beans.overlayService;
    }

    private readonly eOverlayWrapper: HTMLElement = RefPlaceholder;

    private activeOverlay: Component;
    private inProgress = false;
    private destroyRequested = false;
    private activeOverlayWrapperCssClass: string;
    private updateListenerDestroyFunc?: () => null;

    constructor() {
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        super(/* html */ `
            <div class="ag-overlay" role="presentation">
                <div class="ag-overlay-panel" role="presentation">
                    <div class="ag-overlay-wrapper" data-ref="eOverlayWrapper" role="presentation"></div>
                </div>
            </div>`);
    }

    public updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        overlayWrapperClassList.toggle(LayoutCssClasses.PRINT, params.print);
    }

    public postConstruct(): void {
        this.createManagedBean(new LayoutFeature(this));
        this.setDisplayed(false, { skipAriaHidden: true });

        this.overlayService.registerOverlayWrapperComp(this);
    }

    private setWrapperTypeClass(overlayWrapperCssClass: string): void {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        if (this.activeOverlayWrapperCssClass) {
            overlayWrapperClassList.toggle(this.activeOverlayWrapperCssClass, false);
        }
        this.activeOverlayWrapperCssClass = overlayWrapperCssClass;
        overlayWrapperClassList.toggle(overlayWrapperCssClass, true);
    }

    public showOverlay(
        overlayComp: AgPromise<Component> | null,
        overlayWrapperCssClass: string,
        updateListenerDestroyFunc: () => null
    ): void {
        if (this.inProgress) {
            return;
        }

        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.destroyActiveOverlay();

        this.inProgress = true;

        if (overlayComp) {
            overlayComp.then((comp) => {
                this.inProgress = false;

                this.eOverlayWrapper.appendChild(comp!.getGui());
                this.activeOverlay = comp!;
                this.updateListenerDestroyFunc = updateListenerDestroyFunc;

                if (this.destroyRequested) {
                    this.destroyRequested = false;
                    this.destroyActiveOverlay();
                }
            });
        }

        this.setDisplayed(true, { skipAriaHidden: true });
    }

    private destroyActiveOverlay(): void {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }

        if (!this.activeOverlay) {
            return;
        }

        this.activeOverlay = this.destroyBean(this.activeOverlay)!;
        this.updateListenerDestroyFunc?.();

        _clearElement(this.eOverlayWrapper);
    }

    public hideOverlay(): void {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }

    public override destroy(): void {
        this.destroyActiveOverlay();
        super.destroy();
    }
}
export const OverlayWrapperSelector: ComponentSelector = {
    selector: 'AG-OVERLAY-WRAPPER',
    Component: OverlayWrapperComponent,
};
