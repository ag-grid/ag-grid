import {
    AgPromise,
    KeyCode,
    RefPlaceholder,
    _clearElement,
    _findNextFocusableElement,
    _focusInto,
    _getActiveDomElement,
    _isFormField,
    _isNothingFocused,
    _isVisibleForAria,
    _last,
    _setAriaAtomic,
    _setAriaLive,
    _setAriaRelevant,
    _setAriaRole,
} from 'ag-stack';

import type { LayoutView, UpdateLayoutClassesParams } from '../../styling/layoutFeature';
import { LayoutCssClasses, LayoutFeature } from '../../styling/layoutFeature';
import type { ElementParams } from '../../utils/element';
import { _isStopPropagationForAgGrid } from '../../utils/gridEvent';
import { _focusNextGridCoreContainer } from '../../utils/gridFocus';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import type { IOverlayComp, OverlayType } from './overlayComponent';
import { OVERLAY_ANNOUNCEMENT_ATTRIBUTE } from './overlayComponent';
import overlayWrapperComponentCSS from './overlayWrapperComponent.css';

const OVERLAY_ANNOUNCEMENT_DELAY = 500;

const OverlayWrapperElement: ElementParams = {
    tag: 'div',
    cls: 'ag-overlay',
    role: 'presentation',
    children: [
        {
            tag: 'div',
            ref: 'eOverlayPanel',
            cls: 'ag-overlay-panel',
            role: 'presentation',
            children: [{ tag: 'div', ref: 'eOverlayWrapper', cls: 'ag-overlay-wrapper', role: 'presentation' }],
        },
        { tag: 'div', ref: 'eOverlayLiveRegion', cls: 'ag-overlay-live-region' },
    ],
};

export class OverlayWrapperComponent extends Component implements LayoutView {
    private eOverlayPanel: HTMLElement | null = RefPlaceholder;
    private eOverlayWrapper: HTMLElement | null = RefPlaceholder;
    private eOverlayLiveRegion: HTMLElement | null = RefPlaceholder;

    public activeOverlay: IOverlayComp | null = null;
    private activePromise: AgPromise<IOverlayComp> | null = null;
    private activeCssClass: string | null = null;
    private elToFocusAfter: HTMLElement | null = null;
    private overlayExclusive = false;
    private oldWrapperPadding: number | null = null;
    private activeOverlayType: OverlayType | null = null;
    private announcementTimeout: number | null = null;
    private overlayContentObserver: MutationObserver | null = null;
    private loadingAnnounced = false;

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

        let isFocused: boolean;
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
        this.setOverlayPanelDisplayed(false);
        this.configureLiveRegion();

