import {Utils as _} from "../utils";
import {MasterSlaveService} from "../masterSlaveService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {RowRenderer} from "../rendering/rowRenderer";
import {FloatingRowModel} from "../rowControllers/floatingRowModel";
import {BorderLayout} from "../layout/borderLayout";
import {Logger, LoggerFactory} from "../logger";
import {Bean, Qualifier, Autowired, PostConstruct, Optional} from "../context/context";
import {EventService} from "../eventService";
import {Events} from "../events";
import {ColumnChangeEvent} from "../columnChangeEvent";
import {IRowModel} from "../interfaces/iRowModel";
import {DragService} from "../dragAndDrop/dragService";
import {IRangeController} from "../interfaces/iRangeController";
import {Constants} from "../constants";
import {SelectionController} from "../selectionController";
import {CsvCreator} from "../csvCreator";
import {MouseEventService} from "./mouseEventService";
import {IClipboardService} from "../interfaces/iClipboardService";
import {FocusedCellController} from "../focusedCellController";

// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
// it won't render correctly in safari, as safari renders white space as a gap
var gridHtml =
    '<div>'+
        // header
        '<div class="ag-header">'+
            '<div class="ag-pinned-left-header"></div>' +
            '<div class="ag-pinned-right-header"></div>' +
            '<div class="ag-header-viewport">' +
                '<div class="ag-header-container"></div>' +
            '</div>'+
            '<div class="ag-header-overlay"></div>' +
        '</div>'+
        // floating top
        '<div class="ag-floating-top">'+
            '<div class="ag-pinned-left-floating-top"></div>' +
            '<div class="ag-pinned-right-floating-top"></div>' +
            '<div class="ag-floating-top-viewport">' +
                '<div class="ag-floating-top-container"></div>' +
            '</div>'+
        '</div>'+
        // floating bottom
        '<div class="ag-floating-bottom">'+
            '<div class="ag-pinned-left-floating-bottom"></div>' +
            '<div class="ag-pinned-right-floating-bottom"></div>' +
            '<div class="ag-floating-bottom-viewport">' +
                '<div class="ag-floating-bottom-container"></div>' +
            '</div>'+
        '</div>'+
        // body
        '<div class="ag-body">'+
            '<div class="ag-pinned-left-cols-viewport">'+
                '<div class="ag-pinned-left-cols-container"></div>'+
            '</div>'+
            '<div class="ag-pinned-right-cols-viewport">'+
                '<div class="ag-pinned-right-cols-container"></div>'+
            '</div>'+
            '<div class="ag-body-viewport-wrapper">'+
                '<div class="ag-body-viewport">'+
                    '<div class="ag-body-container"></div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';

var gridForPrintHtml =
        '<div>'+
            // header
            '<div class="ag-header-container"></div>'+
            // floating
            '<div class="ag-floating-top-container"></div>'+
            // body
            '<div class="ag-body-container"></div>'+
            // floating bottom
            '<div class="ag-floating-bottom-container"></div>'+
        '</div>';

// wrapping in outer div, and wrapper, is needed to center the loading icon
// The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
var mainOverlayTemplate =
    '<div class="ag-overlay-panel">'+
        '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>'+
    '</div>';

var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

@Bean('gridPanel')
export class GridPanel {

    @Autowired('masterSlaveService') private masterSlaveService: MasterSlaveService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Autowired('csvCreator') private csvCreator: CsvCreator;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;

    private layout: BorderLayout;
    private logger: Logger;

    private forPrint: boolean;
    private scrollWidth: number;
    private scrollLagCounter = 0;

