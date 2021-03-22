import { BeanStub } from "../context/beanStub";
import { isBrowserIE } from "../utils/browser";
import { Autowired, PostConstruct } from "../context/context";
import { ScrollVisibleService } from "./scrollVisibleService";
import { Events } from "../eventKeys";

export interface FakeHorizontalScrollView {
    setHeight(height: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
}

export class FakeHorizontalScrollController extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private view: FakeHorizontalScrollView;

    constructor(view: FakeHorizontalScrollView) {
        super();
        this.view = view;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
    }

    private onScrollVisibilityChanged(): void {

        const visible = this.scrollVisibleService.isHorizontalScrollShowing();

        const isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        const scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const scrollContainerSize = !isSuppressHorizontalScroll ? scrollbarWidth : 0;
        const addIEPadding = isBrowserIE() && visible;

        // this.centerContainer.getViewport().style.height = `calc(100% + ${scrollbarWidth}px)`;

        this.view.setHeight(scrollContainerSize);
        // we have to add an extra pixel to the scroller viewport on IE because
        // if the container has the same size as the scrollbar, the scroll button won't work
        this.view.setViewportHeight(scrollContainerSize + (addIEPadding ? 1 : 0));
        this.view.setContainerHeight(scrollContainerSize);
    }

}
