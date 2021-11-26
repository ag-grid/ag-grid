import { BeanStub } from "../context/beanStub";
import { Autowired, Optional } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { CtrlsService } from "../ctrlsService";
import { ColumnModel } from "../columns/columnModel";
import { ScrollVisibleService } from "./scrollVisibleService";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";
import { getInnerWidth, isVerticalScrollShowing } from "../utils/dom";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { RowDragFeature } from "./rowDragFeature";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { getTabIndex } from "../utils/browser";
import { RowRenderer } from "../rendering/rowRenderer";
import { PopupService } from "../widgets/popupService";
import { MouseEventService } from "./mouseEventService";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';
export const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string | null, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: string, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setPinnedTopBottomOverflowY(overflow: string): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
}

export class GridBodyCtrl extends BeanStub {

    @Autowired('rowContainerHeightService') private rowContainerHeightService: RowContainerHeightService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('mouseEventService') public mouseEventService: MouseEventService;
    @Autowired('$scope') private $scope: any;

    private comp: IGridBodyComp;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;
    private eTop: HTMLElement;
    private eBottom: HTMLElement;

    private bodyScrollFeature: GridBodyScrollFeature;
    private rowDragFeature: RowDragFeature;

    private angularApplyTriggered = false;

    public getScrollFeature(): GridBodyScrollFeature {
        return this.bodyScrollFeature;
    }

    public getBodyViewportElement(): HTMLElement {
        return this.eBodyViewport;
    }

    public setComp(comp: IGridBodyComp, eGridBody: HTMLElement, eBodyViewport: HTMLElement,
                   eTop: HTMLElement, eBottom: HTMLElement): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;

        this.setCellTextSelection(this.gridOptionsWrapper.isEnableCellTextSelect());

        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));
        this.addRowDragListener();

        this.setupRowAnimationCssClass();

        this.ctrlsService.registerGridBodyCtrl(this);

        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();
        this.addStopEditingWhenGridLosesFocus();

        if (this.$scope) {
            this.addAngularApplyCheck();
        }
    }

    public getComp(): IGridBodyComp {
        return this.comp;
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setFloatingHeights.bind(this));
    }

    private addFocusListeners(elements: HTMLElement[]): void {
        elements.forEach(element => {
            this.addManagedListener(element, 'focusin', () => {
                element.classList.add('ag-has-focus');
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                if (!element.contains(e.relatedTarget as HTMLElement)) {
                    element.classList.remove('ag-has-focus');
                }
            });
        });
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.comp.setColumnMovingCss(moving ? CSS_CLASS_COLUMN_MOVING : null, moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        const cssClass = selectable ? CSS_CLASS_CELL_SELECTABLE : null;
        this.comp.setCellSelectableCss(cssClass, selectable);
    }

    private onScrollVisibilityChanged(): void {
        const visible = this.scrollVisibleService.isVerticalScrollShowing();
        this.setVerticalScrollPaddingVisible(visible);
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnModel.getAllGridColumns();
        this.comp.setColumnCount(columns ? columns.length : 0);
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
        if (!this.gridOptionsWrapper.isStopEditingWhenCellsLoseFocus()) { return; }

        const focusOutListener = (event: FocusEvent): void => {
            // this is the element the focus is moving to
            const elementWithFocus = event.relatedTarget as HTMLElement;

            if (getTabIndex(elementWithFocus) === null) {
                this.rowRenderer.stopEditing();
                return;
            }

            let clickInsideGrid =
                // see if click came from inside the viewports
                viewports.some(viewport => viewport.contains(elementWithFocus))
                // and also that it's not from a detail grid
                && this.mouseEventService.isElementInThisGrid(elementWithFocus);

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

        const viewports = [this.eBodyViewport, this.eBottom, this.eTop];

        viewports.forEach(viewport => this.addManagedListener(viewport, 'focusout', focusOutListener));
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

        this.comp.setRowCount(total);
    }

    public registerBodyViewportResizeListener(listener: (() => void)): void {
        this.comp.registerBodyViewportResizeListener(listener);
    }

    public setVerticalScrollPaddingVisible(visible: boolean): void {
        const overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    }

    public isVerticalScrollShowing(): boolean {
        const show = this.gridOptionsWrapper.isAlwaysShowVerticalScroll();
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || isVerticalScrollShowing(this.eBodyViewport);
    }

    private setupRowAnimationCssClass(): void {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gridOptionsWrapper.isAnimateRows() && !this.rowContainerHeightService.isStretching();
            const animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
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
            if (this.gridOptionsWrapper.isPreventDefaultOnContextMenu()) {
                mouseEvent.preventDefault();
            }
            const { target } = mouseEvent;
            if (target === this.eBodyViewport || target === this.ctrlsService.getCenterRowContainerCtrl().getViewportElement()) {
                // show it
                if (this.contextMenuFactory) {
                    this.contextMenuFactory.onContextMenu(mouseEvent, null, null, null, null, this.eGridBody);
                }
            }
        };

        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);
        this.addManagedListener(this.eBodyViewport, 'wheel', this.onWheel.bind(this));
    }

    private onWheel(e: MouseEvent): void {
        if (!this.gridOptionsWrapper.isSuppressScrollWhenPopupsAreOpen()) { return; }

        if (this.popupService.hasAnchoredPopup()) {
            e.preventDefault();
        }
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

    private addRowDragListener(): void {
        this.rowDragFeature = this.createManagedBean(new RowDragFeature(this.eBodyViewport));
        this.dragAndDropService.addDropTarget(this.rowDragFeature);
    }

    public getRowDragFeature(): RowDragFeature {
        return this.rowDragFeature;
    }

    private setFloatingHeights(): void {
        const { pinnedRowModel } = this;

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

        this.comp.setTopHeight(floatingTopHeight);
        this.comp.setBottomHeight(floatingBottomHeight);

        this.comp.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.comp.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(nextTimeout?: number) {
        const removeScrollWidth = this.isVerticalScrollShowing();
        const scrollWidthToRemove = removeScrollWidth ? this.gridOptionsWrapper.getScrollbarWidth() : 0;
        const bodyViewportWidth = getInnerWidth(this.eBodyViewport);
        const availableWidth = bodyViewportWidth - scrollWidthToRemove;

        if (availableWidth > 0) {
            this.columnModel.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
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

    // + rangeService
    public addScrollEventListener(listener: () => void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    // + focusService
    public removeScrollEventListener(listener: () => void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }

    public requestAngularApply(): void {
        if (this.angularApplyTriggered) { return; }

        this.angularApplyTriggered = true;

        window.setTimeout(() => {
            this.angularApplyTriggered = false;
            this.$scope.$apply();
        }, 0);
    }

    private addAngularApplyCheck(): void {
        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => this.requestAngularApply());
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, () => this.requestAngularApply());
    }
}
