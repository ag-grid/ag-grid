import { BeanStub } from "../context/beanStub";
import { Autowired, Optional, PostConstruct, PreConstruct } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { ControllersService } from "../controllersService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { setAriaColCount } from "../utils/aria";
import { ColumnController } from "../columnController/columnController";
import { ScrollVisibleService, SetScrollsVisibleParams } from "./scrollVisibleService";
import { getTarget } from "../utils/event";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerHeight, isVerticalScrollShowing } from "../utils/dom";
import { BodyHeightChangedEvent } from "../events";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';

export interface GridBodyView extends  LayoutView {
    setColumnCount(count: number): void;
    setProps(params: {enableRtl: boolean, printLayout: boolean}): void;
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

    private view: GridBodyView;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private printLayout: boolean;

    private bodyHeight: number;

    private bodyScrollFeature: GridBodyScrollFeature;

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
    }

    public setView(view: GridBodyView, eGridBody: HTMLElement, eBodyViewport: HTMLElement): void {
        this.view = view;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;

        this.view.setProps({printLayout: this.printLayout, enableRtl: this.enableRtl});

        this.createManagedBean(new LayoutFeature(this.view));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));

        this.setupRowAnimationCssClass();

        this.controllersService.registerGridBodyController(this);

        this.addEventListeners();
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setHeaderAndFloatingHeights.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));
        // this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        // this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
    }

    private onScrollVisibilityChanged(): void {
        const show = this.scrollVisibleService.isVerticalScrollShowing();
        this.view.setVerticalScrollPaddingVisible(show);
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnController.getAllGridColumns();
        this.view.setColumnCount(columns ? columns.length : 0);
    }

    public checkBodyHeight(): void {
        const bodyHeight = getInnerHeight(this.eBodyViewport);

        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            const event: BodyHeightChangedEvent = {
                type: Events.EVENT_BODY_HEIGHT_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public clearBodyHeight(): void {
        this.bodyHeight = 0;
    }

    public registerBodyViewportResizeListener(listener: (()=>void)): void {
        this.view.registerBodyViewportResizeListener(listener);
    }

    public checkScrollLeft(): void {
        this.bodyScrollFeature.checkScrollLeft();
    }

    public horizontallyScrollHeaderCenterAndFloatingCenter(): void {
        this.bodyScrollFeature.horizontallyScrollHeaderCenterAndFloatingCenter();
    }

    public executeAnimationFrameScroll(): boolean {
        return this.bodyScrollFeature.executeAnimationFrameScroll();
    }

    public setHorizontalScrollPosition(hScrollPosition: number): void {
        this.bodyScrollFeature.setHorizontalScrollPosition(hScrollPosition);
    }

    public setVerticalScrollPosition(vScrollPosition: number): void {
        this.bodyScrollFeature.setVerticalScrollPosition(vScrollPosition);
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
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

    public getVScrollPosition(): { top: number, bottom: number; } {
        const result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    }

    public getHScrollPosition(): { left: number, right: number; } {
        const centerContainer = this.controllersService.getCenterRowContainerCon();
        return centerContainer.getHScrollPosition();
    }

    public getGui(): HTMLElement {
        return this.eGridBody;
    }

    // called by rowDragFeature
    public scrollVertically(pixels: number): number {
        const oldScrollPosition = this.eBodyViewport.scrollTop;

        this.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    }

    public isHorizontalScrollShowing(): boolean {
        return this.bodyScrollFeature.isHorizontalScrollShowing();
    }

    // + rangeController - used to know when to scroll when user is dragging outside the
    // main viewport while doing a range selection
    public getBodyClientRect(): ClientRect | undefined {
        if (!this.eBodyViewport) { return; }

        return this.eBodyViewport.getBoundingClientRect();
    }
}
