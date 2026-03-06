import { _getInnerWidth, _getScrollLeft, _isInDOM, _observeResize, _setScrollLeft } from '../../agStack/utils/dom';
import { BeanStub } from '../../context/beanStub';
import type { StickyTopOffsetChangedEvent } from '../../events';
import { _isDomLayout } from '../../gridOptionsUtils';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { RowRenderer } from '../../rendering/rowRenderer';
import type { SpannedRowRenderer } from '../../rendering/spanning/spannedRowRenderer';
import { CenterWidthFeature } from '../centerWidthFeature';
import type { ScrollPartner } from '../gridBodyScrollFeature';
import { _shouldShowHorizontalScroll } from '../scrollbarVisibilityHelper';
import { ViewportSizeFeature } from '../viewportSizeFeature';
import { RowContainerEventsFeature } from './rowContainerEventsFeature';
import { SetHeightFeature } from './setHeightFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerName =
    | 'scrollingCenter'
    | 'scrollingFullWidth'
    | 'pinnedTopCenter'
    | 'pinnedTopFullWidth'
    | 'pinnedBottomCenter'
    | 'pinnedBottomFullWidth';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerType = 'center' | 'fullWidth';

type GetRowCtrls = (renderer: RowRenderer) => RowCtrl[];
type GetSpannedRowCtrls = (renderer: SpannedRowRenderer) => RowCtrl[];
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerOptions = {
    type: RowContainerType;
    name: string;
    fullWidth?: boolean;
    getRowCtrls: GetRowCtrls;
    getSpannedRowCtrls?: GetSpannedRowCtrls;
};

const getTopRowCtrls: GetRowCtrls = (r) => r.topRowCtrls;
const getBottomRowCtrls: GetRowCtrls = (r) => r.bottomRowCtrls;
const getCentreRowCtrls: GetRowCtrls = (r) => r.allRowCtrls;
const getPinnedAndStickyTopRowCtrls: GetRowCtrls = (r) => [...getTopRowCtrls(r), ...r.getStickyTopRowCtrls()];
const getStickyAndPinnedBottomRowCtrls: GetRowCtrls = (r) => [...r.getStickyBottomRowCtrls(), ...getBottomRowCtrls(r)];

const getSpannedTopRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('top');
const getSpannedCenterRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('center');
const getSpannedBottomRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('bottom');

