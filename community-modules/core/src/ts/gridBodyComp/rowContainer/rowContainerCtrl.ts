import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ScrollVisibleService } from "../../gridBodyComp/scrollVisibleService";
import { Events } from "../../eventKeys";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature";
import { DragService } from "../../dragAndDrop/dragService";
import { ControllersService } from "../../controllersService";
import { getInnerWidth, getScrollLeft, isHorizontalScrollShowing, isVisible, setScrollLeft } from "../../utils/dom";
import { ColumnModel } from "../../columns/columnModel";
import { ResizeObserverService } from "../../misc/resizeObserverService";
import { ViewportSizeFeature } from "../viewportSizeFeature";
import { convertToMap } from "../../utils/map";
import { SetPinnedLeftWidthFeature } from "./setPinnedLeftWidthFeature";
import { SetPinnedRightWidthFeature } from "./setPinnedRightWidthFeature";
import { SetHeightFeature } from "./setHeightFeature";
import { DragListenerFeature } from "./dragListenerFeature";
import { CenterWidthFeature } from "../centerWidthFeature";

export enum RowContainerNames {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    FULL_WIDTH = 'fullWidth',

    TOP_LEFT = 'topLeft',
    TOP_RIGHT = 'topRight',
    TOP_CENTER = 'topCenter',
    TOP_FULL_WITH = 'topFullWidth',

    BOTTOM_LEFT = 'bottomLeft',
    BOTTOM_RIGHT = 'bottomRight',
    BOTTOM_CENTER = 'bottomCenter',
    BOTTOM_FULL_WITH = 'bottomFullWidth'
}

export const ContainerCssClasses: Map<RowContainerNames, string> = convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-container'],
    [RowContainerNames.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerNames.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerNames.FULL_WIDTH, 'ag-full-width-container'],

    [RowContainerNames.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerNames.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerNames.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerNames.TOP_FULL_WITH, 'ag-floating-top-full-width-container'],

    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerNames.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerNames.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerNames.BOTTOM_FULL_WITH, 'ag-floating-bottom-full-width-container'],
]);

export const ViewportCssClasses: Map<RowContainerNames, string> = convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-viewport'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);

export const WrapperCssClasses: Map<RowContainerNames, string> = convertToMap([
    [RowContainerNames.CENTER, 'ag-center-cols-clipper'],
]);

export interface IRowContainerComp {
    setViewportHeight(height: string): void;
}

