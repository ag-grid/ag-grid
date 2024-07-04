import type { BeanCollection } from '../context/context';
import type { AnimationFrameService } from '../misc/animationFrameService';
import { _isIOSUserAgent, _isInvisibleScrollbar, _isMacOsUserAgent } from '../utils/browser';
import { _isVisible } from '../utils/dom';
import { _waitUntil } from '../utils/function';
import { Component, RefPlaceholder } from '../widgets/component';

export abstract class AbstractFakeScrollComp extends Component {
    private animationFrameService: AnimationFrameService;

    public wireBeans(beans: BeanCollection): void {
        this.animationFrameService = beans.animationFrameService;
    }

    protected readonly eViewport: HTMLElement = RefPlaceholder;
    protected readonly eContainer: HTMLElement = RefPlaceholder;

    protected invisibleScrollbar: boolean;
    protected hideTimeout: number | null = null;

    protected abstract setScrollVisible(): void;
    public abstract getScrollPosition(): number;
    public abstract setScrollPosition(value: number): void;

    constructor(
        template: string,
        private readonly direction: 'horizontal' | 'vertical'
    ) {
        super();
        this.setTemplate(template);
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            scrollVisibilityChanged: this.onScrollVisibilityChanged.bind(this),
        });
        this.onScrollVisibilityChanged();
        this.addOrRemoveCssClass('ag-apple-scrollbar', _isMacOsUserAgent() || _isIOSUserAgent());
    }

    protected initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }

        this.invisibleScrollbar = _isInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
        }
    }

    protected addActiveListenerToggles(): void {
        const eGui = this.getGui();
        const onActivate = () => this.addOrRemoveCssClass('ag-scrollbar-active', true);
        const onDeactivate = () => this.addOrRemoveCssClass('ag-scrollbar-active', false);
        this.addManagedListeners(eGui, {
            mouseenter: onActivate,
            mousedown: onActivate,
            touchstart: onActivate,
            mouseleave: onDeactivate,
            touchend: onDeactivate,
        });
    }

    protected onScrollVisibilityChanged(): void {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `postConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }

        this.animationFrameService.requestAnimationFrame(() => this.setScrollVisible());
    }

    protected hideAndShowInvisibleScrollAsNeeded(): void {
        this.addManagedEventListeners({
            bodyScroll: (params) => {
                if (params.direction === this.direction) {
                    if (this.hideTimeout !== null) {
                        window.clearTimeout(this.hideTimeout);
                        this.hideTimeout = null;
                    }
                    this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
                }
            },
            bodyScrollEnd: () => {
                this.hideTimeout = window.setTimeout(() => {
                    this.addOrRemoveCssClass('ag-scrollbar-scrolling', false);
                    this.hideTimeout = null;
                }, 400);
            },
        });
    }

    protected attemptSettingScrollPosition(value: number) {
        const viewport = this.getViewportElement();
        _waitUntil(
            () => _isVisible(viewport),
            () => this.setScrollPosition(value),
            100
        );
    }

    public getViewportElement(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public onScrollCallback(fn: () => void): void {
        this.addManagedElementListeners(this.getViewportElement(), { scroll: fn });
    }
}
