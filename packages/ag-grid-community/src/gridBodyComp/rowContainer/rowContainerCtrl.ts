import { _getInnerWidth, _isInDOM, _observeResize } from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import type { StickyTopOffsetChangedEvent } from '../../events';
import { _isDomLayout } from '../../gridOptionsUtils';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { RowRenderer } from '../../rendering/rowRenderer';
import type { SpannedRowRenderer } from '../../rendering/spanning/spannedRowRenderer';
import { CenterWidthFeature } from '../centerWidthFeature';
import { ViewportSizeFeature } from '../viewportSizeFeature';
import { RowContainerEventsFeature } from './rowContainerEventsFeature';
import { SetHeightFeature } from './setHeightFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerName = 'scrolling' | 'pinnedTop' | 'pinnedBottom' | 'stickyTop' | 'stickyBottom';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerType = 'center';

type GetRowCtrls = (renderer: RowRenderer) => RowCtrl[];
type GetSpannedRowCtrls = (renderer: SpannedRowRenderer) => RowCtrl[];
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type RowContainerOptions = {
    type: RowContainerType;
    name: string;
    getRowCtrls: GetRowCtrls;
    getSpannedRowCtrls?: GetSpannedRowCtrls;
};

const getTopRowCtrls: GetRowCtrls = (r) => r.topRowCtrls;
const getBottomRowCtrls: GetRowCtrls = (r) => r.bottomRowCtrls;
const getCentreRowCtrls: GetRowCtrls = (r) => r.allRowCtrls;
const getStickyTopRowCtrls: GetRowCtrls = (r) => r.getStickyTopRowCtrls();
const getStickyBottomRowCtrls: GetRowCtrls = (r) => r.getStickyBottomRowCtrls();

const getSpannedTopRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('top');
const getSpannedCenterRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('center');
const getSpannedBottomRowCtrls: GetSpannedRowCtrls = (r) => r.getCtrls('bottom');

const ContainerCssClasses: Record<RowContainerName, RowContainerOptions> = {
    scrolling: {
        type: 'center',
        name: 'grid-scrolling',
        getRowCtrls: getCentreRowCtrls,
        getSpannedRowCtrls: getSpannedCenterRowCtrls,
    },

    pinnedTop: {
        type: 'center',
        name: 'grid-pinned-top-rows',
        getRowCtrls: getTopRowCtrls,
        getSpannedRowCtrls: getSpannedTopRowCtrls,
    },

    pinnedBottom: {
        type: 'center',
        name: 'grid-pinned-bottom-rows',
        getRowCtrls: getBottomRowCtrls,
        getSpannedRowCtrls: getSpannedBottomRowCtrls,
    },

    stickyTop: {
        type: 'center',
        name: 'grid-sticky-top-rows',
        getRowCtrls: getStickyTopRowCtrls,
    },

    stickyBottom: {
        type: 'center',
        name: 'grid-sticky-bottom-rows',
        getRowCtrls: getStickyBottomRowCtrls,
    },
};
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

const middleContainer: RowContainerName = 'scrolling';

