import { VisibleColsService } from '../columns/visibleColsService';
import { Autowired } from '../context/context';
import { Events } from '../eventKeys';
import { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import { _getScrollLeft, _isVisible, _setFixedHeight, _setFixedWidth, _setScrollLeft } from '../utils/dom';
import { AgComponentSelector } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';
import { CenterWidthFeature } from './centerWidthFeature';

export class FakeHScrollComp extends AbstractFakeScrollComp {
    static readonly selector: AgComponentSelector = 'AG-FAKE-HORIZONTAL-SCROLL';

    private static TEMPLATE /* html */ = `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;

    @RefSelector('eLeftSpacer') private eLeftSpacer: HTMLElement;
    @RefSelector('eRightSpacer') private eRightSpacer: HTMLElement;

    @Autowired('visibleColsService') private visibleColsService: VisibleColsService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;

    private enableRtl: boolean;

    constructor() {
        super(FakeHScrollComp.TEMPLATE, 'horizontal');
    }

    public override postConstruct(): void {
        super.postConstruct();

        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(
            this.eventService,
            Events.EVENT_PINNED_ROW_DATA_CHANGED,
            this.onPinnedRowDataChanged.bind(this)
        );
        this.addManagedPropertyListener('domLayout', spacerWidthsListener);

        this.ctrlsService.register('fakeHScrollComp', this);
        this.createManagedBean(new CenterWidthFeature((width) => (this.eContainer.style.width = `${width}px`)));

        this.addManagedPropertyListeners(['suppressHorizontalScroll'], this.onScrollVisibilityChanged.bind(this));
    }

    protected initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }

        this.enableRtl = this.gos.get('enableRtl');
        super.initialiseInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            this.refreshCompBottom();
        }
    }

    private onPinnedRowDataChanged(): void {
        this.refreshCompBottom();
    }

    private refreshCompBottom(): void {
        if (!this.invisibleScrollbar) {
            return;
        }
        const bottomPinnedHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();

        this.getGui().style.bottom = `${bottomPinnedHeight}px`;
    }

    protected onScrollVisibilityChanged(): void {
        super.onScrollVisibilityChanged();
        this.setFakeHScrollSpacerWidths();
    }

    private setFakeHScrollSpacerWidths(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();

        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        let rightSpacing = this.visibleColsService.getDisplayedColumnsRightWidth();
        const scrollOnRight = !this.enableRtl && vScrollShowing;
        const scrollbarWidth = this.gos.getScrollbarWidth();

        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        _setFixedWidth(this.eRightSpacer, rightSpacing);
        this.eRightSpacer.classList.toggle('ag-scroller-corner', rightSpacing <= scrollbarWidth);

        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        let leftSpacing = this.visibleColsService.getColsLeftWidth();
        const scrollOnLeft = this.enableRtl && vScrollShowing;

        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }

        _setFixedWidth(this.eLeftSpacer, leftSpacing);
        this.eLeftSpacer.classList.toggle('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    }

    protected setScrollVisible(): void {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gos.get('suppressHorizontalScroll');
        const scrollbarWidth = hScrollShowing ? this.gos.getScrollbarWidth() || 0 : 0;
        const adjustedScrollbarWidth = scrollbarWidth === 0 && invisibleScrollbar ? 16 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;

        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        _setFixedHeight(this.getGui(), scrollContainerSize);
        _setFixedHeight(this.eViewport, scrollContainerSize);
        _setFixedHeight(this.eContainer, scrollContainerSize);
        this.setDisplayed(hScrollShowing, { skipAriaHidden: true });
    }

    public getScrollPosition(): number {
        return _getScrollLeft(this.getViewport(), this.enableRtl);
    }

    public setScrollPosition(value: number): void {
        if (!_isVisible(this.getViewport())) {
            this.attemptSettingScrollPosition(value);
        }
        _setScrollLeft(this.getViewport(), value, this.enableRtl);
    }
}
