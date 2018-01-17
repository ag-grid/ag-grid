import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {RowRenderer} from "../rendering/rowRenderer";
import {BorderLayout} from "../layout/borderLayout";
import {Logger, LoggerFactory} from "../logger";
import {Bean, Qualifier, Autowired, PostConstruct, Optional, PreDestroy, Context} from "../context/context";
import {EventService} from "../eventService";
import {BodyHeightChangedEvent, BodyScrollEvent, Events} from "../events";
import {DragService, DragListenerParams} from "../dragAndDrop/dragService";
import {IRangeController} from "../interfaces/iRangeController";
import {Constants} from "../constants";
import {SelectionController} from "../selectionController";
import {CsvCreator} from "../csvCreator";
import {MouseEventService} from "./mouseEventService";
import {IClipboardService} from "../interfaces/iClipboardService";
import {FocusedCellController} from "../focusedCellController";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import {SetScrollsVisibleParams, ScrollVisibleService} from "./scrollVisibleService";
import {BeanStub} from "../context/beanStub";
import {IFrameworkFactory} from "../interfaces/iFrameworkFactory";
import {Column} from "../entities/column";
import {RowContainerComponent} from "../rendering/rowContainerComponent";
import {RowNode} from "../entities/rowNode";
import {PaginationProxy} from "../rowModels/paginationProxy";
import {PopupEditorWrapper} from "../rendering/cellEditors/popupEditorWrapper";
import {AlignedGridsService} from "../alignedGridsService";
import {PinnedRowModel} from "../rowModels/pinnedRowModel";
import {GridApi} from "../gridApi";
import {AnimationFrameService} from "../misc/animationFrameService";
import {RowComp} from "../rendering/rowComp";
import {NavigationService} from "./navigationService";
import {CellComp} from "../rendering/cellComp";
import {ValueService} from "../valueService/valueService";
import {LongTapEvent, TouchListener} from "../widgets/touchListener";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {RowDragFeature} from "./rowDragFeature";

// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap

const HEADER_SNIPPET =
    '<div class="ag-header" role="row">'+
      '<div class="ag-pinned-left-header" role="presentation"></div>' +
      '<div class="ag-pinned-right-header" role="presentation"></div>' +
      '<div class="ag-header-viewport" role="presentation">' +
        '<div class="ag-header-container" role="presentation"></div>' +
      '</div>'+
      '<div class="ag-header-overlay" role="presentation"></div>' +
    '</div>';

const FLOATING_TOP_SNIPPET =
    '<div class="ag-floating-top" role="presentation">'+
      '<div class="ag-pinned-left-floating-top" role="presentation"></div>' +
      '<div class="ag-pinned-right-floating-top" role="presentation"></div>' +
      '<div class="ag-floating-top-viewport" role="presentation">' +
        '<div class="ag-floating-top-container" role="presentation"></div>' +
      '</div>'+
      '<div class="ag-floating-top-full-width-container" role="presentation"></div>'+
    '</div>';

const FLOATING_BOTTOM_SNIPPET =
    '<div class="ag-floating-bottom" role="presentation">'+
      '<div class="ag-pinned-left-floating-bottom" role="presentation"></div>' +
      '<div class="ag-pinned-right-floating-bottom" role="presentation"></div>' +
      '<div class="ag-floating-bottom-viewport" role="presentation">' +
        '<div class="ag-floating-bottom-container" role="presentation"></div>' +
      '</div>'+
      '<div class="ag-floating-bottom-full-width-container" role="presentation"></div>'+
    '</div>';

const BODY_SNIPPET =
    '<div class="ag-body" role="presentation">'+
      '<div class="ag-pinned-left-cols-viewport" role="presentation">'+
        '<div class="ag-pinned-left-cols-container" role="presentation"></div>'+
      '</div>'+
      '<div class="ag-pinned-right-cols-viewport" role="presentation">'+
        '<div class="ag-pinned-right-cols-container" role="presentation"></div>'+
      '</div>'+
      '<div class="ag-body-viewport-wrapper" role="presentation">'+
        '<div class="ag-body-viewport" role="presentation">'+
          '<div class="ag-body-container" role="presentation"></div>'+
        '</div>'+
      '</div>'+
      '<div class="ag-full-width-viewport" role="presentation">'+
        '<div class="ag-full-width-container" role="presentation"></div>'+
      '</div>'+
    '</div>';

// the difference between the 'normal' and 'full height' template is the order of the floating and body,
// for normal, the floating top and bottom go in first as they are fixed position,
// for auto-height, the body is in the middle of the top and bottom as they are just normally laid out
const GRID_PANEL_NORMAL_TEMPLATE =
    '<div class="ag-root ag-font-style" role="grid">'+
        HEADER_SNIPPET + FLOATING_TOP_SNIPPET + FLOATING_BOTTOM_SNIPPET + BODY_SNIPPET +
    '</div>';

const GRID_PANEL_AUTO_HEIGHT_TEMPLATE =
    '<div class="ag-root ag-font-style" role="grid">'+
        HEADER_SNIPPET + FLOATING_TOP_SNIPPET + BODY_SNIPPET + FLOATING_BOTTOM_SNIPPET +
    '</div>';

// the template for for-print is much easier than that others, as it doesn't have any pinned areas
// or scrollable areas (so no viewports).
const GRID_PANEL_FOR_PRINT_TEMPLATE =
        '<div class="ag-root ag-font-style">'+
            // header
            '<div class="ag-header-container"></div>'+
            // floating
            '<div class="ag-floating-top-container"></div>'+
            // body
            '<div class="ag-body-container"></div>'+
            // floating bottom
            '<div class="ag-floating-bottom-container"></div>'+
        '</div>';

export interface RowContainerComponents {
    fullWidth: RowContainerComponent;
    body: RowContainerComponent;
    pinnedLeft: RowContainerComponent;
    pinnedRight: RowContainerComponent;
    floatingTop: RowContainerComponent;
    floatingTopPinnedLeft: RowContainerComponent;
    floatingTopPinnedRight: RowContainerComponent;
    floatingTopFullWidth: RowContainerComponent;
    floatingBottom: RowContainerComponent;
    floatingBottomPinnedLeft: RowContainerComponent;
    floatingBottomPinnedRight: RowContainerComponent;
    floatingBottomFullWith: RowContainerComponent;
}

@Bean('gridPanel')
export class GridPanel extends BeanStub {

    @Autowired('alignedGridsService') private alignedGridsService: AlignedGridsService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('navigationService') private navigationService: NavigationService;

    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('$scope') private $scope: any;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;
    @Autowired('valueService') private  valueService: ValueService;
    @Autowired('componentRecipes') private componentRecipes: ComponentRecipes;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private layout: BorderLayout;
    private logger: Logger;

    private eBodyViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eBody: HTMLElement;

    private rowContainerComponents: RowContainerComponents;