export class RowContainerCtrl extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    private comp: IRowContainerComp;
    private name: RowContainerNames;
    private eContainer: HTMLElement;
    private eViewport: HTMLElement;
    private eWrapper: HTMLElement;
    private enableRtl: boolean;

    private viewportSizeFeature: ViewportSizeFeature; // only center has this

    constructor(name: RowContainerNames) {
        super();
        this.name = name;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));

        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();

        this.forContainers([RowContainerNames.CENTER],
            () => this.viewportSizeFeature = this.createManagedBean(new ViewportSizeFeature(this)))

        this.registerWithControllersService();

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
    }

    private registerWithControllersService(): void {
        switch (this.name) {
            case RowContainerNames.CENTER: this.controllersService.registerCenterRowContainerCon(this); break;
            case RowContainerNames.LEFT: this.controllersService.registerLeftRowContainerCon(this); break;
            case RowContainerNames.RIGHT: this.controllersService.registerRightRowContainerCon(this); break;
            case RowContainerNames.TOP_CENTER: this.controllersService.registerTopCenterRowContainerCon(this); break;
            case RowContainerNames.TOP_LEFT: this.controllersService.registerTopLeftRowContainerCon(this); break;
            case RowContainerNames.TOP_RIGHT: this.controllersService.registerTopRightRowContainerCon(this); break;
            case RowContainerNames.BOTTOM_CENTER: this.controllersService.registerBottomCenterRowContainerCon(this); break;
            case RowContainerNames.BOTTOM_LEFT: this.controllersService.registerBottomLeftRowContainerCon(this); break;
            case RowContainerNames.BOTTOM_RIGHT: this.controllersService.registerBottomRightRowContainerCon(this); break;
        }
    }

    private forContainers(names: RowContainerNames[], callback: (() => void)): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    public getContainerElement(): HTMLElement {
        return this.eContainer;
    }

    public getViewportSizeFeature(): ViewportSizeFeature {
        return this.viewportSizeFeature;
    }

    public setComp(view: IRowContainerComp, eContainer: HTMLElement, eViewport: HTMLElement, eWrapper: HTMLElement): void {
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;
        this.eWrapper = eWrapper;

        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();

        const allTopNoFW = [RowContainerNames.TOP_CENTER, RowContainerNames.TOP_LEFT, RowContainerNames.TOP_RIGHT];
        const allBottomNoFW = [RowContainerNames.BOTTOM_CENTER, RowContainerNames.BOTTOM_LEFT, RowContainerNames.BOTTOM_RIGHT];
        const allMiddleNoFW = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT];
        const allNoFW = [...allTopNoFW, ...allBottomNoFW, ...allMiddleNoFW];

        const allMiddle = [RowContainerNames.CENTER, RowContainerNames.LEFT, RowContainerNames.RIGHT, RowContainerNames.FULL_WIDTH];

        const allCenter = [RowContainerNames.CENTER, RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER];
        const allLeft = [RowContainerNames.LEFT, RowContainerNames.BOTTOM_LEFT, RowContainerNames.TOP_LEFT];
        const allRight = [RowContainerNames.RIGHT, RowContainerNames.BOTTOM_RIGHT, RowContainerNames.TOP_RIGHT];

        this.forContainers(allLeft, () => this.createManagedBean(new SetPinnedLeftWidthFeature(this.eContainer)));
        this.forContainers(allRight, () => this.createManagedBean(new SetPinnedRightWidthFeature(this.eContainer)));
        this.forContainers(allMiddle, () => this.createManagedBean(new SetHeightFeature(this.eContainer, this.eWrapper)));
        this.forContainers(allNoFW, () => this.createManagedBean(new DragListenerFeature(this.eContainer)));

        this.forContainers(allCenter, () => this.createManagedBean(
            new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`))
        );
    }

    public onDisplayedColumnsChanged(): void {
        this.forContainers([RowContainerNames.CENTER], () => this.onHorizontalViewportChanged())
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.forContainers([RowContainerNames.CENTER], () => this.onHorizontalViewportChanged())
    }

    private onScrollVisibilityChanged(): void {
        if (this.name !== RowContainerNames.CENTER) { return; }

        const visible = this.scrollVisibleService.isHorizontalScrollShowing();
        const scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const height = scrollbarWidth == 0 ? '100%' : `calc(100% + ${scrollbarWidth}px)`;
        this.comp.setViewportHeight(height);
    }

    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    private addPreventScrollWhileDragging(): void {
        const preventScroll = (e: TouchEvent) => {
            if (this.dragService.isDragging()) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        this.eContainer.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(() => this.eContainer.removeEventListener('touchmove', preventScroll));
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    public onHorizontalViewportChanged(): void {
        const scrollWidth = this.getCenterWidth();
        const scrollPosition = this.getCenterViewportScrollLeft();

        this.columnModel.setViewportPosition(scrollWidth, scrollPosition);
    }

    public getCenterWidth(): number {
        return getInnerWidth(this.eViewport);
    }

    public getCenterViewportScrollLeft(): number {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return getScrollLeft(this.eViewport, this.enableRtl);
    }

    public registerViewportResizeListener(listener: (() => void)) {
        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public isViewportVisible(): boolean {
        return isVisible(this.eViewport);
    }

    public isViewportHScrollShowing(): boolean {
        return isHorizontalScrollShowing(this.eViewport);
    }

    public getViewportScrollLeft(): number {
        return getScrollLeft(this.eViewport, this.enableRtl);
    }

    public isHorizontalScrollShowing(): boolean {
        const isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
    }

    public getViewportElement(): HTMLElement {
        return this.eViewport;
    }

    public setContainerTranslateX(amount: number): void {
        this.eContainer.style.transform = `translateX(${amount}px)`
    }

    public getHScrollPosition(): { left: number, right: number; } {
        const res = {
            left: this.eViewport.scrollLeft,
            right: this.eViewport.scrollLeft + this.eViewport.offsetWidth
        };
        return res;
    }

    public setCenterViewportScrollLeft(value: number): void {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        setScrollLeft(this.eViewport, value, this.enableRtl);
    }
}