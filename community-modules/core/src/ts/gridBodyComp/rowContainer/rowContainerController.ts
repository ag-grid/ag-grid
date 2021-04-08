import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { ScrollVisibleService } from "../../gridBodyComp/scrollVisibleService";
import { Events } from "../../eventKeys";
import { RowContainerNames } from "./rowContainerComp";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature";
import { DragService } from "../../dragAndDrop/dragService";
import { ControllersService } from "../../controllersService";
import { getInnerWidth, getScrollLeft, isHorizontalScrollShowing, isVisible } from "../../utils/dom";
import { ColumnController } from "../../columnController/columnController";
import { ResizeObserverService } from "../../misc/resizeObserverService";

export interface RowContainerView {
    setViewportHeight(height: string): void;
}

export class RowContainerController extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('controllersService') private controllersService: ControllersService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    private view: RowContainerView;
    private name: RowContainerNames;
    private eContainer: HTMLElement;
    private eViewport: HTMLElement;
    private enableRtl: boolean;

    constructor(name: RowContainerNames) {
        super();
        this.name = name;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));

        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();

        this.forContainers([RowContainerNames.CENTER],
            ()=> this.controllersService.registerCenterRowContainerCon(this) )

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
    }

    private forContainers(names: RowContainerNames[], callback: (()=>void)): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    public setView(view: RowContainerView, eContainer: HTMLElement, eViewport: HTMLElement): void {
        this.view = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;

        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
    }

    public onDisplayedColumnsChanged(): void {
        this.forContainers([RowContainerNames.CENTER], ()=> this.onHorizontalViewportChanged() )
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.forContainers([RowContainerNames.CENTER], ()=> this.onHorizontalViewportChanged() )
    }

    private onScrollVisibilityChanged(): void {
        if (this.name!==RowContainerNames.CENTER) { return; }

        const visible = this.scrollVisibleService.isHorizontalScrollShowing();
        const scrollbarWidth = visible ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const height = scrollbarWidth == 0 ? '100%' : `calc(100% + ${scrollbarWidth}px)`;
        this.view.setViewportHeight(height);
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
        this.addDestroyFunc(() => this.eContainer.removeEventListener('touchmove', preventScroll) );
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    public onHorizontalViewportChanged(): void {
        const scrollWidth = this.getCenterWidth();
        const scrollPosition = this.getCenterViewportScrollLeft();

        this.columnController.setViewportPosition(scrollWidth, scrollPosition);
    }

    public getCenterWidth(): number {
        return getInnerWidth(this.eViewport);
    }

    public getCenterViewportScrollLeft(): number {
        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return getScrollLeft(this.eViewport, this.enableRtl);
    }

    public registerViewportResizeListener(listener: (()=>void) ) {
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

}