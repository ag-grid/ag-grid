import { Autowired, Optional, PostConstruct } from '../context/context';
import { GridHeaderComp } from '../headerRendering/gridHeaderComp';
import { IRangeService } from '../interfaces/IRangeService';
import { ResizeObserverService } from '../misc/resizeObserverService';
import { OverlayWrapperComponent } from '../rendering/overlays/overlayWrapperComponent';
import { LayoutCssClasses } from '../styling/layoutFeature';
import { _setAriaColCount, _setAriaMultiSelectable, _setAriaRowCount } from '../utils/aria';
import { AgComponentSelector, Component, RefPlaceholder } from '../widgets/component';
import { FakeHScrollComp } from './fakeHScrollComp';
import { FakeVScrollComp } from './fakeVScrollComp';
import { CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl, IGridBodyComp, RowAnimationCssClasses } from './gridBodyCtrl';
import { RowContainerComp } from './rowContainer/rowContainerComp';
import { RowContainerName } from './rowContainer/rowContainerCtrl';

const GRID_BODY_TEMPLATE =
    /* html */
    `<div class="ag-root ag-unselectable" role="treegrid">
        <ag-header-root></ag-header-root>
        <div class="ag-floating-top" data-ref="eTop" role="presentation">
            <ag-row-container name="${RowContainerName.TOP_LEFT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.TOP_CENTER}"></ag-row-container>
            <ag-row-container name="${RowContainerName.TOP_RIGHT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-body" data-ref="eBody" role="presentation">
            <div class="ag-body-viewport" data-ref="eBodyViewport" role="presentation">
                <ag-row-container name="${RowContainerName.LEFT}"></ag-row-container>
                <ag-row-container name="${RowContainerName.CENTER}"></ag-row-container>
                <ag-row-container name="${RowContainerName.RIGHT}"></ag-row-container>
                <ag-row-container name="${RowContainerName.FULL_WIDTH}"></ag-row-container>
            </div>
            <ag-fake-vertical-scroll></ag-fake-vertical-scroll>
        </div>
        <div class="ag-sticky-top" data-ref="eStickyTop" role="presentation">
            <ag-row-container name="${RowContainerName.STICKY_TOP_LEFT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_TOP_CENTER}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_TOP_RIGHT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-sticky-bottom" data-ref="eStickyBottom" role="presentation">
            <ag-row-container name="${RowContainerName.STICKY_BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.STICKY_BOTTOM_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-floating-bottom" data-ref="eBottom" role="presentation">
            <ag-row-container name="${RowContainerName.BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container name="${RowContainerName.BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container name="${RowContainerName.BOTTOM_FULL_WIDTH}"></ag-row-container>
        </div>
        <ag-fake-horizontal-scroll></ag-fake-horizontal-scroll>
        <ag-overlay-wrapper></ag-overlay-wrapper>
    </div>`;

export class GridBodyComp extends Component {
    static readonly selector: AgComponentSelector = 'AG-GRID-BODY';

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    @Optional('rangeService') private rangeService?: IRangeService;

    private readonly eBodyViewport: HTMLElement = RefPlaceholder;
    private readonly eStickyTop: HTMLElement = RefPlaceholder;
    private readonly eStickyBottom: HTMLElement = RefPlaceholder;
    private readonly eTop: HTMLElement = RefPlaceholder;
    private readonly eBottom: HTMLElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    private ctrl: GridBodyCtrl;

    constructor() {
        super(GRID_BODY_TEMPLATE, [
            OverlayWrapperComponent,
            FakeHScrollComp,
            FakeVScrollComp,
            GridHeaderComp,
            RowContainerComp,
        ]);
    }

    @PostConstruct
    private init() {
        const setHeight = (height: number, element: HTMLElement) => {
            const heightString = `${height}px`;
            element.style.minHeight = heightString;
            element.style.height = heightString;
        };

        const compProxy: IGridBodyComp = {
            setRowAnimationCssOnBodyViewport: (cssClass, animate) =>
                this.setRowAnimationCssOnBodyViewport(cssClass, animate),
            setColumnCount: (count) => _setAriaColCount(this.getGui(), count),
            setRowCount: (count) => _setAriaRowCount(this.getGui(), count),
            setTopHeight: (height) => setHeight(height, this.eTop),
            setBottomHeight: (height) => setHeight(height, this.eBottom),
            setTopDisplay: (display) => (this.eTop.style.display = display),
            setBottomDisplay: (display) => (this.eBottom.style.display = display),
            setStickyTopHeight: (height) => (this.eStickyTop.style.height = height),
            setStickyTopTop: (top) => (this.eStickyTop.style.top = top),
            setStickyTopWidth: (width) => (this.eStickyTop.style.width = width),
            setStickyBottomHeight: (height) => (this.eStickyBottom.style.height = height),
            setStickyBottomBottom: (bottom) => (this.eStickyBottom.style.bottom = bottom),
            setStickyBottomWidth: (width) => (this.eStickyBottom.style.width = width),
            setColumnMovingCss: (cssClass, flag) => this.addOrRemoveCssClass(cssClass, flag),
            updateLayoutClasses: (cssClass, params) => {
                const classLists = [this.eBodyViewport.classList, this.eBody.classList];

                classLists.forEach((classList) => {
                    classList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                    classList.toggle(LayoutCssClasses.NORMAL, params.normal);
                    classList.toggle(LayoutCssClasses.PRINT, params.print);
                });

                this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
                this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: (cssClass, on) =>
                this.eBodyViewport.classList.toggle(CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: (listener) => {
                const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setPinnedTopBottomOverflowY: (overflow) =>
                (this.eTop.style.overflowY = this.eBottom.style.overflowY = overflow),
            setCellSelectableCss: (cssClass: string, selectable: boolean) => {
                [this.eTop, this.eBodyViewport, this.eBottom].forEach((ct) =>
                    ct.classList.toggle(cssClass, selectable)
                );
            },
            setBodyViewportWidth: (width) => (this.eBodyViewport.style.width = width),
        };

        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(
            compProxy,
            this.getGui(),
            this.eBodyViewport,
            this.eTop,
            this.eBottom,
            this.eStickyTop,
            this.eStickyBottom
        );

        if (
            (this.rangeService && this.gos.get('enableRangeSelection')) ||
            this.gos.get('rowSelection') === 'multiple'
        ) {
            _setAriaMultiSelectable(this.getGui(), true);
        }
    }

    private setRowAnimationCssOnBodyViewport(cssClass: string, animateRows: boolean): void {
        const bodyViewportClassList = this.eBodyViewport.classList;
        bodyViewportClassList.toggle(RowAnimationCssClasses.ANIMATION_ON, animateRows);
        bodyViewportClassList.toggle(RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    }

    public getFloatingTopBottom(): HTMLElement[] {
        return [this.eTop, this.eBottom];
    }
}
