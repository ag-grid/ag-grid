import { _isVisible, _requestAnimationFrame, _setFixedWidth } from '../agStack/utils/dom';
import type { CtrlsService } from '../ctrlsService';
import type { ElementParams } from '../utils/element';
import type { ComponentSelector } from '../widgets/component';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';

const FakeVScrollElement: ElementParams = {
    tag: 'div',
    cls: 'ag-body-vertical-scroll',
    attrs: { 'aria-hidden': 'true' },
    children: [
        {
            tag: 'div',
            ref: 'eViewport',
            cls: 'ag-body-vertical-scroll-viewport',
            children: [{ tag: 'div', ref: 'eContainer', cls: 'ag-body-vertical-scroll-container' }],
        },
    ],
};
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class FakeVScrollComp extends AbstractFakeScrollComp {
    private enableRtl: boolean;

    constructor() {
        super(FakeVScrollElement, 'vertical');
    }

    public override postConstruct(): void {
        super.postConstruct();

        this.enableRtl = this.gos.get('enableRtl');
        const { ctrlsSvc } = this.beans;
        ctrlsSvc.register('fakeVScrollComp', this);

        this.addManagedEventListeners({
            rowContainerHeightChanged: this.onRowContainerHeightChanged.bind(this, ctrlsSvc),
            headerHeightChanged: this.onScrollVisibilityChanged.bind(this),
            pinnedRowsChanged: this.queueContainerHeightSync.bind(this),
            pinnedHeightChanged: this.queueContainerHeightSync.bind(this),
            pinnedRowDataChanged: this.queueContainerHeightSync.bind(this),
        });
        this.addManagedPropertyListeners(
            ['suppressHorizontalScroll', 'enableRtl'],
            this.onScrollVisibilityChanged.bind(this)
        );
    }

    protected setScrollVisible(): void {
        const { scrollVisibleSvc } = this.beans;
        this.enableRtl = this.gos.get('enableRtl');
        const vScrollShowing = scrollVisibleSvc.verticalScrollShowing;
        const invisibleScrollbar = this.invisibleScrollbar;
        const gridBodyCtrl = this.beans.ctrlsSvc.getGridBodyCtrl();

        const fallbackScrollbarWidth = scrollVisibleSvc.getScrollbarWidth() || 0;
        const scrollbarWidth = vScrollShowing ? gridBodyCtrl?.getVerticalScrollbarWidth() ?? fallbackScrollbarWidth : 0;
        const adjustedScrollbarWidth = scrollbarWidth === 0 && invisibleScrollbar ? 16 : scrollbarWidth;
        const horizontalScrollHeight = gridBodyCtrl?.getHorizontalScrollbarHeight() ?? 0;
        const headerRowsOffset = gridBodyCtrl?.getHeaderRowsOffset() ?? 0;

        const eGui = this.getGui();

        eGui.style.top = `${headerRowsOffset}px`;
        eGui.style.bottom = `${horizontalScrollHeight}px`;

        this.toggleCss('ag-scrollbar-invisible', invisibleScrollbar);
        _setFixedWidth(eGui, adjustedScrollbarWidth);
        _setFixedWidth(this.eViewport, adjustedScrollbarWidth);
        _setFixedWidth(this.eContainer, adjustedScrollbarWidth);
        this.setDisplayed(vScrollShowing, { skipAriaHidden: true });
        this.queueContainerHeightSync();
    }

    private onRowContainerHeightChanged(ctrlsSvc: CtrlsService): void {
        const gridBodyCtrl = ctrlsSvc.getGridBodyCtrl();
        if (!gridBodyCtrl) {
            return;
        }
        const gridBodyViewportEl = gridBodyCtrl.eGridViewport;

        this.syncContainerHeight();

        const eViewportScrollTop = this.getScrollPosition();
        const gridBodyViewportScrollTop = gridBodyViewportEl.scrollTop;

        if (eViewportScrollTop != gridBodyViewportScrollTop) {
            this.setScrollPosition(gridBodyViewportScrollTop, true);
        }
    }

    private queueContainerHeightSync(): void {
        _requestAnimationFrame(this.beans, () => this.syncContainerHeight());
    }

    private syncContainerHeight(): void {
        const gridBodyCtrl = this.beans.ctrlsSvc.getGridBodyCtrl();
        if (!gridBodyCtrl) {
            return;
        }

        const { eGridViewport } = gridBodyCtrl;
        const { clientHeight: gridHeight, scrollHeight: gridScrollHeight } = eGridViewport;
        const fakeVScrollHeight = this.eViewport.clientHeight;
        const diff = gridHeight - fakeVScrollHeight;
        this.eContainer.style.height = `${Math.max(1, gridScrollHeight - diff)}px`;
    }

    public getScrollPosition(): number {
        return this.eViewport.scrollTop;
    }

    public setScrollPosition(value: number, force?: boolean): void {
        if (!force && !_isVisible(this.eViewport)) {
            this.attemptSettingScrollPosition(value);
        }
        this.eViewport.scrollTop = value;
    }
}

export const FakeVScrollSelector: ComponentSelector = {
    selector: 'AG-FAKE-VERTICAL-SCROLL',
    component: FakeVScrollComp,
};
