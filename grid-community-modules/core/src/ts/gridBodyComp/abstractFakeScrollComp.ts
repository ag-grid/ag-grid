import { Autowired } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { BodyScrollEvent } from "../events";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { ScrollVisibleService } from "./scrollVisibleService";

export abstract class AbstractFakeScrollComp extends Component {

    @RefSelector('eViewport') protected readonly eViewport: HTMLElement;
    @RefSelector('eContainer') protected readonly eContainer: HTMLElement;
    @Autowired('scrollVisibleService') protected readonly scrollVisibleService: ScrollVisibleService;
    @Autowired('ctrlsService') protected readonly ctrlsService: CtrlsService;

    protected invisibleScrollbar: boolean;
    protected hideTimeout: number | null = null;

    protected abstract setScrollVisible(): void;

    constructor(template: string, private readonly direction: 'horizontal' | 'vertical') {
        super(template);
    }

    protected postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.addOrRemoveCssClass('ag-apple-scrollbar', isMacOsUserAgent() || isIOSUserAgent());
    }

    protected initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) { return; }

        this.invisibleScrollbar = isInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
        }
    }

    protected addActiveListenerToggles(): void {
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'touchend'];
        const eGui = this.getGui();

        activateEvents.forEach(
            eventName => this.addManagedListener(
                eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', true)
            )
        );
        deactivateEvents.forEach(
            eventName => this.addManagedListener(
                eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', false)
            )
        );
    }

    protected onScrollVisibilityChanged(): void {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
    }

    protected hideAndShowInvisibleScrollAsNeeded(): void {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, (params: BodyScrollEvent) => {
            if (params.direction === this.direction) {
                if (this.hideTimeout !== null) {
                    window.clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => {
            this.hideTimeout = window.setTimeout(() => {
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', false);
                this.hideTimeout = null;
            }, 400);
        });
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }
}