        this.beans.overlays!.setWrapperComp(this, false);
        this.addManagedElementListeners(this.getFocusableElement(), { keydown: this.handleKeyDown.bind(this) });
        this.addManagedEventListeners({ gridSizeChanged: this.refreshWrapperPadding.bind(this) });
    }

    private configureLiveRegion(): void {
        const eOverlayLiveRegion = this.eOverlayLiveRegion;
        if (!eOverlayLiveRegion) {
            return;
        }
        _setAriaRole(eOverlayLiveRegion, 'status');
        _setAriaLive(eOverlayLiveRegion, 'polite');
        _setAriaAtomic(eOverlayLiveRegion, true);
        _setAriaRelevant(eOverlayLiveRegion, 'additions text');
    }

    private setOverlayPanelDisplayed(displayed: boolean): void {
        const eOverlayPanel = this.eOverlayPanel;
        if (eOverlayPanel) {
            eOverlayPanel.style.display = displayed ? '' : 'none';
        }
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
        exclusive: boolean,
        overlayType?: OverlayType
    ): AgPromise<IOverlayComp | undefined> {
        this.destroyActiveOverlay();

        this.elToFocusAfter = null;
        this.activePromise = overlayComponentPromise;
        this.overlayExclusive = exclusive;
        this.activeOverlayType = overlayType ?? null;
        this.loadingAnnounced = false;
        this.configureOverlayWrapperAria();
        this.setLiveRegionText('');

        if (!overlayComponentPromise) {
            this.setOverlayPanelDisplayed(false);
            this.refreshWrapperPadding();
            return AgPromise.resolve();
        }

        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.setOverlayPanelDisplayed(true);
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
                    this.destroyBean(comp);
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

            this.startOverlayContentObserver();
            this.scheduleOverlayAnnouncement();

            if (exclusive && this.isGridFocused()) {
                _focusInto(eOverlayWrapper);
            }
        });
        return overlayComponentPromise;
    }

    private configureOverlayWrapperAria(): void {
        const eOverlayWrapper = this.eOverlayWrapper;
        if (!eOverlayWrapper) {
            return;
        }

        _setAriaRole(eOverlayWrapper, 'presentation');
        _setAriaLive(eOverlayWrapper, null);
        _setAriaAtomic(eOverlayWrapper, null);
        _setAriaRelevant(eOverlayWrapper, null);
    }

    private scheduleOverlayAnnouncement(): void {
        this.clearAnnouncementTimeout();

        this.announcementTimeout = window.setTimeout(() => {
            this.announcementTimeout = null;

            const announcement = this.getOverlayAnnouncementText();
            if (!announcement) {
                return;
            }

            if (this.activeOverlayType === 'loading') {
                this.loadingAnnounced = true;
            }
            this.setLiveRegionText(announcement);
        }, OVERLAY_ANNOUNCEMENT_DELAY);
    }

    public refreshOverlayAnnouncement(): void {
        this.setLiveRegionText('');
        this.scheduleOverlayAnnouncement();
    }

    private startOverlayContentObserver(): void {
        this.clearOverlayContentObserver();
        const eOverlayWrapper = this.eOverlayWrapper;
        if (!eOverlayWrapper) {
            return;
        }

        this.overlayContentObserver = new MutationObserver(() => this.refreshOverlayAnnouncement());
        this.overlayContentObserver.observe(eOverlayWrapper, {
            attributes: true,
            attributeFilter: ['aria-label', OVERLAY_ANNOUNCEMENT_ATTRIBUTE],
            childList: true,
            characterData: true,
            subtree: true,
        });
    }

    private getOverlayAnnouncementText(): string {
        const eGui = this.activeOverlay?.getGui();
        const value =
            this.getMarkedOverlayAnnouncementText(eGui) ||
            eGui?.getAttribute('aria-label') ||
            this.getLiveRegionText(eGui ?? null);

        return value.replace(/\s+/g, ' ').trim();
    }

    private getMarkedOverlayAnnouncementText(eGui: HTMLElement | undefined): string {
        if (!eGui) {
            return '';
        }

        const eAnnouncement =
            eGui.getAttribute(OVERLAY_ANNOUNCEMENT_ATTRIBUTE) === 'true'
                ? eGui
                : eGui.querySelector<HTMLElement>(`[${OVERLAY_ANNOUNCEMENT_ATTRIBUTE}="true"]`);

        return this.getLiveRegionText(eAnnouncement);
    }

    private getLiveRegionText(node: Node | null): string {
        if (!node) {
            return '';
        }

        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent ?? '';
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const element = node as HTMLElement;
        // Interactive controls announce themselves when focused, so they are excluded from overlay announcements.
        if (_isFormField(element) || !_isVisibleForAria(element)) {
            return '';
        }

        let text = '';
        const childNodes = element.childNodes;
        for (let i = 0, len = childNodes.length; i < len; ++i) {
            text += ` ${this.getLiveRegionText(childNodes[i])}`;
        }

        return text;
    }

    private clearAnnouncementTimeout(): void {
        if (this.announcementTimeout != null) {
            window.clearTimeout(this.announcementTimeout);
            this.announcementTimeout = null;
        }
    }

    private clearOverlayContentObserver(): void {
        this.overlayContentObserver?.disconnect();
        this.overlayContentObserver = null;
    }

    private setLiveRegionText(value: string): void {
        const eOverlayLiveRegion = this.eOverlayLiveRegion;
        if (!eOverlayLiveRegion) {
            return;
        }

        eOverlayLiveRegion.textContent = value;
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
        this.clearAnnouncementTimeout();
        this.clearOverlayContentObserver();

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
        if (!this.activeOverlay && !this.activePromise && this.activeOverlayType == null) {
            // Nothing is showing; bail out so a redundant hide cannot wipe a pending announcement
            return;
        }

        const shouldAnnounceCompletion =
            this.activeOverlayType === 'loading' &&
            this.loadingAnnounced &&
            this.beans.overlays?.getLoadingCompleteText();
        const completionText = shouldAnnounceCompletion || '';

        this.destroyActiveOverlay();
        this.activeOverlayType = null;
        this.loadingAnnounced = false;
        this.configureOverlayWrapperAria();
        this.setOverlayPanelDisplayed(false);

        if (completionText) {
            this.setLiveRegionText(completionText);
        } else {
            this.setLiveRegionText('');
        }
    }

    private isGridFocused(): boolean {
        const activeEl = _getActiveDomElement(this.beans);
        return !!activeEl && this.beans.eGridDiv.contains(activeEl);
    }

    public override destroy(): void {
        this.elToFocusAfter = null;
        this.clearAnnouncementTimeout();
        this.destroyActiveOverlay();
        this.beans.overlays!.setWrapperComp(this, true);
        super.destroy();
        this.eOverlayPanel = null;
        this.eOverlayWrapper = null;
        this.eOverlayLiveRegion = null;
    }
}
export const OverlayWrapperSelector: ComponentSelector = {
    selector: 'AG-OVERLAY-WRAPPER',
    component: OverlayWrapperComponent,
};
