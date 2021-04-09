import { BeanStub } from "../context/beanStub";
import { Autowired, Optional, PostConstruct } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { ControllersService } from "../controllersService";
import { ColumnController } from "../columnController/columnController";
import { ScrollVisibleService } from "./scrollVisibleService";
import { getTarget } from "../utils/event";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { addOrRemoveCssClass, getInnerHeight, isVerticalScrollShowing } from "../utils/dom";
import { BodyHeightChangedEvent } from "../events";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { setAriaRowCount } from "../utils/aria";
import { HeaderNavigationService } from "../headerRendering/header/headerNavigationService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RowDragFeature } from "./rowDragFeature";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { RefSelector } from "../widgets/componentAnnotations";
import { getTabIndex } from "../utils/browser";
import { RowRenderer } from "../rendering/rowRenderer";
import { PopupService } from "../widgets/popupService";
import { missing } from "../utils/generic";
import { DragListenerParams } from "../dragAndDrop/dragService";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
export const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface GridBodyView extends LayoutView {
    setColumnMovingCss(selectable: boolean): void;
    setCellSelectableCss(selectable: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setProps(params: {enableRtl: boolean}): void;
    setRowAnimationCssOnBodyViewport(animate: boolean): void;
    setAlwaysVerticalScrollClass(on: boolean): void;
    setVerticalScrollPaddingVisible(visible: boolean): void;
    registerBodyViewportResizeListener(listener: (()=>void)): void;
}

export class GridBodyController extends BeanStub {

    @Autowired('rowContainerHeightService') private rowContainerHeightService: RowContainerHeightService;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') public popupService: PopupService;

    private view: GridBodyView;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;
    private eTop: HTMLElement;
    private eBottom: HTMLElement;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private printLayout: boolean;

    private bodyScrollFeature: GridBodyScrollFeature;
    private rowDragFeature: RowDragFeature;

    public getScrollFeature(): GridBodyScrollFeature {
        return this.bodyScrollFeature;
    }

    public getBodyViewportElement(): HTMLElement {
        return this.eBodyViewport;
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.onDomLayoutChanged();
    }

    public setView(view: GridBodyView, eGridBody: HTMLElement, eBodyViewport: HTMLElement,
                   eTop: HTMLElement, eBottom: HTMLElement): void {
        this.view = view;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;

        this.view.setProps({enableRtl: this.enableRtl});

        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());

        this.createManagedBean(new LayoutFeature(this.view));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();

        this.setupRowAnimationCssClass();

        this.controllersService.registerGridBodyController(this);

        this.addEventListeners();
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.view.setColumnMovingCss(moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        this.view.setCellSelectableCss(selectable);
    }

    private onDomLayoutChanged(): void {
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
    }

    private onScrollVisibilityChanged(): void {
        const show = this.scrollVisibleService.isVerticalScrollShowing();
        this.view.setVerticalScrollPaddingVisible(show);
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnController.getAllGridColumns();
        this.view.setColumnCount(columns ? columns.length : 0);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.addManagedListener(this.eGridBody, 'dragstart', (event: MouseEvent) => {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
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

        this.view.setRowCount(total);
    }

    public registerBodyViewportResizeListener(listener: (()=>void)): void {
        this.view.registerBodyViewportResizeListener(listener);
    }

    public setVerticalScrollPaddingVisible(visible: boolean): void {
        this.view.setVerticalScrollPaddingVisible(visible);
    }

    public isVerticalScrollShowing(): boolean {
        const isAlwaysShowVerticalScroll = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        this.view.setAlwaysVerticalScrollClass(isAlwaysShowVerticalScroll);
        return isVerticalScrollShowing(this.eBodyViewport);
    }

    private setupRowAnimationCssClass(): void {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gridOptionsWrapper.isAnimateRows() && !this.rowContainerHeightService.isScaling();
            this.view.setRowAnimationCssOnBodyViewport(animateRows);
        };

        listener();

        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    }

    public getGridBodyElement(): HTMLElement {
        return this.eGridBody;
    }

    private addBodyViewportListener(): void {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = (mouseEvent: MouseEvent) => {
            const target = getTarget(mouseEvent);
            if (target === this.eBodyViewport || target === this.controllersService.getCenterRowContainerCon().getViewportElement()) {
                // show it
                if (this.contextMenuFactory) {
                    this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, this.eGridBody);
                }
            }
        };

        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
    }

    public getGui(): HTMLElement {
        return this.eGridBody;
    }

    // called by rowDragFeature
    public scrollVertically(pixels: number): number {
        const oldScrollPosition = this.eBodyViewport.scrollTop;

        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    }

    // + rangeController - used to know when to scroll when user is dragging outside the
    // main viewport while doing a range selection
    public getBodyClientRect(): ClientRect | undefined {
        if (!this.eBodyViewport) { return; }

        return this.eBodyViewport.getBoundingClientRect();
    }

    private addRowDragListener(): void {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    }

    public getRowDragFeature(): RowDragFeature {
        return this.rowDragFeature;
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

        this.view.setTopHeight(floatingTopHeight);
        this.view.setBottomHeight(floatingBottomHeight);

        this.view.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.view.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
    }
}
