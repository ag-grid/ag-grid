import { Autowired, PostConstruct } from '../../context/context';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { AgPromise } from '../../utils';
import { clearElement } from '../../utils/dom';
import { LayoutCssClasses, LayoutFeature, LayoutView, UpdateLayoutClassesParams } from "../../styling/layoutFeature";

import { OverlayService } from './overlayService';

export class OverlayWrapperComponent extends Component implements LayoutView {

    // wrapping in outer div, and wrapper, is needed to center the loading icon
    private static TEMPLATE = /* html */`
        <div class="ag-overlay" aria-hidden="true">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>`;

    @Autowired('overlayService') private readonly overlayService: OverlayService;

    @RefSelector('eOverlayWrapper') eOverlayWrapper: HTMLElement;

    private activeOverlay: Component;
    private inProgress = false;
    private destroyRequested = false;
    private activeOverlayWrapperCssClass: string;

    constructor() {
        super(OverlayWrapperComponent.TEMPLATE);
    }

    public updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
        overlayWrapperClassList.toggle(LayoutCssClasses.PRINT, params.print);
    }

    @PostConstruct
    private postConstruct(): void {
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

    public showOverlay(overlayComp: AgPromise<Component> | null, overlayWrapperCssClass: string): void {
        if (this.inProgress) {
            return;
        }

        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.destroyActiveOverlay();

        this.inProgress = true;

        if (overlayComp) {
            overlayComp.then(comp => {
                this.inProgress = false;

                this.eOverlayWrapper.appendChild(comp!.getGui());
                this.activeOverlay = comp!;

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

        this.activeOverlay = this.getContext().destroyBean(this.activeOverlay)!;

        clearElement(this.eOverlayWrapper);
    }

    public hideOverlay(): void {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }

    public destroy(): void {
        this.destroyActiveOverlay();
        super.destroy();
    }
}