    private eBodyContainer: HTMLElement;
    private ePinnedLeftColsContainer: HTMLElement;
    private ePinnedRightColsContainer: HTMLElement;
    private eFullWidthCellViewport: HTMLElement;
    private eFullWidthCellContainer: HTMLElement;
    private ePinnedLeftColsViewport: HTMLElement;
    private ePinnedRightColsViewport: HTMLElement;
    private eBodyViewportWrapper: HTMLElement;

    private eHeaderContainer: HTMLElement;
    private eHeaderOverlay: HTMLElement;
    private ePinnedLeftHeader: HTMLElement;
    private ePinnedRightHeader: HTMLElement;
    private eHeader: HTMLElement;
    private eHeaderViewport: HTMLElement;

    private eFloatingTop: HTMLElement;
    private ePinnedLeftFloatingTop: HTMLElement;
    private ePinnedRightFloatingTop: HTMLElement;
    private eFloatingTopContainer: HTMLElement;
    private eFloatingTopViewport: HTMLElement;
    private eFloatingTopFullWidthCellContainer: HTMLElement;

    private eFloatingBottom: HTMLElement;
    private ePinnedLeftFloatingBottom: HTMLElement;
    private ePinnedRightFloatingBottom: HTMLElement;
    private eFloatingBottomContainer: HTMLElement;
    private eFloatingBottomViewport: HTMLElement;
    private eFloatingBottomFullWidthCellContainer: HTMLElement;

    private eAllCellContainers: HTMLElement[];

    private scrollLeft = -1;
    private nextScrollLeft = -1;
    private scrollTop = -1;
    private nextScrollTop = -1;
    private verticalRedrawNeeded = false;

    private bodyHeight: number;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private forPrint: boolean;
    private autoHeight: boolean;
    private scrollWidth: number;

    // used to track if pinned panels are showing, so we can turn them off if not
    private pinningRight: boolean;
    private pinningLeft: boolean;

