import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnApi } from '../columnController/columnApi';
import { RowRenderer } from '../rendering/rowRenderer';
import { Autowired, Optional, PostConstruct } from '../context/context';
import { BodyHeightChangedEvent, BodyScrollEvent, Events } from '../events';
import { DragListenerParams, DragService } from '../dragAndDrop/dragService';
import { IRangeController } from '../interfaces/iRangeController';
import { Constants } from '../constants/constants';
import { MouseEventService } from './mouseEventService';
import { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import { ScrollVisibleService, SetScrollsVisibleParams } from './scrollVisibleService';
import { PaginationProxy } from '../pagination/paginationProxy';
import { PaginationAutoPageSizeService } from '../pagination/paginationAutoPageSizeService';
import { AlignedGridsService } from '../alignedGridsService';
import { GridApi } from '../gridApi';
import { AnimationFrameService } from '../misc/animationFrameService';
import { NavigationService } from './navigationService';
import { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import { RowDragFeature } from './rowDragFeature';
import { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import { OverlayWrapperComponent } from '../rendering/overlays/overlayWrapperComponent';
import { Component } from '../widgets/component';
import { AutoHeightCalculator } from '../rendering/row/autoHeightCalculator';
import { ColumnAnimationService } from '../rendering/columnAnimationService';
import { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { Beans } from '../rendering/beans';
import { RefSelector } from '../widgets/componentAnnotations';
import { HeaderRootComp } from '../headerRendering/headerRootComp';
import { ResizeObserverService } from '../misc/resizeObserverService';
import { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import { ColumnController } from '../columnController/columnController';
import { HeaderNavigationService } from '../headerRendering/header/headerNavigationService';
import { setAriaColCount, setAriaMultiSelectable, setAriaRowCount } from '../utils/aria';
import { debounce } from '../utils/function';
import {
    addCssClass,
    addOrRemoveCssClass,
    getInnerHeight,
    getInnerWidth,
    getScrollLeft,
    isRtlNegativeScroll,
    isVerticalScrollShowing,
    removeCssClass,
    setScrollLeft
} from '../utils/dom';
import { getTabIndex, isIOSUserAgent } from '../utils/browser';
import { missing } from '../utils/generic';
import { getTarget } from '../utils/event';
import { PopupService } from "../widgets/popupService";
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { LayoutCssClasses, LayoutView, UpdateLayoutClassesParams } from "../styling/layoutFeature";
import {
    CSS_CLASS_FORCE_VERTICAL_SCROLL,
    GridBodyController,
    GridBodyView,
    RowAnimationCssClasses
} from "./gridBodyController";
import { FakeHorizontalScrollComp } from "./fakeHorizontalScrollComp";
import { RowContainerComp, RowContainerNames } from "./rowContainer/rowContainerComp";
import { IRowModel } from "../interfaces/iRowModel";
import { ControllersService } from "../controllersService";

const GRID_BODY_TEMPLATE = /* html */
    `<div class="ag-root ag-unselectable" role="grid" unselectable="on">
        <ag-header-root ref="headerRoot" unselectable="on"></ag-header-root>
        <div class="ag-floating-top" ref="eTop" role="presentation" unselectable="on">
            <ag-row-container ref="topLeftContainer" name="${RowContainerNames.TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="topCenterContainer" name="${RowContainerNames.TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="topRightContainer" name="${RowContainerNames.TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="topFullWidthContainer" name="${RowContainerNames.TOP_FULL_WITH}"></ag-row-container>
        </div>
        <div class="ag-body-viewport" ref="eBodyViewport" role="presentation">
            <ag-row-container ref="leftContainer" name="${RowContainerNames.LEFT}"></ag-row-container>
            <ag-row-container ref="centerContainer" name="${RowContainerNames.CENTER}"></ag-row-container>
            <ag-row-container ref="rightContainer" name="${RowContainerNames.RIGHT}"></ag-row-container>
            <ag-row-container ref="fullWidthContainer" name="${RowContainerNames.FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation" unselectable="on">
            <ag-row-container ref="bottomLeftContainer" name="${RowContainerNames.BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container ref="bottomCenterContainer" name="${RowContainerNames.BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container ref="bottomRightContainer" name="${RowContainerNames.BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container ref="bottomFullWidthContainer" name="${RowContainerNames.BOTTOM_FULL_WITH}"></ag-row-container> 
        </div>
        <ag-fake-horizontal-scroll ref="fakeHScroll"></ag-fake-horizontal-scroll>
        <ag-overlay-wrapper ref="overlayWrapper"></ag-overlay-wrapper>
    </div>`;

export class GridBodyComp extends Component implements LayoutView {

    @Autowired('alignedGridsService') private alignedGridsService: AlignedGridsService;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('navigationService') private navigationService: NavigationService;
    @Autowired('autoHeightCalculator') private autoHeightCalculator: AutoHeightCalculator;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('paginationAutoPageSizeService') private paginationAutoPageSizeService: PaginationAutoPageSizeService;
    @Autowired('beans') private beans: Beans;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('$scope') private $scope: any;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('rowContainerHeightService') private heightScaler: RowContainerHeightService;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('controllersService') public controllersService: ControllersService;

    @Optional('rangeController') private rangeController: IRangeController;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Optional('menuFactory') private menuFactory: IMenuFactory;

    @RefSelector('eBodyViewport') private eBodyViewport: HTMLElement;
    @RefSelector('eTop') private eTop: HTMLElement;
    @RefSelector('eBottom') private eBottom: HTMLElement;

    // fake horizontal scroll
    @RefSelector('fakeHScroll') private fakeHScroll: FakeHorizontalScrollComp;

    // Container Components
    @RefSelector('leftContainer') private leftContainer: RowContainerComp;
    @RefSelector('rightContainer') private rightContainer: RowContainerComp;
    @RefSelector('centerContainer') private centerContainer: RowContainerComp;
    @RefSelector('fullWidthContainer') private fullWidthContainer: RowContainerComp;
    @RefSelector('topLeftContainer') private topLeftContainer: RowContainerComp;
    @RefSelector('topRightContainer') private topRightContainer: RowContainerComp;
    @RefSelector('topCenterContainer') private topCenterContainer: RowContainerComp;
    @RefSelector('topFullWidthContainer') private topFullWidthContainer: RowContainerComp;
    @RefSelector('bottomLeftContainer') private bottomLeftContainer: RowContainerComp;
    @RefSelector('bottomCenterContainer') private bottomCenterContainer: RowContainerComp;
    @RefSelector('bottomRightContainer') private bottomRightContainer: RowContainerComp;
    @RefSelector('bottomFullWidthContainer') private bottomFullWidthContainer: RowContainerComp;

    @RefSelector('headerRoot') headerRootComp: HeaderRootComp;
    @RefSelector('overlayWrapper') private overlayWrapper: OverlayWrapperComponent;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private printLayout: boolean;

    private rowDragFeature: RowDragFeature;

    private controller: GridBodyController;

    constructor() {
        super(GRID_BODY_TEMPLATE);
    }

    @PostConstruct
    private init() {

        const view: GridBodyView = {
            updateLayoutClasses: this.updateLayoutClasses.bind(this),
            setProps: (params: { enableRtl: boolean; printLayout: boolean }) => {
                this.enableRtl = params.enableRtl;
                this.printLayout = params.printLayout;
            },
            setRowAnimationCssOnBodyViewport: this.setRowAnimationCssOnBodyViewport.bind(this),
            setAlwaysVerticalScrollClass: on =>
                addOrRemoveCssClass(this.eBodyViewport, CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setVerticalScrollPaddingVisible: show => {
                const scroller = show ? 'scroll' : 'hidden';
                this.eTop.style.overflowY = this.eBottom.style.overflowY = scroller;
            },
            setColumnCount: count => {
                setAriaColCount(this.getGui(), count)
            }
        };

        this.controller = this.createManagedBean(new GridBodyController());
        this.controller.setView(view, this.getGui(), this.eBodyViewport);

        this.addEventListeners();
        this.addDragListeners();

        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());

        this.setFloatingHeights();

        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();

        this.addRowDragListener();

        if (this.$scope) {
            this.addAngularApplyCheck();
        }

        this.gridApi.registerGridComp(this);
        this.headerRootComp.registerGridComp(this);
        this.headerNavigationService.registerGridComp(this);
        this.autoHeightCalculator.registerGridComp(this);
        this.columnAnimationService.registerGridComp(this);
        this.autoWidthCalculator.registerGridComp(this);
        this.beans.registerGridComp(this);
        this.rowRenderer.registerGridComp(this);
        this.animationFrameService.registerGridComp(this);
        if (this.contextMenuFactory) {
            this.contextMenuFactory.registerGridComp(this);
        }
        if (this.menuFactory) {
            this.menuFactory.registerGridComp(this);
        }

        if (this.rangeController || this.gridOptionsWrapper.isRowSelectionMulti()) {
            setAriaMultiSelectable(this.getGui(), true);
            if (this.rangeController) {
                this.rangeController.registerGridComp(this);
            }
        }

        [this.eTop, this.eBodyViewport, this.eBottom].forEach(element => {
            this.addManagedListener(element, 'focusin', () => {
                addCssClass(element, 'ag-has-focus');
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                if (!element.contains(e.relatedTarget as HTMLElement)) {
                    removeCssClass(element, 'ag-has-focus');
                }
            });
        });
    }

    private setRowAnimationCssOnBodyViewport(animateRows: boolean): void {
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_ON, animateRows);
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    }

    private onNewColumnsLoaded(): void {
        // we don't want each cellComp to register for events, as would increase rendering time.
        // so for newColumnsLoaded, we register once here (in rowRenderer) and then inform
        // each cell if / when event was fired.
        this.rowRenderer.forEachCellComp(cellComp => cellComp.onNewColumnsLoaded());
    }

    public updateLayoutClasses(params: UpdateLayoutClassesParams): void {
        addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.NORMAL, params.normal);
        addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.PRINT, params.print);

        this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
        this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
    }

    private onDomLayoutChanged(): void {
        const newPrintLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

        if (this.printLayout !== newPrintLayout) {
            this.printLayout = newPrintLayout;
        }
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.addOrRemoveCssClass('ag-column-moving', moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        [this.eTop, this.eBodyViewport, this.eBottom]
            .forEach(ct => addOrRemoveCssClass(ct, 'ag-selectable', selectable));
    }

    private addRowDragListener(): void {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport, this));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    }

    public getRowDragFeature(): RowDragFeature {
        return this.rowDragFeature;
    }

    private addStopEditingWhenGridLosesFocus(): void {
        if (!this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) { return; }

        const viewports = [this.eBodyViewport, this.eBottom, this.eTop];

        const focusOutListener = (event: FocusEvent): void => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget as HTMLElement;

            if (getTabIndex(elementWithFocus) === null) {
                this.rowRenderer.stopEditing();
                return;
            }

            let clickInsideGrid = viewports.some(viewport => viewport.contains(elementWithFocus));

            if (!clickInsideGrid) {
                const popupService = this.popupService;

                clickInsideGrid =
                    popupService.getActivePopups().some(popup => popup.contains(elementWithFocus)) ||
                    popupService.isElementWithinCustomPopup(elementWithFocus);
            }

            if (!clickInsideGrid) {
                this.rowRenderer.stopEditing();
            }
        };

        viewports.forEach((viewport) => this.addManagedListener(viewport, 'focusout', focusOutListener));
    }

    private addAngularApplyCheck(): void {
        // this makes sure if we queue up requests, we only execute oe
        let applyTriggered = false;

        const listener = () => {
            // only need to do one apply at a time
            if (applyTriggered) { return; }
            applyTriggered = true; // mark 'need apply' to true
            window.setTimeout(() => {
                applyTriggered = false;
                this.$scope.$apply();
            }, 0);
        };

        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.addGuiEventListener('dragstart', (event: MouseEvent) => {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
    }

    private addDragListeners(): void {
        if (
            !this.gridOptionsWrapper.isEnableRangeSelection() || // no range selection if no property
            missing(this.rangeController) // no range selection if not enterprise version
        ) {
            return;
        }

        const containers = [
            this.leftContainer.getContainerElement(),
            this.rightContainer.getContainerElement(),
            this.centerContainer.getContainerElement(),
            this.eTop,
            this.eBottom
        ];

        containers.forEach(container => {
            const params: DragListenerParams = {
                eElement: container,
                onDragStart: this.rangeController.onDragStart.bind(this.rangeController),
                onDragStop: this.rangeController.onDragStop.bind(this.rangeController),
                onDragging: this.rangeController.onDragging.bind(this.rangeController)
            };

            this.dragService.addDragSource(params);
            this.addDestroyFunc(() => this.dragService.removeDragSource(params));
        });
    }

    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    public scrollToTop(): void {
        this.eBodyViewport.scrollTop = 0;
    }

    public isVerticalScrollShowing(): boolean {
        const isAlwaysShowVerticalScroll = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        addOrRemoveCssClass(this.eBodyViewport, 'ag-force-vertical-scroll', isAlwaysShowVerticalScroll);
        return isAlwaysShowVerticalScroll || isVerticalScrollShowing(this.eBodyViewport);
    }

    public updateRowCount(): void {
        const headerCount = this.headerNavigationService.getHeaderRowCount();
        const modelType = this.paginationProxy.getType();
        let rowCount = -1;

        if (modelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            rowCount = 0;
            this.paginationProxy.forEachNode(node => {
                if (!node.group) { rowCount++; }
            });
        }

        const total = rowCount === -1 ? -1 : (headerCount + rowCount);

        setAriaRowCount(this.getGui(), total);
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(nextTimeout?: number) {
        const hasVerticalScroll = this.isVerticalScrollShowing();
        let diff = 0;

        if (hasVerticalScroll) {
            diff = this.gridOptionsWrapper.getScrollbarWidth();
        }

        const availableWidth = getInnerWidth(this.eBodyViewport) - diff;

        if (availableWidth > 0) {
            this.columnController.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
            return;
        }

        if (nextTimeout === undefined) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(100);
            }, 0);
        } else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(500);
            }, 100);
        } else if (nextTimeout === 500) {
            window.setTimeout(() => {
                this.sizeColumnsToFit(-1);
            }, 500);
        } else {
            console.warn('AG Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                'zero width, maybe the grid is not visible yet on the screen?');
        }
    }

    // used by autoWidthCalculator and autoHeightCalculator
    public getCenterContainer(): HTMLElement {
        return this.centerContainer.getContainerElement();
    }

    public getDropTargetBodyContainers(): HTMLElement[] {
        return [this.eBodyViewport, this.topCenterContainer.getViewportElement(), this.bottomCenterContainer.getViewportElement()];
    }

    public getDropTargetLeftContainers(): HTMLElement[] {
        return [this.leftContainer.getContainerElement(), this.bottomLeftContainer.getContainerElement(), this.topLeftContainer.getContainerElement()];
    }

    public getDropTargetRightContainers(): HTMLElement[] {
        return [this.rightContainer.getContainerElement(), this.bottomRightContainer.getContainerElement(), this.topRightContainer.getContainerElement()];
    }

    public getFloatingTopBottom(): HTMLElement[] {
        return [this.eTop, this.eBottom];
    }

    private setFloatingHeights(): void {
        const {pinnedRowModel, eTop, eBottom} = this;

        let floatingTopHeight = pinnedRowModel.getPinnedTopTotalHeight();

        if (floatingTopHeight) {
            // adding 1px for cell bottom border
            floatingTopHeight += 1;
        }

        let floatingBottomHeight = pinnedRowModel.getPinnedBottomTotalHeight();

        if (floatingBottomHeight) {
            // adding 1px for cell bottom border
            floatingBottomHeight += 1;
        }
        const floatingTopHeightString = `${floatingTopHeight}px`;
        const floatingBottomHeightString = `${floatingBottomHeight}px`;

        eTop.style.minHeight = floatingTopHeightString;
        eTop.style.height = floatingTopHeightString;
        eTop.style.display = floatingTopHeight ? 'inherit' : 'none';
        eBottom.style.minHeight = floatingBottomHeightString;
        eBottom.style.height = floatingBottomHeightString;
        eBottom.style.display = floatingBottomHeight ? 'inherit' : 'none';

        this.controller.checkBodyHeight();
    }

    private getCenterViewportScrollLeft(): number {
        return this.controllersService.getCenterRowContainerCon().getCenterViewportScrollLeft();
    }

    // + rangeController
    public addScrollEventListener(listener: () => void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    // + rangeController
    public removeScrollEventListener(listener: () => void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
