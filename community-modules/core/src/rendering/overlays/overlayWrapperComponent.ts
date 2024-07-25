import type { VisibleColsService } from '../../columns/visibleColsService';
import { KeyCode } from '../../constants/keyCode';
import type { BeanCollection } from '../../context/context';
import type { GridOptions } from '../../entities/gridOptions';
import type { FocusService } from '../../focusService';
import type { LayoutView, UpdateLayoutClassesParams } from '../../styling/layoutFeature';
import { LayoutCssClasses, LayoutFeature } from '../../styling/layoutFeature';
import { _last } from '../../utils/array';
import { _clearElement } from '../../utils/dom';
import { _isStopPropagationForAgGrid } from '../../utils/event';
import type { AgPromise } from '../../utils/promise';
import type { ComponentSelector } from '../../widgets/component';
import { Component, RefPlaceholder } from '../../widgets/component';
import type { IOverlayComp } from './overlayComponent';
import type { OverlayService } from './overlayService';

export class OverlayWrapperComponent extends Component implements LayoutView {
    private overlayService: OverlayService;
    private focusService: FocusService;

    public wireBeans(beans: BeanCollection): void {
        this.overlayService = beans.overlayService;
        this.focusService = beans.focusService;
        this.visibleColsService = beans.visibleColsService;
    }

    private readonly eOverlayWrapper: HTMLElement = RefPlaceholder;

    private activePromise: AgPromise<IOverlayComp> | null = null;
    private activeOverlay: IOverlayComp | null = null;
    private updateListenerDestroyFunc: (() => null) | null = null;
    private activeOverlayWrapperCssClass: string | null = null;
    private elToFocusAfter: HTMLElement | null = null;
    private visibleColsService: VisibleColsService;

    constructor() {
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        super(/* html */ `
            <div class="ag-overlay" role="presentation">
                <div class="ag-overlay-panel" role="presentation">
                    <div class="ag-overlay-wrapper" data-ref="eOverlayWrapper" role="presentation"></div>
                </div>
            </div>`);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key !== KeyCode.TAB || e.defaultPrevented || _isStopPropagationForAgGrid(e)) {
            return;
        }

        const nextEl = this.focusService.findNextFocusableElement(this.eOverlayWrapper, false, e.shiftKey);
        if (nextEl) {
            return;
        }

        let isFocused = false;
        if (e.shiftKey) {
            isFocused = this.focusService.focusGridView(_last(this.visibleColsService.getAllCols()), true, false);
        } else {
            isFocused = this.focusService.focusNextGridCoreContainer(false);
        }

        if (isFocused) {
            e.preventDefault();
        }
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
        this.addManagedElementListeners(this.getFocusableElement(), { keydown: this.handleKeyDown.bind(this) });
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
        overlayComponentPromise: AgPromise<IOverlayComp> | null,
        overlayWrapperCssClass: string,
        exclusive: boolean,
        gridOption?: keyof GridOptions
    ): void {
        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.destroyActiveOverlay();

        this.elToFocusAfter = null;
        this.activePromise = overlayComponentPromise;

        if (!overlayComponentPromise) {
            return;
        }

        this.setDisplayed(true, { skipAriaHidden: true });

        if (exclusive && this.focusService.isGridFocused()) {
            const activeElement = this.gos.getActiveDomElement();
            if (activeElement && !this.gos.isNothingFocused()) {
                this.elToFocusAfter = activeElement as HTMLElement;
            }
        }

        overlayComponentPromise.then((comp) => {
            if (this.activePromise !== overlayComponentPromise) {
                // Another promise was started, we need to cancel this old operation
                if (this.activeOverlay !== comp) {
                    // We can destroy the component as it will not be used
                    this.destroyBean(comp);
                    comp = null;
                }
                return;
            }

            this.activePromise = null; // Promise completed, so we can reset this

            if (!comp) {
                return; // Error handling
            }

            if (this.activeOverlay !== comp) {
                this.eOverlayWrapper.appendChild(comp.getGui());
                this.activeOverlay = comp;

                if (gridOption) {
                    const component = comp;
                    this.updateListenerDestroyFunc = this.addManagedPropertyListener(gridOption, ({ currentValue }) => {
                        component.refresh?.(this.gos.addGridCommonParams({ ...(currentValue ?? {}) }));
                    });
                }
            }

            const focusService = this.focusService;
            if (exclusive && focusService.isGridFocused()) {
                focusService.focusInto(this.eOverlayWrapper);
            }
        });
    }

    private destroyActiveOverlay(): void {
        this.activePromise = null;

        const activeOverlay = this.activeOverlay;
        if (!activeOverlay) {
            return; // Nothing to destroy
        }

        let elementToFocus = this.elToFocusAfter;
        this.activeOverlay = null;
        this.elToFocusAfter = null;

        if (elementToFocus && !this.focusService.isGridFocused()) {
            elementToFocus = null;
        }

        const updateListenerDestroyFunc = this.updateListenerDestroyFunc;
        if (updateListenerDestroyFunc) {
            updateListenerDestroyFunc();
            this.updateListenerDestroyFunc = null;
        }

        this.destroyBean(activeOverlay);

        _clearElement(this.eOverlayWrapper);

        // Focus the element that was focused before the exclusive overlay was shown
        elementToFocus?.focus?.({ preventScroll: true });
    }

    public hideOverlay(): void {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }

    public override destroy(): void {
        this.elToFocusAfter = null;
        this.destroyActiveOverlay();
        super.destroy();
    }
}
export const OverlayWrapperSelector: ComponentSelector = {
    selector: 'AG-OVERLAY-WRAPPER',
    component: OverlayWrapperComponent,
};