    private eBodyViewport: HTMLElement;
    private eRoot: HTMLElement;
    private eBody: HTMLElement;
    private eBodyContainer: HTMLElement;
    private ePinnedLeftColsContainer: HTMLElement;
    private ePinnedRightColsContainer: HTMLElement;
    private eHeaderContainer: HTMLElement;
    private eHeaderOverlay: HTMLElement;
    private ePinnedLeftHeader: HTMLElement;
    private ePinnedRightHeader: HTMLElement;
    private eHeader: HTMLElement;
    private eBodyViewportWrapper: HTMLElement;
    private ePinnedLeftColsViewport: HTMLElement;
    private ePinnedRightColsViewport: HTMLElement;
    private eHeaderViewport: HTMLElement;

    private eFloatingTop: HTMLElement;
    private ePinnedLeftFloatingTop: HTMLElement;
    private ePinnedRightFloatingTop: HTMLElement;
    private eFloatingTopContainer: HTMLElement;
    private eFloatingTopViewport: HTMLElement;

    private eFloatingBottom: HTMLElement;
    private ePinnedLeftFloatingBottom: HTMLElement;
    private ePinnedRightFloatingBottom: HTMLElement;
    private eFloatingBottomContainer: HTMLElement;
    private eFloatingBottomViewport: HTMLElement;

    private eAllCellContainers: HTMLElement[];

    private lastLeftPosition = -1;
    private lastTopPosition = -1;

