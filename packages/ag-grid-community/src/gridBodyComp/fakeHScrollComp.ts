import { RefPlaceholder, _getScrollLeft, _isVisible, _setFixedHeight, _setFixedWidth, _setScrollLeft } from 'ag-stack';

import type { VisibleColsService } from '../columns/visibleColsService';
import type { BeanCollection } from '../context/context';
import type { ElementParams } from '../utils/element';
import type { ComponentSelector } from '../widgets/component';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';
import type { ScrollVisibleService } from './scrollVisibleService';

const FakeHScrollElement: ElementParams = {
    tag: 'div',
    cls: 'ag-body-horizontal-scroll',
    attrs: { 'aria-hidden': 'true' },
    children: [
        {
            tag: 'div',
            ref: 'eViewport',
            cls: 'ag-body-horizontal-scroll-viewport',
            children: [{ tag: 'div', ref: 'eContainer', cls: 'ag-body-horizontal-scroll-container' }],
        },
        { tag: 'div', ref: 'eEndSpacer', cls: 'ag-body-horizontal-scroll-end-spacer' },
    ],
};
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FakeHScrollComp extends AbstractFakeScrollComp {
    private visibleCols: VisibleColsService;
    private scrollVisibleSvc: ScrollVisibleService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleCols = beans.visibleCols;
        this.scrollVisibleSvc = beans.scrollVisibleSvc;
    }

    private enableRtl: boolean;
    private readonly eEndSpacer: HTMLElement = RefPlaceholder;

    constructor() {
        super(FakeHScrollElement, 'horizontal');
    }

    public override postConstruct(): void {
        super.postConstruct();

        const widthListener = this.setContainerWidth.bind(this);

        this.addManagedEventListeners({
            displayedColumnsChanged: widthListener,
            displayedColumnsWidthChanged: widthListener,
            leftPinnedWidthChanged: widthListener,
            rightPinnedWidthChanged: widthListener,
            pinnedRowDataChanged: this.refreshCompBottom.bind(this),
        });

        this.addManagedPropertyListener('domLayout', widthListener);

        this.beans.ctrlsSvc.register('fakeHScrollComp', this);
        this.setContainerWidth();

        this.addManagedPropertyListeners(['suppressHorizontalScroll'], this.onScrollVisibilityChanged.bind(this));
    }

    override destroy(): void {
        window.clearTimeout(this.setScrollVisibleDebounce);
        super.destroy();
    }

    protected override initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }

        this.enableRtl = this.gos.get('enableRtl');
        super.initialiseInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            this.refreshCompBottom();
        }
    }

    private refreshCompBottom(): void {
        if (!this.invisibleScrollbar) {
            return;
        }
        const bottomPinnedHeight = this.beans.pinnedRowModel?.getPinnedBottomTotalHeight() ?? 0;

        this.getGui().style.bottom = `${bottomPinnedHeight}px`;
    }

    private setContainerWidth(): void {
        const visibleCols = this.visibleCols;
        const width =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth();
        this.eContainer.style.width = `${Math.max(width, 1)}px`;
    }

    private setScrollVisibleDebounce = 0;

    protected setScrollVisible(): void {
        this.enableRtl = this.gos.get('enableRtl');
        const hScrollShowing = this.scrollVisibleSvc.horizontalScrollShowing;
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gos.get('suppressHorizontalScroll');
        const scrollbarWidth = hScrollShowing ? this.scrollVisibleSvc.getScrollbarWidth() || 0 : 0;
        const adjustedScrollbarWidth = scrollbarWidth === 0 && invisibleScrollbar ? 16 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;

        // Avoid scrollbars flickering on as we resize the grid. Before showing
        // a scrollbar, give a little time for the grid to resize, after which a
        // scrollbar may no longer be required
        const apply = () => {
            this.setScrollVisibleDebounce = 0;
            this.toggleCss('ag-scrollbar-invisible', invisibleScrollbar);
            _setFixedHeight(this.getGui(), scrollContainerSize);
            _setFixedHeight(this.eViewport, scrollContainerSize);
            _setFixedHeight(this.eContainer, scrollContainerSize);
            _setFixedHeight(this.eEndSpacer, scrollContainerSize);
            const verticalScrollbarWidth = this.getVerticalSpacerWidth();
            _setFixedWidth(this.eEndSpacer, verticalScrollbarWidth);
            this.eEndSpacer.style.display = verticalScrollbarWidth > 0 ? '' : 'none';
            this.eViewport.style.width =
                verticalScrollbarWidth > 0 ? `calc(100% - ${verticalScrollbarWidth}px)` : '100%';

            if (!scrollContainerSize) {
                // the container needs a min-height of 1px to be
                // able to sync scroll position while hidden
                this.eContainer.style.setProperty('min-height', '1px');
            }
            this.setVisible(hScrollShowing, { skipAriaHidden: true });
        };
        window.clearTimeout(this.setScrollVisibleDebounce);
        if (!hScrollShowing) {
            apply();
        } else {
            this.setScrollVisibleDebounce = window.setTimeout(apply, 100);
        }
    }

    private getVerticalSpacerWidth(): number {
        const gridBodyCtrl = this.beans.ctrlsSvc.getGridBodyCtrl();
        if (gridBodyCtrl) {
            return gridBodyCtrl.getVerticalScrollbarWidth();
        }

        const scrollVisibleSvc = this.scrollVisibleSvc;
        if (!scrollVisibleSvc.verticalScrollShowing) {
            return 0;
        }

        const scrollbarWidth = scrollVisibleSvc.getScrollbarWidth() || 0;
        if (scrollbarWidth > 0) {
            return scrollbarWidth;
        }
        return this.invisibleScrollbar ? 16 : 0;
    }

    public getScrollPosition(): number {
        return _getScrollLeft(this.eViewport, this.enableRtl);
    }

    public setScrollPosition(value: number): void {
        if (!_isVisible(this.eViewport)) {
            this.attemptSettingScrollPosition(value);
        }
        _setScrollLeft(this.eViewport, value, this.enableRtl);
    }
}

export const FakeHScrollSelector: ComponentSelector = {
    selector: 'AG-FAKE-HORIZONTAL-SCROLL',
    component: FakeHScrollComp,
};
