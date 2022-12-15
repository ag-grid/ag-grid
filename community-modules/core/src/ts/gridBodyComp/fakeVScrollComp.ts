
import { ColumnModel } from "../columns/columnModel";
import { Autowired, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { BodyScrollEvent } from "../events";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { setFixedHeight, setFixedWidth } from "../utils/dom";
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { CenterWidthFeature } from "./centerWidthFeature";
import { SetHeightFeature } from "./rowContainer/setHeightFeature";
import { ScrollVisibleService } from "./scrollVisibleService";

export class FakeVScrollComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-body-vertical-scroll" aria-hidden="true">
            <div class="ag-body-vertical-scroll-viewport" ref="eViewport">
                <div class="ag-body-vertical-scroll-container" ref="eContainer"></div>
            </div>
        </div>`;

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;

    private invisibleScrollbar: boolean;

    constructor() {
        super(FakeVScrollComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.createManagedBean(new SetHeightFeature(this.eContainer));
        this.ctrlsService.registerFakeVScrollComp(this);
    }
    
    private onScrollVisibilityChanged(): void {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
    }
    
    private setScrollVisible(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;

        const scrollbarWidth = vScrollShowing ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;

        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        setFixedWidth(this.getGui(), adjustedScrollbarWidth);
        setFixedWidth(this.eViewport, adjustedScrollbarWidth);
        setFixedWidth(this.eContainer, adjustedScrollbarWidth);
        this.setDisplayed(vScrollShowing, { skipAriaHidden: true });
    }

    private initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) { return; }

        this.invisibleScrollbar = isInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            // this.hideAndShowInvisibleScrollAsNeeded();
            // this.addActiveListenerToggles();
            // this.refreshCompBottom();
        }
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }
}