    private animationThreadCount = 0;

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        // makes code below more readable if we pull 'forPrint' out
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.scrollWidth = _.getScrollbarWidth();
        this.logger = loggerFactory.create('GridPanel');
        this.findElements();
    }

    private onRowDataChanged(): void {
        if (this.rowModel.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.showNoRowsOverlay();
        } else {
            this.hideOverlay();
        }
    }

    public getLayout(): BorderLayout {
        return this.layout;
    }

    @PostConstruct
    private init() {

        this.addEventListeners();
        this.addDragListeners();

        this.layout = new BorderLayout({
            overlays: {
                loading: _.loadTemplate(this.createLoadingOverlayTemplate()),
                noRows: _.loadTemplate(this.createNoRowsOverlayTemplate())
            },
            center: this.eRoot,
            dontFill: this.forPrint,
            name: 'eGridPanel'
        });

        this.layout.addSizeChangeListener(this.sizeHeaderAndBody.bind(this));

        this.addScrollListener();

        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
            this.eBodyViewport.style.overflowX = 'hidden';
        }

        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }

        this.setWidthsOfContainers();
        this.showPinnedColContainersIfNeeded();
        this.sizeHeaderAndBody();
        this.disableBrowserDragging();
        this.addShortcutKeyListeners();
        this.addCellListeners();
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
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.onColumnsChanged.bind(this));
        //this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.onColumnsChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.onColumnsChanged.bind(this));

        this.eventService.addEventListener(Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.sizeHeaderAndBody.bind(this));
        this.eventService.addEventListener(Events.EVENT_HEADER_HEIGHT_CHANGED, this.sizeHeaderAndBody.bind(this));

        this.eventService.addEventListener(Events.EVENT_PIVOT_VALUE_CHANGED, this.sizeHeaderAndBody.bind(this));
        this.eventService.addEventListener(Events.EVENT_PIVOT_VALUE_CHANGED, this.onColumnsChanged.bind(this));

        this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
    }

    private addDragListeners(): void {
        if (this.forPrint // no range select when doing 'for print'
            || !this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
            || _.missing(this.rangeController)) { // no range selection if not enterprise version
            return;
        }

        var containers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
            this.eFloatingTop, this.eFloatingBottom];

        containers.forEach(container => {
            this.dragService.addDragSource({
                dragStartPixels: 0,
                eElement: container,
                onDragStart: this.rangeController.onDragStart.bind(this.rangeController),
                onDragStop: this.rangeController.onDragStop.bind(this.rangeController),
                onDragging: this.rangeController.onDragging.bind(this.rangeController)
            });
        });
    }

    private addCellListeners(): void {
        var eventNames = ['click','mousedown','dblclick','contextmenu'];
        var that = this;
        eventNames.forEach( eventName => {
            this.eAllCellContainers.forEach( container =>
                container.addEventListener(eventName, function(mouseEvent: MouseEvent) {
                    var eventSource: HTMLElement = this;
                    that.processMouseEvent(eventName, mouseEvent, eventSource);
                })
            )
        });
    }

    private processMouseEvent(eventName: string, mouseEvent: MouseEvent, eventSource: HTMLElement): void {
        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);

        if (_.exists(cell)) {
            //console.log(`row = ${cell.rowIndex}, floating = ${floating}`);
            this.rowRenderer.onMouseEvent(eventName, mouseEvent, eventSource, cell);
        }

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
            container.addEventListener('keydown', (event: any)=> {
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
        if (this.rangeController && this.rowModel.isRowsToRender()) {
            var rowEnd: number;
            var floatingStart: string;
            var floatingEnd: string;

            if (this.floatingRowModel.isEmpty(Constants.FLOATING_TOP)) {
                floatingStart = null;
            } else {
                floatingStart = Constants.FLOATING_TOP;
            }

            if (this.floatingRowModel.isEmpty(Constants.FLOATING_BOTTOM)) {
                floatingEnd = null;
                rowEnd = this.rowModel.getRowCount() - 1;
            } else {
                floatingEnd = Constants.FLOATING_BOTTOM;
                rowEnd = this.floatingRowModel.getFloatingBottomRowData().length = 1;
            }

            var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
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

        var focusedCell = this.focusedCellController.getFocusedCell();

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
    
    public getPinnedLeftFloatingTop(): HTMLElement {
        return this.ePinnedLeftFloatingTop;
    }

    public getPinnedRightFloatingTop(): HTMLElement {
        return this.ePinnedRightFloatingTop;
    }

    public getFloatingTopContainer(): HTMLElement {
        return this.eFloatingTopContainer;
    }

    public getPinnedLeftFloatingBottom(): HTMLElement {
        return this.ePinnedLeftFloatingBottom;
    }

    public getPinnedRightFloatingBottom(): HTMLElement {
        return this.ePinnedRightFloatingBottom;
    }

    public getFloatingBottomContainer(): HTMLElement {
        return this.eFloatingBottomContainer;
    }

    private createOverlayTemplate(name: string, defaultTemplate: string, userProvidedTemplate: string): string {

        var template = mainOverlayTemplate
            .replace('[OVERLAY_NAME]', name);

        if (userProvidedTemplate) {
            template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
        } else {
            template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
        }

        return template;
    }

    private createLoadingOverlayTemplate(): string {

        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();

        var templateNotLocalised = this.createOverlayTemplate(
            'loading',
            defaultLoadingOverlayTemplate,
            userProvidedTemplate);

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));

        return templateLocalised;
    }

    private createNoRowsOverlayTemplate(): string {
        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();

        var templateNotLocalised = this.createOverlayTemplate(
            'no-rows',
            defaultNoRowsOverlayTemplate,
            userProvidedTemplate);

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));

        return templateLocalised;
    }

    public ensureIndexVisible(index: any) {
        this.logger.log('ensureIndexVisible: ' + index);
        var lastRow = this.rowModel.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        var nodeAtIndex = this.rowModel.getRow(index);
        var rowTopPixel = nodeAtIndex.rowTop;
        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;

        var viewportTopPixel = this.eBodyViewport.scrollTop;
        var viewportHeight = this.eBodyViewport.offsetHeight;
        var scrollShowing = this.isHorizontalScrollShowing();
        if (scrollShowing) {
            viewportHeight -= this.scrollWidth;
        }
        var viewportBottomPixel = viewportTopPixel + viewportHeight;

        var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;

        var eViewportToScroll = this.columnController.isPinningRight() ? this.ePinnedRightColsViewport : this.eBodyViewport;
        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eViewportToScroll.scrollTop = rowTopPixel;
        } else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            var newScrollPosition = rowBottomPixel - viewportHeight;
            eViewportToScroll.scrollTop = newScrollPosition;
        }
        // otherwise, row is already in view, so do nothing
    }

    // + moveColumnController
    public getCenterWidth(): number {
        return this.eBodyViewport.clientWidth;
    }

    public isHorizontalScrollShowing(): boolean {
        var result = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        return result;
    }

    public isVerticalScrollShowing(): boolean {
        if (this.columnController.isPinningRight()) {
            // if pinning right, then the scroll bar can show, however for some reason
            // it overlays the grid and doesn't take space.
            return false;
        } else {
            return this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight
        }
    }

    // gets called every 500 ms. we use this to set padding on right pinned column
    public periodicallyCheck(): void {
        if (this.columnController.isPinningRight()) {
            var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
            if (bodyHorizontalScrollShowing) {
                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
            } else {
                this.ePinnedRightColsContainer.style.marginBottom = '';
            }
        }
    }

    public ensureColumnVisible(key: any) {
        var column = this.columnController.getOriginalColumn(key);
        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a '+column.getPinned()+' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }

        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }

        var colLeftPixel = column.getLeft();
        var colRightPixel = colLeftPixel + column.getActualWidth();

        var viewportLeftPixel = this.eBodyViewport.scrollLeft;
        var viewportWidth = this.eBodyViewport.offsetWidth;

        var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
        if (scrollShowing) {
            viewportWidth -= this.scrollWidth;
        }

        var viewportRightPixel = viewportLeftPixel + viewportWidth;

        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;

        if (viewportScrolledPastCol) {
            // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
            this.eBodyViewport.scrollLeft = colLeftPixel;
        } else if (viewportScrolledBeforeCol) {
            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
            var newScrollPosition = colRightPixel - viewportWidth;
            this.eBodyViewport.scrollLeft = newScrollPosition;
        }
        // otherwise, col is already in view, so do nothing
    }

    public showLoadingOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            this.layout.showOverlay('loading');
        }
    }

    public showNoRowsOverlay(): void {
        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            this.layout.showOverlay('noRows');
        }
    }

    public hideOverlay(): void {
        this.layout.hideOverlay();
    }

    private getWidthForSizeColsToFit() {
        var availableWidth = this.eBody.clientWidth;
        var scrollShowing = this.isVerticalScrollShowing();
        if (scrollShowing) {
            availableWidth -= this.scrollWidth;
        }
        return availableWidth;
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFit(nextTimeout?: number) {
        var availableWidth = this.getWidthForSizeColsToFit();
        if (availableWidth>0) {
            this.columnController.sizeColumnsToFit(availableWidth);
        } else {
            if (nextTimeout===undefined) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(100);
                }, 0);
            } else if (nextTimeout===100) {
                setTimeout( ()=> {
                    this.sizeColumnsToFit(-1);
                }, 100);
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

    public getPinnedLeftColsContainer(): HTMLElement {
        return this.ePinnedLeftColsContainer;
    }


    public getDropTargetLeftContainers(): HTMLElement[] {
        if (this.forPrint) {
            return [];
        } else {
            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
        }
    }

    public getPinnedRightColsContainer(): HTMLElement {
        return this.ePinnedRightColsContainer;
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

    private findElements() {
        if (this.forPrint) {
            this.eRoot = <HTMLElement> _.loadTemplate(gridForPrintHtml);
            _.addCssClass(this.eRoot, 'ag-root');
            _.addCssClass(this.eRoot, 'ag-font-style');
            _.addCssClass(this.eRoot, 'ag-no-scrolls');
        } else {
            this.eRoot = <HTMLElement> _.loadTemplate(gridHtml);
            _.addCssClass(this.eRoot, 'ag-root');
            _.addCssClass(this.eRoot, 'ag-font-style');
            _.addCssClass(this.eRoot, 'ag-scrolls');
        }

        if (this.forPrint) {
            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');

            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
        } else {
            this.eBody = this.queryHtmlElement('.ag-body');
            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
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

            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');

            this.eAllCellContainers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
                this.eFloatingTop, this.eFloatingBottom];

            // IE9, Chrome, Safari, Opera
            this.ePinnedLeftColsViewport.addEventListener('mousewheel', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('mousewheel', this.centerMouseWheelListener.bind(this));
            // Firefox
            this.ePinnedLeftColsViewport.addEventListener('DOMMouseScroll', this.pinnedLeftMouseWheelListener.bind(this));
            this.eBodyViewport.addEventListener('DOMMouseScroll', this.centerMouseWheelListener.bind(this));
        }
    }

    public getHeaderViewport(): HTMLElement {
        return this.eHeaderViewport;
    }

    private centerMouseWheelListener(event: any): boolean {
        // we are only interested in mimicking the mouse wheel if we are pinning on the right,
        // as if we are not pinning on the right, then we have scrollbars in the center body, and
        // as such we just use the default browser wheel behaviour.
        if (this.columnController.isPinningRight()) {
            return this.generalMouseWheelListener(event, this.ePinnedRightColsViewport);
        }
    }

    private pinnedLeftMouseWheelListener(event: any): boolean {
        var targetPanel: HTMLElement;
        if (this.columnController.isPinningRight()) {
            targetPanel = this.ePinnedRightColsViewport;
        } else {
            targetPanel = this.eBodyViewport;
        }
        return this.generalMouseWheelListener(event, targetPanel);
    }

    private generalMouseWheelListener(event: any, targetPanel: HTMLElement): boolean {
        var wheelEvent = _.normalizeWheel(event);

        // we need to detect in which direction scroll is happening to allow trackpads scroll horizontally
        // horizontal scroll
        if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
            var newLeftPosition = this.eBodyViewport.scrollLeft + wheelEvent.pixelX;
            this.eBodyViewport.scrollLeft = newLeftPosition;
        }
        // vertical scroll
        else {
            var newTopPosition = this.eBodyViewport.scrollTop + wheelEvent.pixelY;
            targetPanel.scrollTop = newTopPosition;
        }

        // allow the option to pass mouse wheel events ot the browser
        // https://github.com/ceolter/ag-grid/issues/800
        // in the future, this should be tied in with 'forPrint' option, or have an option 'no vertical scrolls'
        if (!this.gridOptionsWrapper.isSuppressPreventDefaultOnMouseWheel()) {
            // if we don't prevent default, then the whole browser will scroll also as well as the grid
            event.preventDefault();
        }

        return false;
    }

    public onColumnsChanged(event: ColumnChangeEvent) {

        if (event.isContainerWidthImpacted()) {
            this.setWidthsOfContainers();
        }

        if (event.isPinnedPanelVisibilityImpacted()) {
            this.showPinnedColContainersIfNeeded();
        }

        if (event.getType()===Events.EVENT_COLUMN_EVERYTHING_CHANGED) {
            this.sizeHeaderAndBody();
        }
    }

    private setWidthsOfContainers(): void {
        this.logger.log('setWidthsOfContainers()');
        this.showPinnedColContainersIfNeeded();

        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
        this.eBodyContainer.style.width = mainRowWidth;

        if (this.forPrint) {
            // pinned col doesn't exist when doing forPrint
            return;
        }

        this.eFloatingBottomContainer.style.width = mainRowWidth;
        this.eFloatingTopContainer.style.width = mainRowWidth;

        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidth;
        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidth;
        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidth;

        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidth;
        this.ePinnedRightFloatingTop.style.width = pinnedRightWidth;
        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidth;
    }


    private showPinnedColContainersIfNeeded() {
        // no need to do this if not using scrolls
        if (this.forPrint) {
            return;
        }

        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (this.columnController.isPinningLeft()) {
            this.ePinnedLeftHeader.style.display = 'inline-block';
            this.ePinnedLeftColsViewport.style.display = 'inline';
        } else {
            this.ePinnedLeftHeader.style.display = 'none';
            this.ePinnedLeftColsViewport.style.display = 'none';
        }

        if (this.columnController.isPinningRight()) {
            this.ePinnedRightHeader.style.display = 'inline-block';
            this.ePinnedRightColsViewport.style.display = 'inline';
            this.eBodyViewport.style.overflowY = 'hidden';
        } else {
            this.ePinnedRightHeader.style.display = 'none';
            this.ePinnedRightColsViewport.style.display = 'none';
            this.eBodyViewport.style.overflowY = 'auto';
        }
    }

    private sizeHeaderAndBody(): void {
        if (this.forPrint) {
            // if doing 'for print', then the header and footers are laid
            // out naturally by the browser. it whatever size that's needed to fit.
            return;
        }

        var heightOfContainer = this.layout.getCentreHeight();
        if (!heightOfContainer) {
            return;
        }

        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var numberOfRowsInHeader = this.columnController.getHeaderRowCount();
        var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
        this.eHeader.style['height'] = totalHeaderHeight + 'px';

        // padding top covers the header and the floating rows on top
        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
        var paddingTop = totalHeaderHeight + floatingTopHeight;
        // bottom is just the bottom floating rows
        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
        var floatingBottomTop = heightOfContainer - floatingBottomHeight;

        var heightOfCentreRows = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;

        this.eBody.style.paddingTop = paddingTop + 'px';
        this.eBody.style.paddingBottom = floatingBottomHeight + 'px';

        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
        this.eFloatingTop.style.height = floatingTopHeight + 'px';
        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
        this.eFloatingBottom.style.top = floatingBottomTop + 'px';

        this.ePinnedLeftColsViewport.style.height = heightOfCentreRows + 'px';
        this.ePinnedRightColsViewport.style.height = heightOfCentreRows + 'px';
    }

    public setHorizontalScrollPosition(hScrollPosition: number): void {
        this.eBodyViewport.scrollLeft = hScrollPosition;
    }

    // tries to scroll by pixels, but returns what the result actually was
    public scrollHorizontally(pixels: number): number {
        var oldScrollPosition = this.eBodyViewport.scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        var newScrollPosition = this.eBodyViewport.scrollLeft;
        return newScrollPosition - oldScrollPosition;
    }

    public getHorizontalScrollPosition(): number {
        if (this.forPrint) {
            return 0;
        } else {
            return this.eBodyViewport.scrollLeft;
        }
    }

    public turnOnAnimationForABit(): void {
        if (this.gridOptionsWrapper.isSuppressColumnMoveAnimation()) {
            return;
        }
        this.animationThreadCount++;
        var animationThreadCountCopy = this.animationThreadCount;
        _.addCssClass(this.eRoot, 'ag-column-moving');
        setTimeout( ()=> {
            if (this.animationThreadCount===animationThreadCountCopy) {
                _.removeCssClass(this.eRoot, 'ag-column-moving');
            }
        }, 300);
    }

    private addScrollListener() {
        // if printing, then no scrolling, so no point in listening for scroll events
        if (this.forPrint) {
            return;
        }

        this.eBodyViewport.addEventListener('scroll', () => {

            // we are always interested in horizontal scrolls of the body
            var newLeftPosition = this.eBodyViewport.scrollLeft;
            if (newLeftPosition !== this.lastLeftPosition) {
                this.lastLeftPosition = newLeftPosition;
                this.horizontallyScrollHeaderCenterAndFloatingCenter();
                this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
            }

            // if we are pinning to the right, then it's the right pinned container
            // that has the scroll.
            if (!this.columnController.isPinningRight()) {
                var newTopPosition = this.eBodyViewport.scrollTop;
                if (newTopPosition !== this.lastTopPosition) {
                    this.lastTopPosition = newTopPosition;
                    this.verticallyScrollLeftPinned(newTopPosition);
                    this.requestDrawVirtualRows();
                }
            }
        });

        this.ePinnedRightColsViewport.addEventListener('scroll', () => {
            var newTopPosition = this.ePinnedRightColsViewport.scrollTop;
            if (newTopPosition !== this.lastTopPosition) {
                this.lastTopPosition = newTopPosition;
                this.verticallyScrollLeftPinned(newTopPosition);
                this.verticallyScrollBody(newTopPosition);
                this.requestDrawVirtualRows();
            }
        });

        // this means the pinned panel was moved, which can only
        // happen when the user is navigating in the pinned container
        // as the pinned col should never scroll. so we rollback
        // the scroll on the pinned.
        this.ePinnedLeftColsViewport.addEventListener('scroll', () => {
            this.ePinnedLeftColsViewport.scrollTop = 0;
        });
    }

    private requestDrawVirtualRows() {
        // if we are in IE or Safari, then we only redraw if there was no scroll event
        // in the 50ms following this scroll event. without this, these browsers have
        // a bad scrolling feel, where the redraws clog the scroll experience
        // (makes the scroll clunky and sticky). this method is like throttling
        // the scroll events.
        var useScrollLag: boolean;
        // let the user override scroll lag option
        if (this.gridOptionsWrapper.isSuppressScrollLag()) {
            useScrollLag = false;
        } else if (this.gridOptionsWrapper.getIsScrollLag()) {
            useScrollLag = this.gridOptionsWrapper.getIsScrollLag()();
        } else {
            useScrollLag = _.isBrowserIE() || _.isBrowserSafari();
        }
        if (useScrollLag) {
            this.scrollLagCounter++;
            var scrollLagCounterCopy = this.scrollLagCounter;
            setTimeout( ()=> {
                if (this.scrollLagCounter === scrollLagCounterCopy) {
                    this.rowRenderer.drawVirtualRows();
                }
            }, 50);
        // all other browsers, afaik, are fine, so just do the redraw
        } else {
            this.rowRenderer.drawVirtualRows();
        }
    }

    public horizontallyScrollHeaderCenterAndFloatingCenter(): void {
        var bodyLeftPosition = this.eBodyViewport.scrollLeft;
        this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
        this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
    }

    private verticallyScrollLeftPinned(bodyTopPosition: any): void {
        this.ePinnedLeftColsContainer.style.top = -bodyTopPosition + 'px';
    }

    private verticallyScrollBody(position: any): void {
        this.eBodyViewport.scrollTop = position;
    }

    public getVerticalScrollPosition(): number {
        if (this.forPrint) {
            return 0;
        } else {
            return this.eBodyViewport.scrollTop;
        }
    }

    public getBodyViewportClientRect(): ClientRect {
        if (this.forPrint) {
            return this.eBodyContainer.getBoundingClientRect();
        } else {
            return this.eBodyViewport.getBoundingClientRect();
        }
    }

    public getFloatingTopClientRect(): ClientRect {
        if (this.forPrint) {
            return this.eFloatingTopContainer.getBoundingClientRect();
        } else {
            return this.eFloatingTop.getBoundingClientRect();
        }
    }

    public getFloatingBottomClientRect(): ClientRect {
        if (this.forPrint) {
            return this.eFloatingBottomContainer.getBoundingClientRect();
        } else {
            return this.eFloatingBottom.getBoundingClientRect();
        }
    }

    public getPinnedLeftColsViewportClientRect(): ClientRect {
        return this.ePinnedLeftColsViewport.getBoundingClientRect();
    }

    public getPinnedRightColsViewportClientRect(): ClientRect {
        return this.ePinnedRightColsViewport.getBoundingClientRect();
    }

    public addScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    public removeScrollEventListener(listener: ()=>void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
