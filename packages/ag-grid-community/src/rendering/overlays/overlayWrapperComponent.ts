import { KeyCode } from '../../agStack/constants/keyCode';
import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import { _last } from '../../agStack/utils/array';
import { _getActiveDomElement, _isNothingFocused } from '../../agStack/utils/document';
import { _clearElement } from '../../agStack/utils/dom';
import { _findNextFocusableElement, _focusInto } from '../../agStack/utils/focus';
import { AgPromise } from '../../agStack/utils/promise';
import type { LayoutView, UpdateLayoutClassesParams } from '../../styling/layoutFeature';
import { LayoutCssClasses, LayoutFeature } from '../../styling/layoutFeature';
import type { ElementParams } from '../../utils/element';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _focusNextGridCoreContainer } from '../../utils/gridFocus';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import type { IOverlayComp } from './overlayComponent';
import { overlayWrapperComponentCSS } from './overlayWrapperComponent.css-GENERATED';

const OverlayWrapperElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay',
    role: 'presentation',
    children: [
        {
            tag: 'div',
            cls: 'ag-overlay-panel',
            role: 'presentation',
            children: [{ tag: 'div', ref: 'eOverlayWrapper', cls: 'ag-overlay-wrapper', role: 'presentation' }],
        },
    ],
};

export class OverlayWrapperComponent extends Component implements LayoutView {
    private eOverlayWrapper: HTMLElement | null = RefPlaceholder;

    public activeOverlay: IOverlayComp | null = null;
    private activePromise: AgPromise<IOverlayComp> | null = null;
    private activeCssClass: string | null = null;
    private elToFocusAfter: HTMLElement | null = null;
    private overlayExclusive = false;
    private oldWrapperPadding: number | null = null;

    constructor() {
        // wrapping in outer div, and wrapper, is needed to center the loading icon
        super(OverlayWrapperElement);
        this.registerCSS(overlayWrapperComponentCSS);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key !== KeyCode.TAB || e.defaultPrevented || _isStopPropagationForAgGrid(e)) {
            return;
        }

        const { beans, eOverlayWrapper } = this;

        const nextEl = eOverlayWrapper && _findNextFocusableElement(beans, eOverlayWrapper, false, e.shiftKey);
        if (nextEl) {
            return;
        }

        let isFocused = false;
        if (e.shiftKey) {
            isFocused = beans.focusSvc.focusGridView({
                column: _last(beans.visibleCols.allCols),
                backwards: true,
                canFocusOverlay: false,
            });
        } else {
            isFocused = _focusNextGridCoreContainer(beans, false);
        }

        if (isFocused) {
            e.preventDefault();
        }
    }

    public updateLayoutClasses(cssClass: string, params: UpdateLayoutClassesParams): void {
        const eOverlayWrapper = this.eOverlayWrapper;
        if (!eOverlayWrapper) {
            return;
        }
        const overlayWrapperClassList = eOverlayWrapper.classList;
        const { AUTO_HEIGHT, NORMAL, PRINT } = LayoutCssClasses;
        overlayWrapperClassList.toggle(AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(NORMAL, params.normal);
        overlayWrapperClassList.toggle(PRINT, params.print);
    }

    public postConstruct(): void {
        this.createManagedBean(new LayoutFeature(this));
        this.setDisplayed(false, { skipAriaHidden: true });

        this.beans.overlays!.setWrapperComp(this, false);
        this.addManagedElementListeners(this.getFocusableElement(), { keydown: this.handleKeyDown.bind(this) });
        this.addManagedEventListeners({ gridSizeChanged: this.refreshWrapperPadding.bind(this) });
    }

    private setWrapperTypeClass(overlayWrapperCssClass: string): void {
        const overlayWrapperClassList = this.eOverlayWrapper?.classList;
        if (!overlayWrapperClassList) {
            this.activeCssClass = null;
            return;
        }
        if (this.activeCssClass) {
            overlayWrapperClassList.toggle(this.activeCssClass, false);
        }
        this.activeCssClass = overlayWrapperCssClass;
        overlayWrapperClassList.toggle(overlayWrapperCssClass, true);
    }

    public showOverlay(
        overlayComponentPromise: AgPromise<IOverlayComp> | null,
        overlayWrapperCssClass: string,
        exclusive: boolean
    ): AgPromise<IOverlayComp | undefined> {
        this.destroyActiveOverlay();

        this.elToFocusAfter = null;
        this.activePromise = overlayComponentPromise;
        this.overlayExclusive = exclusive;

        if (!overlayComponentPromise) {
            this.refreshWrapperPadding();
            return AgPromise.resolve();
        }

        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.setDisplayed(true, { skipAriaHidden: true });
        this.refreshWrapperPadding();

        if (exclusive && this.isGridFocused()) {
            const activeElement = _getActiveDomElement(this.beans);
            if (activeElement && !_isNothingFocused(this.beans)) {
                this.elToFocusAfter = activeElement as HTMLElement;
            }
        }

        overlayComponentPromise.then((comp) => {
            const eOverlayWrapper = this.eOverlayWrapper;
            if (!eOverlayWrapper) {
                this.destroyBean(comp);
                return; // Error handling
            }
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
                eOverlayWrapper.appendChild(comp.getGui());
                this.activeOverlay = comp;
            }

            if (exclusive && this.isGridFocused()) {
                _focusInto(eOverlayWrapper);
            }
        });
        return overlayComponentPromise;
    }

    public refreshWrapperPadding(): void {
        if (!this.eOverlayWrapper) {
            this.oldWrapperPadding = null;
            return;
        }

        const overlayActive = !!this.activeOverlay || !!this.activePromise;
        let padding = 0;

        if (overlayActive && !this.overlayExclusive) {
            padding = this.beans.ctrlsSvc.get('gridHeaderCtrl')?.headerHeight || 0;
        }

        if (padding !== this.oldWrapperPadding) {
            this.oldWrapperPadding = padding;
            this.eOverlayWrapper.style.setProperty('padding-top', `${padding}px`);
        }
    }

    private destroyActiveOverlay(): void {
        this.activePromise = null;

        const activeOverlay = this.activeOverlay;
        if (!activeOverlay) {
            this.overlayExclusive = false;
            this.elToFocusAfter = null;
            this.refreshWrapperPadding();
            return; // Nothing to destroy
        }

        let elementToFocus = this.elToFocusAfter;
        this.elToFocusAfter = null;
        this.activeOverlay = null;
        this.overlayExclusive = false;

        if (elementToFocus && !this.isGridFocused()) {
            elementToFocus = null;
        }

        this.destroyBean(activeOverlay);

        const eOverlayWrapper = this.eOverlayWrapper;
        if (eOverlayWrapper) {
            _clearElement(eOverlayWrapper);
        }

        // Focus the element that was focused before the exclusive overlay was shown
        elementToFocus?.focus?.({ preventScroll: true });

        this.refreshWrapperPadding();
    }

    public hideOverlay(): void {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }

    private isGridFocused(): boolean {
        const activeEl = _getActiveDomElement(this.beans);
        return !!activeEl && this.beans.eGridDiv.contains(activeEl);
    }

    public override destroy(): void {
        this.elToFocusAfter = null;
        this.destroyActiveOverlay();
        this.beans.overlays!.setWrapperComp(this, true);
        super.destroy();
        this.eOverlayWrapper = null;
    }
}
export const OverlayWrapperSelector: ComponentSelector = {
    selector: 'AG-OVERLAY-WRAPPER',
    component: OverlayWrapperComponent,
};
