import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { RowContainerEventsFeature } from "./rowContainerEventsFeature";
import { DragService } from "../../dragAndDrop/dragService";
import { CtrlsService } from "../../ctrlsService";
import { getInnerWidth, getScrollLeft, isHorizontalScrollShowing, isInDOM, setScrollLeft } from "../../utils/dom";
import { ColumnModel } from "../../columns/columnModel";
import { ResizeObserverService } from "../../misc/resizeObserverService";
import { ViewportSizeFeature } from "../viewportSizeFeature";
import { convertToMap } from "../../utils/map";
import { SetPinnedLeftWidthFeature } from "./setPinnedLeftWidthFeature";
import { SetPinnedRightWidthFeature } from "./setPinnedRightWidthFeature";
import { SetHeightFeature } from "./setHeightFeature";
import { DragListenerFeature } from "./dragListenerFeature";
import { CenterWidthFeature } from "../centerWidthFeature";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { RowRenderer } from "../../rendering/rowRenderer";
import { ColumnPinnedType } from "../../entities/column";
import { DisplayedRowsChangedEvent } from "../../events";

export enum RowContainerName {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    FULL_WIDTH = 'fullWidth',

    TOP_LEFT = 'topLeft',
    TOP_RIGHT = 'topRight',
    TOP_CENTER = 'topCenter',
    TOP_FULL_WIDTH = 'topFullWidth',

    STICKY_TOP_LEFT = 'stickyTopLeft',
    STICKY_TOP_RIGHT = 'stickyTopRight',
    STICKY_TOP_CENTER = 'stickyTopCenter',
    STICKY_TOP_FULL_WIDTH = 'stickyTopFullWidth',

    BOTTOM_LEFT = 'bottomLeft',
    BOTTOM_RIGHT = 'bottomRight',
    BOTTOM_CENTER = 'bottomCenter',
    BOTTOM_FULL_WIDTH = 'bottomFullWidth'
}

export enum RowContainerType {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    FULL_WIDTH = 'fullWidth'
}

export function getRowContainerTypeForName(name: RowContainerName): RowContainerType {
    switch (name) {
        case RowContainerName.CENTER:
        case RowContainerName.TOP_CENTER:
        case RowContainerName.STICKY_TOP_CENTER:
        case RowContainerName.BOTTOM_CENTER:
            return RowContainerType.CENTER;
        case RowContainerName.LEFT:
        case RowContainerName.TOP_LEFT:
        case RowContainerName.STICKY_TOP_LEFT:
        case RowContainerName.BOTTOM_LEFT:
            return RowContainerType.LEFT;
        case RowContainerName.RIGHT:
        case RowContainerName.TOP_RIGHT:
        case RowContainerName.STICKY_TOP_RIGHT:
        case RowContainerName.BOTTOM_RIGHT:
            return RowContainerType.RIGHT;
        case RowContainerName.FULL_WIDTH:
        case RowContainerName.TOP_FULL_WIDTH:
        case RowContainerName.STICKY_TOP_FULL_WIDTH:
        case RowContainerName.BOTTOM_FULL_WIDTH:
            return RowContainerType.FULL_WIDTH;
        default :
            throw Error('Invalid Row Container Type');
    }
}

const ContainerCssClasses: Map<RowContainerName, string> = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-container'],
    [RowContainerName.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerName.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerName.FULL_WIDTH, 'ag-full-width-container'],

    [RowContainerName.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerName.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerName.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerName.TOP_FULL_WIDTH, 'ag-floating-top-full-width-container'],

    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-container'],
    [RowContainerName.STICKY_TOP_LEFT, 'ag-pinned-left-sticky-top'],
    [RowContainerName.STICKY_TOP_RIGHT, 'ag-pinned-right-sticky-top'],
    [RowContainerName.STICKY_TOP_FULL_WIDTH, 'ag-sticky-top-full-width-container'],

    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerName.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerName.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerName.BOTTOM_FULL_WIDTH, 'ag-floating-bottom-full-width-container'],
]);