// sticky section must show rows in set order
const stickyContainers: RowContainerName[] = ['stickyTop', 'stickyBottom'];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowContainerComp {
    setRowCtrls(params: { rowCtrls: RowCtrl[]; useFlushSync?: boolean }): void;
    setSpannedRowCtrls(rowCtrls: RowCtrl[], useFlushSync: boolean): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
    setOffsetTop(offset: string): void;
    setHidden(hidden: boolean): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowContainerCtrl extends BeanStub {
    private readonly options: RowContainerOptions;

    private comp: IRowContainerComp;
    public eContainer: HTMLElement;
    public eViewport: HTMLElement;

    public viewportSizeFeature: ViewportSizeFeature | undefined; // only center has this
    // Maintaining a constant reference enables optimization in React.
    private readonly EMPTY_CTRLS = [];

    constructor(private readonly name: RowContainerName) {
        super();
        this.options = _getRowContainerOptions(name);
    }

    public postConstruct(): void {
        if (this.isScrollingCenterContainer()) {
            this.viewportSizeFeature = this.createManagedBean(new ViewportSizeFeature(this));
            this.addManagedEventListeners({
                stickyTopOffsetChanged: this.onStickyTopOffsetChanged.bind(this),
            });
        }
    }

    private onStickyTopOffsetChanged(event: StickyTopOffsetChangedEvent): void {
        this.comp.setOffsetTop(`${event.offset}px`);
    }

    private registerWithCtrlsService(): void {
        this.beans.ctrlsSvc.register(this.name as any, this);
    }

    private isScrollingCenterContainer(): boolean {
        return this.name === 'scrolling';
    }

    private isContainer(name: RowContainerName | RowContainerName[]): boolean {
        if (Array.isArray(name)) {
            return name.includes(this.name);
        }
        return this.name === name;
    }

    public setComp(
        view: IRowContainerComp,
        eContainer: HTMLElement,
        eSpannedContainer: HTMLElement | undefined,
        eViewport: HTMLElement
    ): void {
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;

        const { rangeSvc } = this.beans;

        if (this.isScrollingCenterContainer()) {
            this.createManagedBean(new RowContainerEventsFeature(this.eViewport ?? this.eContainer));
            this.addPreventScrollWhileDragging();
            if (rangeSvc) {
                this.createManagedBean(rangeSvc.createDragListenerFeature(this.eViewport ?? this.eContainer));
            }
        }
        this.listenOnDomOrder();

        if (this.isContainer(middleContainer)) {
            this.createManagedBean(new SetHeightFeature(this.eContainer));
        }

        const updateContainerWidth = this.updateContainerWidth.bind(this);

        this.createManagedBean(new CenterWidthFeature(updateContainerWidth));
        this.registerViewportResizeListener(updateContainerWidth);
        this.addListeners();
        this.registerWithCtrlsService();
    }

    private updateContainerWidth(): void {
        const { visibleCols, ctrlsSvc } = this.beans;
        const gridBodyCtrl = ctrlsSvc.getGridBodyCtrl();
        const fallbackContentWidth =
            visibleCols.bodyWidth +
            visibleCols.getLeftStickyColumnContainerWidth() +
            visibleCols.getRightStickyColumnContainerWidth();
        const contentWidth = gridBodyCtrl?.getHorizontalContentWidth() ?? fallbackContentWidth;
        const viewportWidth = gridBodyCtrl?.getHorizontalViewportWidth() ?? _getInnerWidth(this.eViewport);
        const width = Math.max(contentWidth, viewportWidth, 1);
        this.comp.setContainerWidth(`${width}px`);

        // Set viewport width (without scrollbar) as a CSS variable so full-width
        // row anchors can size themselves without per-row JS listeners.
        this.eContainer.style.setProperty(
            '--ag-pinned-row-border-width',
            `${this.beans.environment.getPinnedRowBorderWidth()}px`
        );
    }

    private addListeners(): void {
        const { spannedRowRenderer, gos } = this.beans;
        const onDisplayedColumnsChanged = this.onDisplayedColumnsChanged.bind(this);
        const updateContainerWidth = this.updateContainerWidth.bind(this);

        this.addManagedEventListeners({
            scrollVisibilityChanged: updateContainerWidth,
            scrollbarWidthChanged: updateContainerWidth,
            gridSizeChanged: updateContainerWidth,
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
        if (this.isContainer(stickyContainers)) {
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
        if (this.isScrollingCenterContainer()) {
            this.beans.ctrlsSvc.getGridBodyCtrl()?.updateColumnViewport();
        }
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

    public registerViewportResizeListener(listener: () => void) {
        const unsubscribeFromResize = _observeResize(this.beans, this.eViewport, listener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public isViewportInTheDOMTree(): boolean {
        return _isInDOM(this.eViewport);
    }

    public setContainerHeight(height: number): void {
        this.eContainer.style.height = height > 0 ? `${height}px` : '';
    }

    public setContainerTop(top: number): void {
        this.eContainer.style.top = `${top}px`;
    }

    private onDisplayedRowsChanged(afterScroll: boolean = false): void {
        const rowCtrls = this.options.getRowCtrls(this.beans.rowRenderer);
        const isEmpty = rowCtrls.length === 0;
        this.comp.setRowCtrls({
            rowCtrls: isEmpty ? this.EMPTY_CTRLS : rowCtrls,
            useFlushSync: afterScroll,
        });

        this.comp.setHidden(isEmpty);
    }
}
