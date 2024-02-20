import { BeanStub } from "../context/beanStub";
import { CtrlsService } from "../ctrlsService";
import { IRowNode, VerticalScrollPosition } from "../interfaces/iRowNode";
export declare class GridBodyScrollFeature extends BeanStub {
    ctrlsService: CtrlsService;
    private animationFrameService;
    private paginationProxy;
    private rowModel;
    private heightScaler;
    private rowRenderer;
    private columnModel;
    private enableRtl;
    private lastScrollSource;
    private eBodyViewport;
    private scrollLeft;
    private nextScrollTop;
    private scrollTop;
    private lastOffsetHeight;
    private lastScrollTop;
    private scrollTimer;
    private readonly resetLastHScrollDebounced;
    private readonly resetLastVScrollDebounced;
    private centerRowContainerCtrl;
    constructor(eBodyViewport: HTMLElement);
    private postConstruct;
    private addScrollListener;
    private onDisplayedColumnsWidthChanged;
    horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft?: number): void;
    private isControllingScroll;
    private onFakeHScroll;
    private onHScroll;
    private onHScrollCommon;
    private onFakeVScroll;
    private onVScroll;
    private onVScrollCommon;
    private doHorizontalScroll;
    private fireScrollEvent;
    private shouldBlockScrollUpdate;
    private shouldBlockVerticalScroll;
    private shouldBlockHorizontalScroll;
    private redrawRowsAfterScroll;
    checkScrollLeft(): void;
    scrollGridIfNeeded(): boolean;
    setHorizontalScrollPosition(hScrollPosition: number, fromAlignedGridsService?: boolean): void;
    setVerticalScrollPosition(vScrollPosition: number): void;
    getVScrollPosition(): VerticalScrollPosition;
    /** Get an approximate scroll position that returns the last real value read.
     * This is useful for avoiding repeated DOM reads that force the browser to recalculate styles.
     * This can have big performance improvements but may not be 100% accurate so only use if this is acceptable.
     */
    getApproximateVScollPosition(): VerticalScrollPosition;
    getHScrollPosition(): {
        left: number;
        right: number;
    };
    isHorizontalScrollShowing(): boolean;
    scrollHorizontally(pixels: number): number;
    scrollToTop(): void;
    ensureNodeVisible<TData = any>(comparator: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean), position?: 'top' | 'bottom' | 'middle' | null): void;
    ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null): void;
    ensureColumnVisible(key: any, position?: 'auto' | 'start' | 'middle' | 'end'): void;
    setScrollPosition(top: number, left: number): void;
    private getPositionedHorizontalScroll;
    private isColumnOutsideViewport;
    private getColumnBounds;
    private getViewportBounds;
}
