import { RefPlaceholder, _isIOSUserAgent, _isMacOsUserAgent, _isVisible, _waitUntil } from 'ag-stack';

import type { BodyScrollEvent } from '../events';
import type { ElementParams } from '../utils/element';
import { Component } from '../widgets/component';
import type { ScrollPartner } from './gridBodyScrollFeature';

/**
 * Size given to a fake scrollbar when the platform reports a zero-width scrollbar (overlay
 * scrollbars, e.g. macOS): the fake scrollbar is always drawn, so it still occupies space.
 */
export const INVISIBLE_SCROLLBAR_SIZE = 16;

export abstract class AbstractFakeScrollComp extends Component implements ScrollPartner {
    public readonly eViewport: HTMLElement = RefPlaceholder;
    protected readonly eContainer: HTMLElement = RefPlaceholder;

    protected invisibleScrollbar: boolean | undefined;
    protected hideTimeout: number = 0;
    private invisibleScrollbarListenersAdded = false;

    protected abstract setScrollVisible(): void;
    public abstract getScrollPosition(): number;
    public abstract setScrollPosition(value: number): void;
    private readonly queueSetScrollVisible = this.throttleToFrame(() => this.setScrollVisible());

    constructor(
        template: ElementParams,
        private readonly direction: 'horizontal' | 'vertical'
    ) {
        super();
        this.setTemplate(template);
    }

    public postConstruct(): void {
        const onScrollVisibilityChanged = this.onScrollVisibilityChanged.bind(this);
        this.addManagedEventListeners({
            scrollVisibilityChanged: onScrollVisibilityChanged,
            scrollbarWidthChanged: onScrollVisibilityChanged,
        });
        this.onScrollVisibilityChanged();
        this.toggleCss('ag-apple-scrollbar', _isMacOsUserAgent() || _isIOSUserAgent());
    }

    public override destroy(): void {
        super.destroy();

        window.clearTimeout(this.hideTimeout);
    }

    protected refreshInvisibleScrollbar(): void {
        const invisibleScrollbar = this.beans.scrollVisibleSvc.isInvisibleScrollbar();
        if (invisibleScrollbar === undefined) {
            return;
        }

        this.invisibleScrollbar = invisibleScrollbar;

        if (invisibleScrollbar && !this.invisibleScrollbarListenersAdded) {
            this.invisibleScrollbarListenersAdded = true;
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
        }
    }

    protected addActiveListenerToggles(): void {
        const eGui = this.getGui();
        const onActivate = () => this.toggleCss('ag-scrollbar-active', true);
        const onDeactivate = () => this.toggleCss('ag-scrollbar-active', false);
        this.addManagedListeners(eGui, {
            mouseenter: onActivate,
            mousedown: onActivate,
            touchstart: onActivate,
            mouseleave: onDeactivate,
            touchend: onDeactivate,
        });
    }

    protected onScrollVisibilityChanged(): void {
        this.refreshInvisibleScrollbar();

        this.queueSetScrollVisible();
    }

    protected hideAndShowInvisibleScrollAsNeeded(): void {
        this.addManagedEventListeners({
            bodyScroll: (params: BodyScrollEvent) => {
                if (params.direction === this.direction) {
                    if (this.hideTimeout) {
                        window.clearTimeout(this.hideTimeout);
                        this.hideTimeout = 0;
                    }
                    this.toggleCss('ag-scrollbar-scrolling', true);
                }
            },
            bodyScrollEnd: () => {
                this.hideTimeout = window.setTimeout(() => {
                    this.toggleCss('ag-scrollbar-scrolling', false);
                    this.hideTimeout = 0;
                }, 400);
            },
        });
    }

    protected attemptSettingScrollPosition(value: number) {
        const viewport = this.eViewport;
        _waitUntil(
            this,
            () => _isVisible(viewport),
            () => this.setScrollPosition(value),
            100
        );
    }

    public onScrollCallback(fn: () => void): void {
        this.addManagedElementListeners(this.eViewport, { scroll: fn });
    }
}