    private useAnimationFrame: boolean;

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('GridPanel');
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.autoHeight = this.gridOptionsWrapper.isAutoHeight();
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.loadTemplate();
        this.findElements();
    }

    public getVerticalPixelRange(): {top: number, bottom: number} {
        let container: HTMLElement = this.getPrimaryScrollViewport();
        let result = {
            top: container.scrollTop,
            bottom: container.scrollTop + container.offsetHeight
        };
        return result;
    }

    // we override this, as the base class is missing the annotation
    @PreDestroy
    public destroy() {
        super.destroy();
    }

    private onRowDataChanged(): void {
        this.showOrHideOverlay();
    }

    private showOrHideOverlay(): void {
        if (this.paginationProxy.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.showNoRowsOverlay();
        } else {
            this.hideOverlay();
        }
    }

    private onNewColumnsLoaded(): void {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnController.isReady() && !this.paginationProxy.isEmpty()) {
            this.hideOverlay();
        }
    }

    public getLayout(): BorderLayout {
        return this.layout;
    }

    @PostConstruct
    private init() {

        this.useAnimationFrame = !this.gridOptionsWrapper.isSuppressAnimationFrame();

        this.addEventListeners();
        this.addDragListeners();

        this.layout = new BorderLayout({
            center: this.eRoot,
            dontFill: this.forPrint,
            fillHorizontalOnly: this.autoHeight,
            name: 'eGridPanel',
            componentRecipes: this.componentRecipes
        });

        this.layout.addSizeChangeListener(this.setBodyAndHeaderHeights.bind(this));
        this.layout.addSizeChangeListener(this.setLeftAndRightBounds.bind(this));

        this.addScrollListener();

        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }

        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }

        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addMouseListeners();
        this.addKeyboardEvents();
        this.addBodyViewportListener();
        this.addStopEditingWhenGridLosesFocus();
        this.mockContextMenuForIPad();
        this.addRowDragListener();

        if (this.$scope) {
            this.addAngularApplyCheck();
        }

        this.onDisplayedColumnsWidthChanged();
    }

    private addRowDragListener(): void {

        let rowDragFeature = new RowDragFeature(this.eBody);
        this.context.wireBean(rowDragFeature);

        this.dragAndDropService.addDropTarget(rowDragFeature);
    }

    private addStopEditingWhenGridLosesFocus(): void {
        if (this.gridOptionsWrapper.isStopEditingWhenGridLosesFocus()) {
            this.addDestroyableEventListener(this.eBody, 'focusout', (event: FocusEvent)=> {

                // this is the element the focus is moving to
                let elementWithFocus = event.relatedTarget;

                // see if the element the focus is going to is part of the grid
                let clickInsideGrid = false;
                let pointer: any = elementWithFocus;

                while (_.exists(pointer) && !clickInsideGrid) {

                    let isPopup = !!this.gridOptionsWrapper.getDomData(pointer, PopupEditorWrapper.DOM_KEY_POPUP_EDITOR_WRAPPER);
                    let isBody = this.eBody == pointer;

                    clickInsideGrid = isPopup || isBody;

                    pointer = pointer.parentNode;
                }

                if (!clickInsideGrid) {
                    this.rowRenderer.stopEditing();
                }
            })
        }
    }

    private addAngularApplyCheck(): void {
        // this makes sure if we queue up requests, we only execute oe
        let applyTriggered = false;

        let listener = ()=> {
            // only need to do one apply at a time
            if (applyTriggered) { return; }
            applyTriggered = true; // mark 'need apply' to true
            setTimeout( ()=> {
                applyTriggered = false;
                this.$scope.$apply();
            }, 0);
        };

        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addDestroyableEventListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.eRoot.addEventListener('dragstart', (event: MouseEvent)=> {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }

    private addEventListeners(): void {

        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, this.setBodyAndHeaderHeights.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, this.setBodyAndHeaderHeights.bind(this));
    }

    private addDragListeners(): void {
        if (this.forPrint // no range select when doing 'for print'
            || !this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
            || _.missing(this.rangeController)) { // no range selection if not enterprise version
            return;
        }

        let containers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
            this.eFloatingTop, this.eFloatingBottom];

        containers.forEach(container => {
            let params: DragListenerParams = {
                type: 'cell',
                dragStartPixels: 0,
                eElement: container,
                onDragStart: this.rangeController.onDragStart.bind(this.rangeController),
                onDragStop: this.rangeController.onDragStop.bind(this.rangeController),
                onDragging: this.rangeController.onDragging.bind(this.rangeController)
            };

            this.dragService.addDragSource(params);

            this.addDestroyFunc( ()=> this.dragService.removeDragSource(params) );
        });
    }

    private addMouseListeners(): void {
        let eventNames = ['click','mousedown','dblclick','contextmenu','mouseover','mouseout'];
        eventNames.forEach( eventName => {
            let listener = this.processMouseEvent.bind(this, eventName);
            this.eAllCellContainers.forEach( container =>
                this.addDestroyableEventListener(container, eventName, listener)
            );
        });
    }

    private addKeyboardEvents(): void {
        let eventNames = ['keydown','keypress'];
        eventNames.forEach( eventName => {
            let listener = this.processKeyboardEvent.bind(this, eventName);
            this.eAllCellContainers.forEach( container => {
                this.addDestroyableEventListener(container, eventName, listener);
            });
        });
    }

    private addBodyViewportListener(): void {
        // we never add this when doing 'forPrint'
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows are displayed, or user simply clicks outside of a cell
        let listener = (mouseEvent: MouseEvent) => {
            let target = _.getTarget(mouseEvent);
            if (target===this.eBodyViewport || target===this.ePinnedLeftColsViewport || target===this.ePinnedRightColsViewport) {
                // show it
                this.onContextMenu(mouseEvent, null, null, null, null);
                this.preventDefaultOnContextMenu(mouseEvent);
            }
        };

        //For some reason listening only to this.eBody doesnt work... Maybe because the event is consumed somewhere else?
        //In any case, not expending much time on this, if anyome comes accross this and knows how to make this work with
        //one listener please go ahead and change it...
        this.addDestroyableEventListener(this.eBodyViewport, 'contextmenu', listener);
        this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'contextmenu', listener);
        this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'contextmenu', listener);

    }

    private getRowForEvent(event: Event): RowComp {

        let sourceElement = _.getTarget(event);

        while (sourceElement) {

            let renderedRow = this.gridOptionsWrapper.getDomData(sourceElement, RowComp.DOM_DATA_KEY_RENDERED_ROW);
            if (renderedRow) {
                return renderedRow;
            }

            sourceElement = sourceElement.parentElement;
        }

        return null;
    }

    private processKeyboardEvent(eventName: string, keyboardEvent: KeyboardEvent): void {
        let renderedCell = this.mouseEventService.getRenderedCellForEvent(keyboardEvent);

        if (!renderedCell) { return; }

        switch (eventName) {
            case 'keydown':
                // first see if it's a scroll key, page up / down, home / end etc
                let wasScrollKey = this.navigationService.handlePageScrollingKey(keyboardEvent);

                // if not a scroll key, then we pass onto cell
                if (!wasScrollKey) {
                    renderedCell.onKeyDown(keyboardEvent);
                }

                break;
            case 'keypress':
                renderedCell.onKeyPress(keyboardEvent);
                break;
        }
    }


    // gets called by rowRenderer when new data loaded, as it will want to scroll
    // to the top
    public scrollToTop(): void {
        if (!this.forPrint) {
            this.getPrimaryScrollViewport().scrollTop = 0;
        }
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        if (!this.mouseEventService.isEventFromThisGrid(mouseEvent)) return;
        if (_.isStopPropagationForAgGrid(mouseEvent)) { return; }

        let rowComp = this.getRowForEvent(mouseEvent);
        let cellComp = this.mouseEventService.getRenderedCellForEvent(mouseEvent);

        if (eventName === "contextmenu") {
            this.handleContextMenuMouseEvent(mouseEvent, null, rowComp, cellComp);
        } else {
            if (cellComp) cellComp.onMouseEvent(eventName, mouseEvent);
            if (rowComp) rowComp.onMouseEvent(eventName, mouseEvent);
        }

        this.preventDefaultOnContextMenu(mouseEvent);
    }

    private mockContextMenuForIPad(): void {

        // we do NOT want this when not in ipad, otherwise we will be doing
        if (!_.isUserAgentIPad()) {return;}

        this.eAllCellContainers.forEach( container => {
            let touchListener = new TouchListener(container);
            let longTapListener = (event: LongTapEvent)=> {

                let rowComp = this.getRowForEvent(event.touchEvent);
                let cellComp = this.mouseEventService.getRenderedCellForEvent(event.touchEvent);

                this.handleContextMenuMouseEvent(null, event.touchEvent, rowComp, cellComp);
            };
            this.addDestroyableEventListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);
            this.addDestroyFunc( ()=> touchListener.destroy() );
        });

    }

    private handleContextMenuMouseEvent(mouseEvent: MouseEvent, touchEvent: TouchEvent, rowComp: RowComp, cellComp: CellComp) {
        let rowNode = rowComp ? rowComp.getRowNode() : null;
        let column = cellComp ? cellComp.getColumn() : null;
        let value = null;

        if (column) {
            let event = mouseEvent ? mouseEvent : touchEvent;
            cellComp.dispatchCellContextMenuEvent(event);
            value = this.valueService.getValue(column, rowNode);
        }

        this.onContextMenu(mouseEvent, touchEvent, rowNode, column, value);
    }

    private onContextMenu(mouseEvent: MouseEvent, touchEvent: TouchEvent, rowNode: RowNode, column: Column, value: any): void {

        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }

        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
            let eventOrTouch: (MouseEvent | Touch) = mouseEvent ? mouseEvent : touchEvent.touches[0];
            this.contextMenuFactory.showMenu(rowNode, column, value, eventOrTouch);
            let event = mouseEvent ? mouseEvent : touchEvent;
            event.preventDefault();
        }
    }

    private preventDefaultOnContextMenu(mouseEvent: MouseEvent): void {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        if (this.gridOptionsWrapper.isSuppressMiddleClickScrolls() && mouseEvent.which === 2) {
            mouseEvent.preventDefault();
        }
    }

    private addShortcutKeyListeners(): void {
        this.eAllCellContainers.forEach( (container)=> {
            container.addEventListener('keydown', (event: KeyboardEvent)=> {

                // if the cell the event came from is editing, then we do not
                // want to do the default shortcut keys, otherwise the editor
                // (eg a text field) would not be able to do the normal cut/copy/paste
                let renderedCell = this.mouseEventService.getRenderedCellForEvent(event);
                if (renderedCell && renderedCell.isEditing()) {
                    return;
                }

                // for copy / paste, we don't want to execute when the event
                // was from a child grid (happens in master detail)
                if (!this.mouseEventService.isEventFromThisGrid(event)) {
                    return;
                }

                if (event.ctrlKey || event.metaKey) {
                    switch (event.which) {
                        case Constants.KEY_A: return this.onCtrlAndA(event);
                        case Constants.KEY_C: return this.onCtrlAndC(event);
                        case Constants.KEY_V: return this.onCtrlAndV(event);
                        case Constants.KEY_D: return this.onCtrlAndD(event);
                    }
                }
            });
        })
    }

    private onCtrlAndA(event: KeyboardEvent): boolean {
        if (this.rangeController && this.paginationProxy.isRowsToRender()) {
            let rowEnd: number;
            let floatingStart: string;
            let floatingEnd: string;

            if (this.pinnedRowModel.isEmpty(Constants.PINNED_TOP)) {
                floatingStart = null;
            } else {
                floatingStart = Constants.PINNED_TOP;
            }

            if (this.pinnedRowModel.isEmpty(Constants.PINNED_BOTTOM)) {
                floatingEnd = null;
                rowEnd = this.paginationProxy.getTotalRowCount() - 1;
            } else {
                floatingEnd = Constants.PINNED_BOTTOM;
                rowEnd = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            }

            let allDisplayedColumns = this.columnController.getAllDisplayedColumns();
            if (_.missingOrEmpty(allDisplayedColumns)) { return; }
            this.rangeController.setRange({
                rowStart: 0,
                floatingStart: floatingStart,
                rowEnd: rowEnd,
                floatingEnd: floatingEnd,
                columnStart: allDisplayedColumns[0],
                columnEnd: allDisplayedColumns[allDisplayedColumns.length-1]
            });
        }
        event.preventDefault();
        return false;
    }

    private onCtrlAndC(event: KeyboardEvent): boolean {
        if (!this.clipboardService) { return; }

        let focusedCell = this.focusedCellController.getFocusedCell();

        this.clipboardService.copyToClipboard();
        event.preventDefault();

        // the copy operation results in loosing focus on the cell,
        // because of the trickery the copy logic uses with a temporary
        // widget. so we set it back again.
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.floating, true);
        }

        return false;
    }

    private onCtrlAndV(event: KeyboardEvent): boolean {
        if (!this.rangeController) { return; }

        this.clipboardService.pasteFromClipboard();
        return false;
    }

    private onCtrlAndD(event: KeyboardEvent): boolean {
        if (!this.clipboardService) { return; }
        this.clipboardService.copyRangeDown();
        event.preventDefault();
        return false;
    }

    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
    public ensureIndexVisible(index: any, position?: string) {
        // if for print or auto height, everything is always visible
        if (this.gridOptionsWrapper.isForPrint() || this.gridOptionsWrapper.isAutoHeight()) { return; }

        this.logger.log('ensureIndexVisible: ' + index);
        let rowCount = this.paginationProxy.getTotalRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        this.paginationProxy.goToPageWithIndex(index);

        let nodeAtIndex = this.paginationProxy.getRow(index);
        let pixelOffset = this.paginationProxy.getPixelOffset();
        let rowTopPixel = nodeAtIndex.rowTop - pixelOffset;
        let rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;

        let vRange = this.getVerticalPixelRange();

        let vRangeTop = vRange.top;
        let vRangeBottom = vRange.bottom;

        let scrollShowing = this.isHorizontalScrollShowing();

        if (scrollShowing) {
            vRangeBottom -= this.scrollWidth;
        }

        let rowToHighlightHeight: number = rowBottomPixel - rowTopPixel;
        let viewportHeight = vRangeBottom - vRangeTop;
        let halfScreenHeight: number = (viewportHeight /2) + (rowToHighlightHeight / 2);

        let eViewportToScroll = this.getPrimaryScrollViewport();
        let newScrollPosition: number;

        switch (position) {
            case 'top':
                newScrollPosition = rowTopPixel;
                break;
            case 'bottom':
                newScrollPosition = rowBottomPixel - viewportHeight;
                break;
            case 'middle':
                newScrollPosition = halfScreenHeight;
                // The if/else logic here protects us from over scrolling
                // ie: Trying to scroll past the row (ie ensureNodeVisible (0, 'middle'))
                newScrollPosition = newScrollPosition > rowTopPixel ? rowTopPixel : newScrollPosition;
                break;
            default:
                newScrollPosition = rowTopPixel;
                let viewportScrolledPastRow = vRangeTop > rowTopPixel;
                let viewportScrolledBeforeRow = vRangeBottom < rowBottomPixel;

                if (viewportScrolledPastRow) {
                    // if row is before, scroll up with row at top
                    newScrollPosition = rowTopPixel;
                } else if (viewportScrolledBeforeRow) {
                    // if row is below, scroll down with row at bottom
                    let viewportHeight = vRangeBottom - vRangeTop;
                    newScrollPosition = rowBottomPixel - viewportHeight;
                } else {
                    // row already in view, and top/middle/bottom not specified, so do nothing.
                    newScrollPosition = null;
                }
                break;
        }

        // this means the row is already in view, and we don't need to scroll
        if (newScrollPosition===null) { return; }

        eViewportToScroll.scrollTop = newScrollPosition;
        this.rowRenderer.redrawAfterScroll();
    }

    public getPrimaryScrollViewport(): HTMLElement {
        if (this.enableRtl && this.columnController.isPinningLeft()) {
            return this.ePinnedLeftColsViewport;
        } else if (!this.enableRtl && this.columnController.isPinningRight()) {
            return this.ePinnedRightColsViewport;
        } else {
            return this.eBodyViewport;
        }
    }

    // + moveColumnController
    public getCenterWidth(): number {
        return this.eBodyViewport.clientWidth;
    }

    public isHorizontalScrollShowing(): boolean {
        let result = _.isHorizontalScrollShowing(this.eBodyViewport);
        return result;
    }

    private isVerticalScrollShowing(): boolean {
        if (this.columnController.isPinningRight()) {
            return _.isVerticalScrollShowing(this.ePinnedRightColsViewport);
        } else {
            return _.isVerticalScrollShowing(this.eBodyViewport);
        }
    }

    private isBodyVerticalScrollShowing(): boolean {
        // if the scroll is on the pinned panel, then it is never in the center panel.
        // if LRT, then pinning right means scroll NOT on center
        if (!this.enableRtl && this.columnController.isPinningRight()) { return false; }
        // if RTL, then pinning left means scroll NOT on center
        if (this.enableRtl && this.columnController.isPinningLeft()) { return false; }

        return _.isVerticalScrollShowing(this.eBodyViewport);
    }

    // gets called every 500 ms. we use this to set padding on right pinned column
    public periodicallyCheck(): void {
        if (this.forPrint) { return; }
        this.setBottomPaddingOnPinnedRight();
        this.setMarginOnFullWidthCellContainer();
        this.setScrollShowing();
    }

    private setScrollShowing(): void {

        let params: SetScrollsVisibleParams = {
            vBody: false,
            hBody: false,
            vPinnedLeft: false,
            vPinnedRight: false
        };

        if (this.enableRtl) {
            if (this.columnController.isPinningLeft()) {
                params.vPinnedLeft = this.forPrint ? false : _.isVerticalScrollShowing(this.ePinnedLeftColsViewport);
            } else {
                params.vBody = _.isVerticalScrollShowing(this.eBodyViewport);
            }
        } else {
            if (this.columnController.isPinningRight()) {
                params.vPinnedRight = this.forPrint ? false : _.isVerticalScrollShowing(this.ePinnedRightColsViewport);
            } else {
                params.vBody = _.isVerticalScrollShowing(this.eBodyViewport);
            }
        }

        params.hBody = _.isHorizontalScrollShowing(this.eBodyViewport);

        this.scrollVisibleService.setScrollsVisible(params);
    }

    // the pinned container needs extra space at the bottom, some blank space, otherwise when
    // vertically scrolled all the way down, the last row will be hidden behind the scrolls.
    // this extra padding allows the last row to be lifted above the bottom scrollbar.
    private setBottomPaddingOnPinnedRight(): void {
        if (this.forPrint) { return; }

        if (this.columnController.isPinningRight()) {
            let bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (bodyHorizontalScrollShowing) {
                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
            } else {
                this.ePinnedRightColsContainer.style.marginBottom = '';
            }
        }
    }

    private setMarginOnFullWidthCellContainer(): void {
        if (this.forPrint) { return; }

        // if either right or bottom scrollbars are showing, we need to make sure the
        // fullWidthCell panel isn't covering the scrollbars. originally i tried to do this using
        // margin, but the overflow was not getting clipped and going into the margin,
        // so used border instead. dunno why it works, trial and error found the solution.
        if (this.enableRtl) {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderLeft = this.scrollWidth + 'px solid transparent';
            } else {
                this.eFullWidthCellViewport.style.borderLeft = '';
            }
        } else {
            if (this.isVerticalScrollShowing()) {
                this.eFullWidthCellViewport.style.borderRight = this.scrollWidth + 'px solid transparent';
            } else {
                this.eFullWidthCellViewport.style.borderRight = '';
            }
        }
        if (this.isHorizontalScrollShowing()) {
            this.eFullWidthCellViewport.style.borderBottom = this.scrollWidth + 'px solid transparent';
        } else {
            this.eFullWidthCellViewport.style.borderBottom = '';
        }
    }

    public ensureColumnVisible(key: any) {
        // if for print, everything is always visible
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        let column = this.columnController.getGridColumn(key);

        if (!column) { return; }

        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a '+column.getPinned()+' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }

        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }

        let colLeftPixel = column.getLeft();
        let colRightPixel = colLeftPixel + column.getActualWidth();

        let viewportWidth = this.eBodyViewport.clientWidth;
        let scrollPosition = this.getBodyViewportScrollLeft();

        let bodyWidth = this.columnController.getBodyContainerWidth();

        let viewportLeftPixel: number;
        let viewportRightPixel: number;

        // the logic of working out left and right viewport px is both here and in the ColumnController,
        // need to refactor it out to one place
        if (this.enableRtl) {
            viewportLeftPixel = bodyWidth - scrollPosition - viewportWidth;
            viewportRightPixel = bodyWidth - scrollPosition;
        } else {
            viewportLeftPixel = scrollPosition;
            viewportRightPixel = viewportWidth + scrollPosition;
        }

        let viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        let viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
        let colToSmallForViewport = viewportWidth < column.getActualWidth();

        let alignColToLeft = viewportScrolledPastCol || colToSmallForViewport;
        let alignColToRight = viewportScrolledBeforeCol;

        if (alignColToLeft) {
            // if viewport's left side is after col's left side, scroll left to pull col into viewport at left
            if (this.enableRtl) {
                let newScrollPosition = bodyWidth - viewportWidth - colLeftPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            } else {
                this.setBodyViewportScrollLeft(colLeftPixel);
            }
        } else if (alignColToRight) {
            // if viewport's right side is before col's right side, scroll right to pull col into viewport at right
            if (this.enableRtl) {
                let newScrollPosition = bodyWidth - colRightPixel;
                this.setBodyViewportScrollLeft(newScrollPosition);
            } else {
                let newScrollPosition = colRightPixel - viewportWidth;
                this.setBodyViewportScrollLeft(newScrollPosition);
            }
        } else {
            // otherwise, col is already in view, so do nothing
        }

        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within ag-Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.setLeftAndRightBounds();
    }

    public showLoadingOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.layout.showLoadingOverlay();
        }
    }

    public showNoRowsOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.layout.showNoRowsOverlay();
        }
    }

    public hideOverlay(): void {
        this.layout.hideOverlay();
    }

    private getWidthForSizeColsToFit() {
        let availableWidth = this.eBody.clientWidth;
        // if pinning right, then the scroll bar can show, however for some reason
        // it overlays the grid and doesn't take space. so we are only interested
        // in the body scroll showing.
        let removeVerticalScrollWidth = this.isVerticalScrollShowing();
        if (removeVerticalScrollWidth) {
            availableWidth -= this.scrollWidth;
        }
        return availableWidth;
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(nextTimeout?: number) {
        let availableWidth = this.getWidthForSizeColsToFit();
        if (availableWidth>0) {
            this.columnController.sizeColumnsToFit(availableWidth, "sizeColumnsToFit");
        } else {
            if (nextTimeout===undefined) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(100);
                }, 0);
            } else if (nextTimeout===100) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(500);
                }, 100);
            } else if (nextTimeout===500) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(-1);
                }, 500);
            } else {
                console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
                    'zero width, maybe the grid is not visible yet on the screen?');
            }
        }
    }

    public getBodyContainer(): HTMLElement {
        return this.eBodyContainer;
    }

    public getDropTargetBodyContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        } else {
            return [this.eBodyViewport, this.eFloatingTopViewport, this.eFloatingBottomViewport];
        }
    }

    public getBodyViewport() {
        return this.eBodyViewport;
    }

    public getDropTargetLeftContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [];
        } else {
            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
        }
    }

    public getDropTargetPinnedRightContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [];
        } else {
            return [this.ePinnedRightColsViewport, this.ePinnedRightFloatingBottom, this.ePinnedRightFloatingTop];
        }
    }

    public getHeaderContainer() {
        return this.eHeaderContainer;
    }

    public getHeaderOverlay() {
        return this.eHeaderOverlay;
    }

    public getRoot() {
        return this.eRoot;
    }

    public getPinnedLeftHeader() {
        return this.ePinnedLeftHeader;
    }

    public getPinnedRightHeader() {
        return this.ePinnedRightHeader;
    }

    private queryHtmlElement(selector: string): HTMLElement {
        return <HTMLElement> this.eRoot.querySelector(selector);
    }

    private loadTemplate(): void {
        // the template we use is different when doing 'for print'
        let template: string;
        if (this.forPrint) {
            template = GRID_PANEL_FOR_PRINT_TEMPLATE;
        } else if (this.autoHeight) {
            template = GRID_PANEL_AUTO_HEIGHT_TEMPLATE;
        } else {
            template = GRID_PANEL_NORMAL_TEMPLATE;
        }
        this.eRoot = <HTMLElement> _.loadTemplate(template);
    }

    private findElements() {

        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');

            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];

            let containers: RowContainerComponents = {
                body: new RowContainerComponent( {eContainer: this.eBodyContainer} ),
                fullWidth: <RowContainerComponent> null,
                pinnedLeft: <RowContainerComponent> null,
                pinnedRight: <RowContainerComponent> null,

                floatingTop: new RowContainerComponent( {eContainer: this.eFloatingTopContainer} ),
                floatingTopPinnedLeft: <RowContainerComponent> null,
                floatingTopPinnedRight: <RowContainerComponent> null,
                floatingTopFullWidth: <RowContainerComponent> null,

                floatingBottom: new RowContainerComponent( {eContainer: this.eFloatingBottomContainer} ),
                floatingBottomPinnedLeft: <RowContainerComponent> null,
                floatingBottomPinnedRight: <RowContainerComponent> null,
                floatingBottomFullWith: <RowContainerComponent> null
            };
            this.rowContainerComponents = containers;

            // when doing forPrint, we don't have any fullWidth containers, instead we add directly to the main
            // containers. this works in forPrint only as there are no pinned columns (no need for fullWidth to
            // span pinned columns) and the rows are already the full width of the grid (the reason for fullWidth)
            containers.fullWidth = containers.body;
            containers.floatingBottomFullWith = containers.floatingBottom;
            containers.floatingTopFullWidth = containers.floatingTop;

        } else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
            this.eFullWidthCellContainer = this.queryHtmlElement('.ag-full-width-container');
            this.eFullWidthCellViewport = this.queryHtmlElement('.ag-full-width-viewport');
            this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
            this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
            this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
            this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
            this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
            this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
            this.eHeader = this.queryHtmlElement('.ag-header');
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eHeaderOverlay = this.queryHtmlElement('.ag-header-overlay');
            this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');

            this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
            this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
            this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingTopViewport = this.queryHtmlElement('.ag-floating-top-viewport');
            this.eFloatingTopFullWidthCellContainer = this.queryHtmlElement('.ag-floating-top-full-width-container');

            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');
            this.eFloatingBottomFullWidthCellContainer = this.queryHtmlElement('.ag-floating-bottom-full-width-container');

            this.eAllCellContainers = [
                this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
                this.eFloatingTop, this.eFloatingBottom, this.eFullWidthCellContainer];

            this.rowContainerComponents = {
                body: new RowContainerComponent({eContainer: this.eBodyContainer, eViewport: this.eBodyViewport, body: true}),
                fullWidth: new RowContainerComponent({eContainer: this.eFullWidthCellContainer, hideWhenNoChildren: true, eViewport: this.eFullWidthCellViewport}),
                pinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftColsContainer, eViewport: this.ePinnedLeftColsViewport}),
                pinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightColsContainer, eViewport: this.ePinnedRightColsViewport}),

                floatingTop: new RowContainerComponent({eContainer: this.eFloatingTopContainer}),
                floatingTopPinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftFloatingTop}),
                floatingTopPinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightFloatingTop}),
                floatingTopFullWidth: new RowContainerComponent({eContainer: this.eFloatingTopFullWidthCellContainer, hideWhenNoChildren: true}),

                floatingBottom: new RowContainerComponent({eContainer: this.eFloatingBottomContainer}),
                floatingBottomPinnedLeft: new RowContainerComponent({eContainer: this.ePinnedLeftFloatingBottom}),
                floatingBottomPinnedRight: new RowContainerComponent({eContainer: this.ePinnedRightFloatingBottom}),
                floatingBottomFullWith: new RowContainerComponent({eContainer: this.eFloatingBottomFullWidthCellContainer, hideWhenNoChildren: true}),
            };

            this.addMouseWheelEventListeners();
            this.suppressScrollOnFloatingRow();
        }

        _.iterateObject(this.rowContainerComponents, (key: string, container: RowContainerComponent)=> {
            if (container) {
                this.context.wireBean(container);
            }
        });
    }

    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    private suppressScrollOnFloatingRow(): void {
        let resetTopScroll = () => this.eFloatingTopViewport.scrollLeft = 0;
        let resetBottomScroll = () => this.eFloatingTopViewport.scrollLeft = 0;

        this.addDestroyableEventListener(this.eFloatingTopViewport, 'scroll', resetTopScroll);
        this.addDestroyableEventListener(this.eFloatingBottomViewport, 'scroll', resetBottomScroll);
    }

    public getRowContainers(): RowContainerComponents {
        return this.rowContainerComponents;
    }

    private addMouseWheelEventListeners(): void {

        // IE9, Chrome, Safari, Opera use 'mousewheel', Firefox uses 'DOMMouseScroll'

        this.addDestroyableEventListener(this.eBodyViewport, 'mousewheel', this.centerMouseWheelListener.bind(this));
        this.addDestroyableEventListener(this.eBodyViewport, 'DOMMouseScroll', this.centerMouseWheelListener.bind(this));

        if (this.enableRtl) {
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        } else {
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'mousewheel', this.genericMouseWheelListener.bind(this));
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'DOMMouseScroll', this.genericMouseWheelListener.bind(this));
        }
    }

    public getHeaderViewport(): HTMLElement {
        return this.eHeaderViewport;
    }

    private centerMouseWheelListener(event: any): boolean {
        // we are only interested in mimicking the mouse wheel if we are not scrolling on the middle,
        // otherwise the body has scrolls and the mouse wheel works for free
        let bodyVScrollShowing = this.isBodyVerticalScrollActive();

        if (!bodyVScrollShowing) {
            let targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
            return this.generalMouseWheelListener(event, targetPanel);
        }
    }

    // used for listening to mouse wheel events on 1) left pinned and also the 2) fullWidthCell components.
    // the fullWidthCell listener is added in renderedRow, hence public.
    public genericMouseWheelListener(event: any): boolean {
        let targetPanel: HTMLElement;

        let bodyVScrollActive = this.isBodyVerticalScrollActive();
        if (bodyVScrollActive) {
            targetPanel = this.eBodyViewport;
        } else {
            targetPanel = this.enableRtl ? this.ePinnedLeftColsViewport : this.ePinnedRightColsViewport;
        }

        return this.generalMouseWheelListener(event, targetPanel);
    }

    private generalMouseWheelListener(event: any, targetPanel: HTMLElement): boolean {
        let wheelEvent = _.normalizeWheel(event);

        // we need to detect in which direction scroll is happening to allow trackpads scroll horizontally
        // horizontal scroll
        if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
            let newLeftPosition = this.eBodyViewport.scrollLeft + wheelEvent.pixelX;
            this.eBodyViewport.scrollLeft = newLeftPosition;
        }
        // vertical scroll
        else {
            let newTopPosition = targetPanel.scrollTop + wheelEvent.pixelY;
            targetPanel.scrollTop = newTopPosition;
        }

        // allow the option to pass mouse wheel events to the browser
        // https://github.com/ag-grid/ag-grid/issues/800
        // in the future, this should be tied in with 'forPrint' option, or have an option 'no vertical scrolls'
        let shouldPreventDefault = !this.gridOptionsWrapper.isAutoHeight() && !this.gridOptionsWrapper.isSuppressPreventDefaultOnMouseWheel();
        if (shouldPreventDefault) {
            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
        }

        return false;
    }

    public onDisplayedColumnsChanged(): void {
        this.setPinnedContainersVisible();
        this.setBodyAndHeaderHeights();
        this.setLeftAndRightBounds();
    }

    private onDisplayedColumnsWidthChanged(): void {
        this.setWidthsOfContainers();
        this.setLeftAndRightBounds();
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    }

    private onScrollVisibilityChanged(): void {
        this.setWidthsOfContainers();
    }

    private setWidthsOfContainers(): void {
        let mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;

        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }

        this.eFloatingBottomContainer.style.width = mainRowWidth;
        this.eFloatingTopContainer.style.width = mainRowWidth;

        this.setPinnedLeftWidth();
        this.setPinnedRightWidth();
    }

    private setPinnedLeftWidth(): void {
        let pinnedLeftWidth = this.scrollVisibleService.getPinnedLeftWidth() + 'px';
        let pinnedLeftWidthWithScroll = this.scrollVisibleService.getPinnedLeftWithScrollWidth() + 'px';

        this.ePinnedLeftColsViewport.style.width = pinnedLeftWidthWithScroll;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidthWithScroll;

        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidthWithScroll;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidthWithScroll;

        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
    }

    private setPinnedRightWidth(): void {
        let pinnedRightWidth = this.scrollVisibleService.getPinnedRightWidth() + 'px';
        let pinnedRightWidthWithScroll = this.scrollVisibleService.getPinnedRightWithScrollWidth() + 'px';

        this.ePinnedRightColsViewport.style.width = pinnedRightWidthWithScroll;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidthWithScroll;

        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidthWithScroll;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidthWithScroll;

        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
    }

    private setPinnedContainersVisible() {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }

        let changeDetected = false;

        // if we are v scrolling, then one of these will have the scroll position.
        // we us this inside the if(changedDetected), so we don't always use it, however
        // it is changed when we make a pinned panel not visible, so we have to check it
        // before we change display on the pinned panels
        let scrollTop = Math.max(
            this.eBodyViewport.scrollTop,
            this.ePinnedLeftColsViewport.scrollTop,
            this.ePinnedRightColsViewport.scrollTop);

        let showLeftPinned = this.columnController.isPinningLeft();
        if (showLeftPinned !== this.pinningLeft) {
            this.pinningLeft = showLeftPinned;
            this.ePinnedLeftHeader.style.display = showLeftPinned ? 'inline-block' : 'none';
            this.ePinnedLeftColsViewport.style.display = showLeftPinned ? 'inline' : 'none';
            changeDetected = true;
        }

        let showRightPinned = this.columnController.isPinningRight();
        if (showRightPinned !== this.pinningRight) {
            this.pinningRight = showRightPinned;
            this.ePinnedRightHeader.style.display = showRightPinned ? 'inline-block' : 'none';
            this.ePinnedRightColsViewport.style.display = showRightPinned ? 'inline' : 'none';
            changeDetected = true;
        }

        if (changeDetected) {
            let bodyVScrollActive = this.isBodyVerticalScrollActive();
            this.eBodyViewport.style.overflowY = bodyVScrollActive ? 'auto' : 'hidden';

            // the body either uses it's scroll (when scrolling) or it's style.top
            // (when following the scroll of a pinned section), so we need to set it
            // back when changing from one to the other
            if (bodyVScrollActive) {
                this.setFakeScroll(this.eBodyContainer, 0);
                // this.eBodyContainer.style.top = '0px';
            } else {
                this.eBodyViewport.scrollTop = 0;
            }

            // when changing the primary scroll viewport, we copy over the scroll position,
            // eg if body was getting scrolled and we were at position 100px, then we start
            // pinning and pinned viewport is now the primary, we need to set it to 100px
            let primaryScrollViewport = this.getPrimaryScrollViewport();
            primaryScrollViewport.scrollTop = scrollTop;
            // this adjusts the scroll position of all the faking panels. they should already
            // be correct except body which has potentially just turned to be fake.
            this.fakeVerticalScroll(scrollTop);
        }

    }

    // init, layoutChanged, floatingDataChanged, headerHeightChanged
    public setBodyAndHeaderHeights(): void {
        if (this.forPrint) {
            // if doing 'for print' or 'auto height', then the header and footers are laid
            // out naturally by the browser. it's whatever height that's needed to fit.
            return;
        }

        let heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }

        let headerRowCount = this.columnController.getHeaderRowCount();

        let totalHeaderHeight: number;
        let numberOfFloating = 0;
        let groupHeight:number;
        let headerHeight:number;
        if (!this.columnController.isPivotMode()){
            _.removeCssClass(this.eHeader, 'ag-pivot-on');
            _.addCssClass(this.eHeader, 'ag-pivot-off');
            if (this.gridOptionsWrapper.isFloatingFilter()){
                headerRowCount ++;
            }
            numberOfFloating = (this.gridOptionsWrapper.isFloatingFilter()) ? 1 : 0;
            groupHeight = this.gridOptionsWrapper.getGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        } else {
            _.removeCssClass(this.eHeader, 'ag-pivot-off');
            _.addCssClass(this.eHeader, 'ag-pivot-on');
            numberOfFloating = 0;
            groupHeight = this.gridOptionsWrapper.getPivotGroupHeaderHeight();
            headerHeight = this.gridOptionsWrapper.getPivotHeaderHeight();
        }
        let numberOfNonGroups = 1 + numberOfFloating;
        let numberOfGroups = headerRowCount - numberOfNonGroups;

        totalHeaderHeight = numberOfFloating * this.gridOptionsWrapper.getFloatingFiltersHeight();
        totalHeaderHeight += numberOfGroups * groupHeight;
        totalHeaderHeight += headerHeight;

        this.eHeader.style['height'] = totalHeaderHeight + 'px';

        // if we are doing auto-height, we only size the header, we don't size the
        // other parts as we use the normal browser layout for that
        if (this.autoHeight) {
            return;
        }

        // padding top covers the header and the pinned rows on top
        let floatingTopHeight = this.pinnedRowModel.getPinnedTopTotalHeight();
        let paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom pinned rows
        let floatingBottomHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();
        let floatingBottomTop = heightOfContainer - floatingBottomHeight;

        let bodyHeight = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;

        this.eBody.style.top = paddingTop + 'px';
        this.eBody.style.height = bodyHeight + 'px';

        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';

        this.ePinnedLeftColsViewport.style.height = bodyHeight + 'px';
        this.ePinnedRightColsViewport.style.height = bodyHeight + 'px';

        // bodyHeight property is used by pagination service, that may change number of rows
        // in this page based on the height of the grid
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            let event: BodyHeightChangedEvent = {
                type: Events.EVENT_BODY_HEIGHT_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public getBodyHeight(): number {
        return this.bodyHeight;
    }

    public setHorizontalScrollPosition(hScrollPosition: number): void {
        this.eBodyViewport.scrollLeft = hScrollPosition;

        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        if (this.nextScrollLeft !== hScrollPosition) {
            this.nextScrollLeft = hScrollPosition;
            this.doHorizontalScroll();
        }
    }

    public setVerticalScrollPosition(vScrollPosition: number): void {
        this.eBodyViewport.scrollTop = vScrollPosition;
    }

    // tries to scroll by pixels, but returns what the result actually was
    public scrollHorizontally(pixels: number): number {
        let oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        let newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    }

    // tries to scroll by pixels, but returns what the result actually was
    public scrollVertically(pixels: number): number {
        let oldScrollPosition = this.eBodyViewport.scrollTop;
        this.setVerticalScrollPosition(oldScrollPosition + pixels);
        let newScrollPosition = this.eBodyViewport.scrollTop;
        return newScrollPosition - oldScrollPosition;
    }

    private addScrollListener() {
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }

        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', this.onBodyScroll.bind(this));

        // below we add two things:
        // pinnedScrollListener -> when pinned panel with scrollbar gets scrolled, it updates body and other pinned
        // suppressScroll -> stops scrolling when pinned panel was moved - which can only happen when user is navigating
        //     in the pinned container, as the pinned col should never scroll. so we rollback the scroll on the pinned.

        let onPinnedLeftVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedLeftColsViewport);
        let onPinnedRightVerticalScroll = this.onVerticalScroll.bind(this, this.ePinnedRightColsViewport);

        if (this.enableRtl) {
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', onPinnedLeftVerticalScroll);

            let suppressRightScroll = () => this.ePinnedRightColsViewport.scrollTop = 0;
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', suppressRightScroll);
        } else {
            this.addDestroyableEventListener(this.ePinnedRightColsViewport, 'scroll', onPinnedRightVerticalScroll);

            let suppressLeftScroll = () => this.ePinnedLeftColsViewport.scrollTop = 0;
            this.addDestroyableEventListener(this.ePinnedLeftColsViewport, 'scroll', suppressLeftScroll);
        }

        let suppressCenterScroll = () => {
            if (this.getPrimaryScrollViewport()!==this.eBodyViewport) {
                this.eBodyViewport.scrollTop = 0;
            }
        };

        this.addDestroyableEventListener(this.eBodyViewport, 'scroll', suppressCenterScroll);

        this.addIEPinFix(onPinnedRightVerticalScroll, onPinnedLeftVerticalScroll);
    }

    private onBodyScroll(): void {
        this.onBodyHorizontalScroll();
        this.onBodyVerticalScroll();
    }

    private onBodyHorizontalScroll(): void {

        let scrollLeft = this.eBodyViewport.scrollLeft;

        if (this.nextScrollLeft !== scrollLeft) {
            this.nextScrollLeft = scrollLeft;
            if (this.useAnimationFrame) {
                this.animationFrameService.schedule();
            } else {
                this.doHorizontalScroll();
            }
        }
    }

    private doHorizontalScroll(): void {
        this.scrollLeft = this.nextScrollLeft;
        let event: BodyScrollEvent = {
            type: Events.EVENT_BODY_SCROLL,
            api: this.gridApi,
            columnApi: this.columnApi,
            direction: 'horizontal',
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
        this.horizontallyScrollHeaderCenterAndFloatingCenter();
        this.setLeftAndRightBounds();
        // this.alignedGridsService.fireHorizontalScrollEvent(this.scrollLeft);
    }

    private onBodyVerticalScroll(): void {
        let bodyVScrollActive = this.isBodyVerticalScrollActive();

        if (bodyVScrollActive) {
            this.onVerticalScroll(this.eBodyViewport);
        }
    }

    private onVerticalScroll(sourceElement: HTMLElement): void {
        let scrollTop = sourceElement.scrollTop;

        if (this.useAnimationFrame) {
            if (this.nextScrollTop !== scrollTop) {
                this.nextScrollTop = scrollTop;
                this.animationFrameService.schedule();
            }
        } else {
            if (scrollTop !== this.scrollTop) {
                this.scrollTop = scrollTop;
                this.fakeVerticalScroll(scrollTop);
                this.redrawRowsAfterScroll();
            }
        }
    }

    public executeFrame(): boolean {
        if (this.scrollLeft !== this.nextScrollLeft) {
            this.doHorizontalScroll();
            return true;
        } else if (this.scrollTop !== this.nextScrollTop) {
            this.scrollTop = this.nextScrollTop;
            this.fakeVerticalScroll(this.scrollTop);
            this.verticalRedrawNeeded = true;
            return true;
        } else if (this.verticalRedrawNeeded) {
            this.redrawRowsAfterScroll();
            this.verticalRedrawNeeded = false;
            return true;
        } else {
            return false;
        }
    }

    private redrawRowsAfterScroll(): void {
        let event: BodyScrollEvent = {
            type: Events.EVENT_BODY_SCROLL,
            direction: 'vertical',
            api: this.gridApi,
            columnApi: this.columnApi,
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
        this.rowRenderer.redrawAfterScroll();
    }

    // if LTR, we hide body scroll if pinning right (as scroll is in right pinned),
    // if RTL, we hide body scroll if pinning left (as scroll is in left pinned)
    private isBodyVerticalScrollActive(): boolean {
        let pinningRight = this.columnController.isPinningRight();
        let pinningLeft = this.columnController.isPinningLeft();
        let centerHasScroll = this.enableRtl ? !pinningLeft : !pinningRight;
        return centerHasScroll;
    }

    // this bit is a fix / hack for IE due to this:
    // https://www.ag-grid.com/forum/showthread.php?tid=4303
    // it gets the left panel to reposition itself after a model change
    private addIEPinFix(onPinnedRightScroll: Function, onPinnedLeftScroll: Function): void {
        let listener = () => {
            if (this.columnController.isPinningRight()) {
                setTimeout( ()=> {
                    if (this.enableRtl) {
                        onPinnedLeftScroll();
                    } else {
                        onPinnedRightScroll();
                    }
                }, 0);
            }
        };
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, listener);
    }

    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    public setLeftAndRightBounds(): void {
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        let scrollWidth = this.eBodyViewport.clientWidth;
        let scrollPosition = this.getBodyViewportScrollLeft();

        this.columnController.setVirtualViewportPosition(scrollWidth, scrollPosition);
    }

    public getBodyViewportScrollLeft(): number {
        if (this.forPrint) { return 0; }

        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        return _.getScrollLeft(this.eBodyViewport, this.enableRtl);
    }

    public setBodyViewportScrollLeft(value: number): void {
        if (this.forPrint) { return; }

        // we defer to a util, as how you calculated scrollLeft when doing RTL depends on the browser
        _.setScrollLeft(this.eBodyViewport, value, this.enableRtl);
    }

    public horizontallyScrollHeaderCenterAndFloatingCenter(): void {
        let scrollLeft = this.getBodyViewportScrollLeft();
        let offset = this.enableRtl ? scrollLeft : -scrollLeft;

        this.eHeaderContainer.style.left = offset + 'px';
        this.eFloatingBottomContainer.style.left = offset + 'px';
        this.eFloatingTopContainer.style.left = offset + 'px';
    }

    // we say fake scroll as only one panel (left, right or body) has scrolls,
    // the other panels mimic the scroll by getting it's top position updated.
    private fakeVerticalScroll(position: number): void {
        if (this.enableRtl) {
            // RTL
            // if pinning left, then body scroll is faking
            let pinningLeft = this.columnController.isPinningLeft();
            if (pinningLeft) {
                this.setFakeScroll(this.eBodyContainer, position);
            }
            // right is always faking
            this.setFakeScroll(this.ePinnedRightColsContainer, position);
        } else {
            // LTR
            // if pinning right, then body scroll is faking
            let pinningRight = this.columnController.isPinningRight();
            if (pinningRight) {
                this.setFakeScroll(this.eBodyContainer, position);
            }
            // left is always faking
            this.setFakeScroll(this.ePinnedLeftColsContainer, position);
        }

        // always scroll fullWidth container, as this is never responsible for a scroll
        this.setFakeScroll(this.eFullWidthCellContainer, position);
    }

    private setFakeScroll(eContainer: HTMLElement, pixels: number): void {
        eContainer.style.top = -pixels + 'px';
        // eContainer.style.transform = `translateY(${-pixels}px)`;
    }

    public addScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    public removeScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