const ContainerCssClasses: Record<RowContainerName, RowContainerOptions> = {
    scrollingCenter: {
        type: 'center',
        name: 'grid-scrolling',
        getRowCtrls: getCentreRowCtrls,
        getSpannedRowCtrls: getSpannedCenterRowCtrls,
    },
    scrollingFullWidth: {
        type: 'fullWidth',
        name: 'full-width',
        fullWidth: true,
        getRowCtrls: getCentreRowCtrls,
    },

    pinnedTopCenter: {
        type: 'center',
        name: 'grid-pinned-top-rows',
        getRowCtrls: getPinnedAndStickyTopRowCtrls,
        getSpannedRowCtrls: getSpannedTopRowCtrls,
    },
    pinnedTopFullWidth: {
        type: 'fullWidth',
        name: 'grid-pinned-top-rows-full-width',
        fullWidth: true,
        getRowCtrls: getPinnedAndStickyTopRowCtrls,
    },

    pinnedBottomCenter: {
        type: 'center',
        name: 'grid-pinned-bottom-rows',
        getRowCtrls: getStickyAndPinnedBottomRowCtrls,
        getSpannedRowCtrls: getSpannedBottomRowCtrls,
    },
    pinnedBottomFullWidth: {
        type: 'fullWidth',
        name: 'grid-pinned-bottom-rows-full-width',
        fullWidth: true,
        getRowCtrls: getStickyAndPinnedBottomRowCtrls,
    },
};
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowViewportClass(name: RowContainerName): `ag-${string}-viewport` {
    const options = _getRowContainerOptions(name);
    return `ag-${options.name}-viewport`;
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowContainerClass(name: RowContainerName): `ag-${string}` {
    const options = _getRowContainerOptions(name);
    return `ag-${options.name}-container`;
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowSpanContainerClass(name: RowContainerName): `ag-${string}-spanned-cells-container` {
    const options = _getRowContainerOptions(name);
    return `ag-${options.name}-spanned-cells-container`;
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getRowContainerOptions(name: RowContainerName): RowContainerOptions {
    return ContainerCssClasses[name];
}

const allMiddle: RowContainerName[] = ['scrollingCenter', 'scrollingFullWidth'];
const allCenter: RowContainerName[] = ['scrollingCenter', 'pinnedTopCenter', 'pinnedBottomCenter'];

// sticky section must show rows in set order
const allStickyContainers: RowContainerName[] = [
    'pinnedTopCenter',
    'pinnedTopFullWidth',
    'pinnedBottomCenter',
    'pinnedBottomFullWidth',
];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowContainerComp {
    setViewportHeight(height: string): void;
    setHorizontalScroll(offset: number): void;
    setRowCtrls(params: { rowCtrls: RowCtrl[]; useFlushSync?: boolean }): void;
    setSpannedRowCtrls(rowCtrls: RowCtrl[], useFlushSync: boolean): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
    setOffsetTop(offset: string): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowContainerCtrl extends BeanStub implements ScrollPartner {
    private readonly options: RowContainerOptions;

    private comp: IRowContainerComp;
    public eContainer: HTMLElement;
    private eSpannedContainer: HTMLElement | undefined;
    public eViewport: HTMLElement;
    private enableRtl: boolean;

    public viewportSizeFeature: ViewportSizeFeature | undefined; // only center has this
    // Maintaining a constant reference enables optimization in React.
    private readonly EMPTY_CTRLS = [];

    constructor(private readonly name: RowContainerName) {
        super();
        this.options = _getRowContainerOptions(name);
    }

    public postConstruct(): void {
        this.enableRtl = this.gos.get('enableRtl');

        this.forContainers(['scrollingCenter'], () => {
            this.viewportSizeFeature = this.createManagedBean(new ViewportSizeFeature(this));
            this.addManagedEventListeners({
                stickyTopOffsetChanged: this.onStickyTopOffsetChanged.bind(this),
            });
        });
    }

    private onStickyTopOffsetChanged(event: StickyTopOffsetChangedEvent): void {
        this.comp.setOffsetTop(`${event.offset}px`);
    }

    private registerWithCtrlsService(): void {
        // we don't register full width containers
        if (this.options.fullWidth) {
            return;
        }
        this.beans.ctrlsSvc.register(this.name as any, this);
    }

    private forContainers(names: RowContainerName[], callback: () => void): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    public setComp(
        view: IRowContainerComp,
        eContainer: HTMLElement,
        eSpannedContainer: HTMLElement | undefined,
        eViewport: HTMLElement
    ): void {
        this.comp = view;
        this.eContainer = eContainer;
        this.eSpannedContainer = eSpannedContainer;
        this.eViewport = eViewport;

        this.forContainers(['scrollingCenter'], () =>
            this.createManagedBean(new RowContainerEventsFeature(this.eViewport ?? this.eContainer))
        );
        this.forContainers(['scrollingCenter'], () => this.addPreventScrollWhileDragging());
        this.listenOnDomOrder();

        const { rangeSvc } = this.beans;
        this.forContainers(allMiddle, () => this.createManagedBean(new SetHeightFeature(this.eContainer)));
        if (rangeSvc) {
            this.forContainers(['scrollingCenter'], () =>
                this.createManagedBean(rangeSvc.createDragListenerFeature(this.eViewport ?? this.eContainer))
            );
        }

        this.forContainers(allCenter, () =>
            this.createManagedBean(
                new CenterWidthFeature(() => {
                    const { visibleCols } = this.beans;
                    const contentWidth =
                        visibleCols.bodyWidth +
                        visibleCols.getLeftStickyColumnContainerWidth() +
                        visibleCols.getRightStickyColumnContainerWidth();
                    const viewportWidth = _getInnerWidth(this.eViewport);
                    const width = Math.max(contentWidth, viewportWidth);
                    this.comp.setContainerWidth(`${width}px`);
                })
            )
        );

        this.addListeners();
        this.registerWithCtrlsService();
    }

    public onScrollCallback(fn: () => void): void {
        this.addManagedElementListeners(this.eViewport, { scroll: fn });
    }

    private addListeners(): void {
        const { spannedRowRenderer, gos } = this.beans;
        const onDisplayedColumnsChanged = this.onDisplayedColumnsChanged.bind(this);
        this.addManagedEventListeners({
            displayedColumnsChanged: onDisplayedColumnsChanged,
            displayedColumnsWidthChanged: onDisplayedColumnsChanged,
            displayedRowsChanged: (params) => this.onDisplayedRowsChanged(params.afterScroll),
        });

        onDisplayedColumnsChanged();
        this.onDisplayedRowsChanged();

        if (spannedRowRenderer && this.options.getSpannedRowCtrls && gos.get('enableCellSpan')) {
            this.addManagedListeners(spannedRowRenderer, {
                spannedRowsUpdated: () => {
                    const spannedCtrls = this.options.getSpannedRowCtrls!(spannedRowRenderer);
                    if (!spannedCtrls) {
                        return;
                    }

                    this.comp.setSpannedRowCtrls(spannedCtrls, false);
                },
            });
        }
    }

    private listenOnDomOrder(): void {
        const isStickContainer = allStickyContainers.indexOf(this.name) >= 0;
        if (isStickContainer) {
            this.comp.setDomOrder(true);
            return;
        }

        const listener = () => {
            const isEnsureDomOrder = this.gos.get('ensureDomOrder');
            const isPrintLayout = _isDomLayout(this.gos, 'print');
            this.comp.setDomOrder(isEnsureDomOrder || isPrintLayout);
        };

        this.addManagedPropertyListener('domLayout', listener);
        listener();
    }

    public onDisplayedColumnsChanged(): void {
        this.forContainers(['scrollingCenter'], () => this.onHorizontalViewportChanged());
    }

    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    private addPreventScrollWhileDragging(): void {
        const { dragSvc } = this.beans;
        if (!dragSvc) {
            return;
        }
        const preventScroll = (e: TouchEvent) => {
            if (dragSvc.dragging) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const ePreventScroll = this.eViewport ?? this.eContainer;
        ePreventScroll.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(() => ePreventScroll.removeEventListener('touchmove', preventScroll));
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    public onHorizontalViewportChanged(afterScroll: boolean = false): void {
        const scrollWidth = this.getCenterWidth();
        const scrollPosition = this.getCenterViewportScrollLeft();

        this.beans.colViewport.setScrollPosition(scrollWidth, scrollPosition, afterScroll);
    }

    public hasHorizontalScrollGap(): boolean {
        return this.eContainer.clientWidth - this.eViewport.clientWidth < 0;
    }

    public hasVerticalScrollGap(): boolean {
        return this.eContainer.clientHeight - this.eViewport.clientHeight < 0;
    }

    public getCenterWidth(): number {
        const viewportWidth = _getInnerWidth(this.eViewport);
        if (this.name !== 'scrollingCenter') {
            return viewportWidth;
        }

        const { visibleCols } = this.beans;
        const pinnedWidth =
            visibleCols.getLeftStickyColumnContainerWidth() + visibleCols.getRightStickyColumnContainerWidth();
        return Math.max(0, viewportWidth - pinnedWidth - this.getVisibleVerticalScrollbarWidth());
    }

    public getCenterViewportScrollLeft(): number {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return _getScrollLeft(this.eViewport, this.enableRtl);
    }

    public registerViewportResizeListener(listener: () => void) {
        const unsubscribeFromResize = _observeResize(this.beans, this.eViewport, listener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public isViewportInTheDOMTree(): boolean {
        return _isInDOM(this.eViewport);
    }

    public getViewportScrollLeft(): number {
        return _getScrollLeft(this.eViewport, this.enableRtl);
    }

    public isHorizontalScrollShowing(): boolean {
        const { beans, gos, eViewport } = this;
        const isAlwaysShowHorizontalScroll = gos.get('alwaysShowHorizontalScroll');
        const { ctrlsSvc } = beans;
        const verticalScrollElement = ctrlsSvc.getGridBodyCtrl()?.eGridViewport;
        const oppositeAxisElement = verticalScrollElement === eViewport ? undefined : verticalScrollElement;
        const hScrollEl = ctrlsSvc.get('fakeHScrollComp')?.getGui();
        const vScrollEl = ctrlsSvc.get('fakeVScrollComp')?.getGui();

        return (
            isAlwaysShowHorizontalScroll ||
            _shouldShowHorizontalScroll(eViewport, oppositeAxisElement, undefined, hScrollEl, vScrollEl)
        );
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setHorizontalScroll(offset);
    }

    public getHScrollPosition(): { left: number; right: number } {
        const left = this.eViewport.scrollLeft;
        const res = {
            left,
            right: left + this.getCenterWidth(),
        };
        return res;
    }

    public setCenterViewportScrollLeft(value: number): void {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        _setScrollLeft(this.eViewport, value, this.enableRtl);
    }

    private getVisibleVerticalScrollbarWidth(): number {
        const { scrollVisibleSvc, ctrlsSvc } = this.beans;
        if (!scrollVisibleSvc.verticalScrollShowing) {
            return 0;
        }
        return ctrlsSvc.getGridBodyCtrl()?.getVerticalScrollbarWidth() ?? scrollVisibleSvc.getScrollbarWidth() ?? 0;
    }

    private onDisplayedRowsChanged(afterScroll: boolean = false): void {
        const rows = this.options.getRowCtrls(this.beans.rowRenderer);
        if (rows.length === 0) {
            this.comp.setRowCtrls({ rowCtrls: this.EMPTY_CTRLS });
            return;
        }

        const printLayout = _isDomLayout(this.gos, 'print');
        const embedFullWidthRows = this.gos.get('embedFullWidthRows');
        const embedFW = embedFullWidthRows || printLayout;

        // this list contains either all pinned top, center or pinned bottom rows
        // this filters out rows not for this container, eg if it's a full with row, but we are not full with container
        const rowsThisContainer = rows.filter((rowCtrl) => {
            // this just justifies if the ctrl is in the correct place, this will be fed with zombie rows by the
            // row renderer, so should not block them as they still need to animate -  the row renderer
            // will clean these up when they finish animating
            const fullWidthRow = rowCtrl.isFullWidth();

            const match = this.options.fullWidth ? !embedFW && fullWidthRow : embedFW || !fullWidthRow;

            return match;
        });

        this.comp.setRowCtrls({ rowCtrls: rowsThisContainer, useFlushSync: afterScroll });
    }
}