const ViewportCssClasses: Map<RowContainerName, string> = convertToMap([
    [RowContainerName.CENTER, 'ag-center-cols-viewport'],
    [RowContainerName.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerName.STICKY_TOP_CENTER, 'ag-sticky-top-viewport'],
    [RowContainerName.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);

export interface IRowContainerComp {
    setViewportHeight(height: string): void;
    setRowCtrls(params: { rowCtrls: RowCtrl[], useFlushSync?: boolean }): void;
    setDomOrder(domOrder: boolean): void;
    setContainerWidth(width: string): void;
}

export class RowContainerCtrl extends BeanStub {

    public static getRowContainerCssClasses(name: RowContainerName): { container?: string, viewport?: string } {
        const containerClass = ContainerCssClasses.get(name);
        const viewportClass = ViewportCssClasses.get(name);
        return { container: containerClass, viewport: viewportClass };
    }

    public static getPinned(name: RowContainerName): ColumnPinnedType {
        switch (name) {
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.LEFT:
                return 'left';
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.RIGHT:
                return 'right';
            default:
                return null;
        }
    }

    @Autowired('dragService') private dragService: DragService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    private readonly name: RowContainerName;
    private readonly isFullWithContainer: boolean;

    private comp: IRowContainerComp;
    private eContainer: HTMLElement;
    private eViewport: HTMLElement;
    private enableRtl: boolean;

    private viewportSizeFeature: ViewportSizeFeature | undefined; // only center has this
    private pinnedWidthFeature: SetPinnedLeftWidthFeature | SetPinnedRightWidthFeature | undefined;
    private visible: boolean = true;
    // Maintaining a constant reference enables optimization in React.
    private EMPTY_CTRLS = [];

    constructor(name: RowContainerName) {
        super();
        this.name = name;
        this.isFullWithContainer =
            this.name === RowContainerName.TOP_FULL_WIDTH
            || this.name === RowContainerName.STICKY_TOP_FULL_WIDTH
            || this.name === RowContainerName.BOTTOM_FULL_WIDTH
            || this.name === RowContainerName.FULL_WIDTH;
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gos.get('enableRtl');

        this.forContainers([RowContainerName.CENTER],
            () => this.viewportSizeFeature = this.createManagedBean(new ViewportSizeFeature(this)));
    }

    private registerWithCtrlsService(): void {

        switch (this.name) {
            case RowContainerName.FULL_WIDTH:
            case RowContainerName.TOP_FULL_WIDTH:
            case RowContainerName.STICKY_TOP_FULL_WIDTH:
            case RowContainerName.BOTTOM_FULL_WIDTH:
                // we don't register full width containers
                return;
            default:{
                this.ctrlsService.register(this.name, this);
            }
        }
    }

    private forContainers(names: RowContainerName[], callback: (() => void)): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    public getContainerElement(): HTMLElement {
        return this.eContainer;
    }

    public getViewportSizeFeature(): ViewportSizeFeature | undefined {
        return this.viewportSizeFeature;
    }

    public setComp(view: IRowContainerComp, eContainer: HTMLElement, eViewport: HTMLElement): void {
        this.comp = view;
        this.eContainer = eContainer;
        this.eViewport = eViewport;

        this.createManagedBean(new RowContainerEventsFeature(this.eContainer));
        this.addPreventScrollWhileDragging();
        this.listenOnDomOrder();
        this.stopHScrollOnPinnedRows();

        const allTopNoFW = [RowContainerName.TOP_CENTER, RowContainerName.TOP_LEFT, RowContainerName.TOP_RIGHT];
        const allStickyTopNoFW = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT];
        const allBottomNoFW = [RowContainerName.BOTTOM_CENTER, RowContainerName.BOTTOM_LEFT, RowContainerName.BOTTOM_RIGHT];
        const allMiddleNoFW = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT];
        const allNoFW = [...allTopNoFW, ...allBottomNoFW, ...allMiddleNoFW, ...allStickyTopNoFW];

        const allMiddle = [RowContainerName.CENTER, RowContainerName.LEFT, RowContainerName.RIGHT, RowContainerName.FULL_WIDTH];

        const allCenter = [RowContainerName.CENTER, RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER];
        const allLeft = [RowContainerName.LEFT, RowContainerName.BOTTOM_LEFT, RowContainerName.TOP_LEFT, RowContainerName.STICKY_TOP_LEFT];
        const allRight = [RowContainerName.RIGHT, RowContainerName.BOTTOM_RIGHT, RowContainerName.TOP_RIGHT, RowContainerName.STICKY_TOP_RIGHT];

        this.forContainers(allLeft, () => {
            this.pinnedWidthFeature = this.createManagedBean(new SetPinnedLeftWidthFeature(this.eContainer));
            this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, () => this.onPinnedWidthChanged());
        });
        this.forContainers(allRight, () => {
            this.pinnedWidthFeature = this.createManagedBean(new SetPinnedRightWidthFeature(this.eContainer));
            this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, () => this.onPinnedWidthChanged());
        });
        this.forContainers(allMiddle, () => this.createManagedBean(new SetHeightFeature(this.eContainer, this.name === RowContainerName.CENTER ? eViewport : undefined)));
        this.forContainers(allNoFW, () => this.createManagedBean(new DragListenerFeature(this.eContainer)));

        this.forContainers(allCenter, () => this.createManagedBean(
            new CenterWidthFeature(width => this.comp.setContainerWidth(`${width}px`))
        ));

        this.addListeners();
        this.registerWithCtrlsService();
    }

    private addListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => this.onDisplayedColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, () => this.onDisplayedColumnsWidthChanged());
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, (params: DisplayedRowsChangedEvent) => this.onDisplayedRowsChanged(params.afterScroll));

        this.onDisplayedColumnsChanged();
        this.onDisplayedColumnsWidthChanged();
        this.onDisplayedRowsChanged();
    }

    private listenOnDomOrder(): void {
        // sticky section must show rows in set order
        const allStickyContainers = [RowContainerName.STICKY_TOP_CENTER, RowContainerName.STICKY_TOP_LEFT, RowContainerName.STICKY_TOP_RIGHT, RowContainerName.STICKY_TOP_FULL_WIDTH];
        const isStickContainer = allStickyContainers.indexOf(this.name) >= 0;
        if (isStickContainer) {
            this.comp.setDomOrder(true);
            return;
        }

        const listener = () => {
            const isEnsureDomOrder = this.gos.get('ensureDomOrder');
            const isPrintLayout = this.gos.isDomLayout('print');
            this.comp.setDomOrder(isEnsureDomOrder || isPrintLayout);
        };

        this.addManagedPropertyListener('domLayout', listener);
        listener();
    }

    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    private stopHScrollOnPinnedRows(): void {
        this.forContainers([RowContainerName.TOP_CENTER, RowContainerName.STICKY_TOP_CENTER, RowContainerName.BOTTOM_CENTER], () => {
            const resetScrollLeft = () => this.eViewport.scrollLeft = 0;
            this.addManagedListener(this.eViewport, 'scroll', resetScrollLeft);
        });
    }

    public onDisplayedColumnsChanged(): void {
        this.forContainers([RowContainerName.CENTER], () => this.onHorizontalViewportChanged());
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.forContainers([RowContainerName.CENTER], () => this.onHorizontalViewportChanged());
    }
    // this methods prevents the grid views from being scrolled while the dragService is being used
    // eg. the view should not scroll up and down while dragging rows using the rowDragComp.
    private addPreventScrollWhileDragging(): void {
        const preventScroll = (e: TouchEvent) => {
            if (this.dragService.isDragging()) {
                if (e.cancelable) { e.preventDefault(); }
            }
        };

        this.eContainer.addEventListener('touchmove', preventScroll, { passive: false });
        this.addDestroyFunc(() => this.eContainer.removeEventListener('touchmove', preventScroll));
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    public onHorizontalViewportChanged(afterScroll: boolean = false): void {
        const scrollWidth = this.getCenterWidth();
        const scrollPosition = this.getCenterViewportScrollLeft();

        this.columnModel.setViewportPosition(scrollWidth, scrollPosition, afterScroll);
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

    public isViewportInTheDOMTree(): boolean {
        return isInDOM(this.eViewport);
    }

    public getViewportScrollLeft(): number {
        return getScrollLeft(this.eViewport, this.enableRtl);
    }

    public isHorizontalScrollShowing(): boolean {
        const isAlwaysShowHorizontalScroll = this.gos.get('alwaysShowHorizontalScroll');
        return isAlwaysShowHorizontalScroll || isHorizontalScrollShowing(this.eViewport);
    }

    public getViewportElement(): HTMLElement {
        return this.eViewport;
    }

    public setContainerTranslateX(amount: number): void {
        this.eContainer.style.transform = `translateX(${amount}px)`;
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

    private isContainerVisible(): boolean {
        const pinned = RowContainerCtrl.getPinned(this.name);
        return !pinned || (!!this.pinnedWidthFeature && this.pinnedWidthFeature.getWidth() > 0);
    }

    private onPinnedWidthChanged(): void {
        const visible = this.isContainerVisible();
        if (this.visible != visible) {
            this.visible = visible;
            this.onDisplayedRowsChanged();
        }
    }

    private onDisplayedRowsChanged(afterScroll: boolean = false): void {
        const rows = this.getRowCtrls();
        if (!this.visible || rows.length === 0) {
            this.comp.setRowCtrls({ rowCtrls: this.EMPTY_CTRLS });
            return;
        }

        const printLayout = this.gos.isDomLayout('print');
        const embedFullWidthRows = this.gos.get('embedFullWidthRows');
        const embedFW = embedFullWidthRows || printLayout;
        
        // this list contains either all pinned top, center or pinned bottom rows
        // this filters out rows not for this container, eg if it's a full with row, but we are not full with container
        const rowsThisContainer = rows.filter(rowCtrl => {
            // this just justifies if the ctrl is in the correct place, this will be fed with zombie rows by the
            // row renderer, so should not block them as they still need to animate -  the row renderer
            // will clean these up when they finish animating
            const fullWidthRow = rowCtrl.isFullWidth();

            const match = this.isFullWithContainer ?
                !embedFW && fullWidthRow
                : embedFW || !fullWidthRow;

            return match;
        });

        this.comp.setRowCtrls({ rowCtrls: rowsThisContainer, useFlushSync: afterScroll });
    }

    private getRowCtrls(): RowCtrl[] {
        switch (this.name) {
            case RowContainerName.TOP_CENTER:
            case RowContainerName.TOP_LEFT:
            case RowContainerName.TOP_RIGHT:
            case RowContainerName.TOP_FULL_WIDTH:
                return this.rowRenderer.getTopRowCtrls();

            case RowContainerName.STICKY_TOP_CENTER:
            case RowContainerName.STICKY_TOP_LEFT:
            case RowContainerName.STICKY_TOP_RIGHT:
            case RowContainerName.STICKY_TOP_FULL_WIDTH:
                return this.rowRenderer.getStickyTopRowCtrls();

            case RowContainerName.BOTTOM_CENTER:
            case RowContainerName.BOTTOM_LEFT:
            case RowContainerName.BOTTOM_RIGHT:
            case RowContainerName.BOTTOM_FULL_WIDTH:
                return this.rowRenderer.getBottomRowCtrls();

            default:
                return this.rowRenderer.getCentreRowCtrls();
        }
    }
}