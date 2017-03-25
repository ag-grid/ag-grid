import {Utils as _} from "../utils";
import {RenderedCell} from "./renderedCell";
import {RowNode} from "../entities/rowNode";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {RowRenderer} from "./rowRenderer";
import {Column} from "../entities/column";
import {Events} from "../events";
import {EventService} from "../eventService";
import {Context, Autowired, PostConstruct} from "../context/context";
import {ColumnChangeEvent} from "../columnChangeEvent";
import {FocusedCellController} from "../focusedCellController";
import {Constants} from "../constants";
import {CellRendererService} from "./cellRendererService";
import {CellRendererFactory} from "./cellRendererFactory";
import {ICellRenderer, ICellRendererFunc, ICellRendererComp} from "./cellRenderers/iCellRenderer";
import {GridPanel} from "../gridPanel/gridPanel";
import {BeanStub} from "../context/beanStub";
import {RowContainerComponent} from "./rowContainerComponent";
import {ColumnAnimationService} from "./columnAnimationService";
import {ColDef} from "../entities/colDef";
import {PaginationProxy} from "../rowModels/paginationProxy";

export class RenderedRow extends BeanStub {

    public static EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('$compile') private $compile: any;
    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private ePinnedLeftRow: HTMLElement;
    private ePinnedRightRow: HTMLElement;
    private eBodyRow: HTMLElement;

    private eFullWidthRow: HTMLElement;
    private eFullWidthRowBody: HTMLElement;
    private eFullWidthRowLeft: HTMLElement;
    private eFullWidthRowRight: HTMLElement;

    private eAllRowContainers: HTMLElement[] = [];

    private fullWidthRowComponent: ICellRendererComp;
    private fullWidthRowComponentBody: ICellRendererComp;
    private fullWidthRowComponentLeft: ICellRendererComp;
    private fullWidthRowComponentRight: ICellRendererComp;

    private renderedCells: {[key: string]: RenderedCell} = {};
    private scope: any;
    private rowNode: RowNode;

    private fullWidthRow: boolean;
    private fullWidthCellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    private fullWidthCellRendererParams: any;

    private parentScope: any;
    private rowRenderer: RowRenderer;

    private bodyContainerComp: RowContainerComponent;
    private fullWidthContainerComp: RowContainerComponent;
    private pinnedLeftContainerComp: RowContainerComponent;
    private pinnedRightContainerComp: RowContainerComponent;

    private fullWidthPinnedLeftLastTime: boolean;
    private fullWidthPinnedRightLastTime: boolean;

    // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
    // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
    // executes them all in one timeout
    private nextVmTurnFunctions: Function[] = [];

    // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
    // so each row isn't setting up it's own timeout
    private delayedDestroyFunctions: Function[] = [];

    // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
    // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
    // complete (ie removes from the dom).
    private startRemoveAnimationFunctions: Function[] = [];

    private renderedRowEventService: EventService;

    private editingRow = false;

    private initialised = false;

    private animateIn: boolean;

    private rowFocusedLastTime: boolean;

    constructor(parentScope: any,
                rowRenderer: RowRenderer,
                bodyContainerComp: RowContainerComponent,
                fullWidthContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                node: RowNode,
                animateIn: boolean) {
        super();
        this.parentScope = parentScope;
        this.rowRenderer = rowRenderer;

        this.bodyContainerComp = bodyContainerComp;
        this.fullWidthContainerComp = fullWidthContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;

        this.rowNode = node;
        this.animateIn = animateIn;
    }

    private setupRowContainers(animateInRowTop: boolean): void {

        let isFullWidthCellFunc = this.gridOptionsWrapper.getIsFullWidthCellFunc();
        let isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        let isGroupSpanningRow = this.rowNode.group && this.gridOptionsWrapper.isGroupUseEntireRow();

        if (isFullWidthCell) {
            this.setupFullWidthContainers(animateInRowTop);
        } else if (isGroupSpanningRow) {
            this.setupFullWidthGroupContainers(animateInRowTop);
        } else {
            this.setupNormalContainers(animateInRowTop);
        }
    }

    // we clear so that the functions are never executed twice
    public getAndClearDelayedDestroyFunctions(): Function[] {
        var result = this.delayedDestroyFunctions;
        this.delayedDestroyFunctions = [];
        return result;
    }

    // we clear so that the functions are never executed twice
    public getAndClearNextVMTurnFunctions(): Function[] {
        var result = this.nextVmTurnFunctions;
        this.nextVmTurnFunctions = [];
        return result;
    }

    private addDomData(eRowContainer: Element): void {
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var gridCellNoType = <any> eRowContainer;
        gridCellNoType[domDataKey] = {
            renderedRow: this
        };
        this.addDestroyFunc( ()=> { gridCellNoType[domDataKey] = null; } );
    }

    private setupFullWidthContainers(animateInRowTop: boolean): void {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getFullWidthCellRendererParams();
        if (_.missing(this.fullWidthCellRenderer)) {
            console.warn(`ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()`);
        }

        this.createFullWidthRow(animateInRowTop);
    }

    private addMouseWheelListenerToFullWidthRow(): void {
        var mouseWheelListener = this.gridPanel.genericMouseWheelListener.bind(this.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.addDestroyableEventListener(this.eFullWidthRow, 'mousewheel', mouseWheelListener);
        // Firefox
        this.addDestroyableEventListener(this.eFullWidthRow, 'DOMMouseScroll', mouseWheelListener);
    }

    private setupFullWidthGroupContainers(animateInRowTop: boolean): void {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getGroupRowRendererParams();

        if (!this.fullWidthCellRenderer) {
            this.fullWidthCellRenderer = CellRendererFactory.GROUP;
            this.fullWidthCellRendererParams = {
                innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
            };
        }

        this.createFullWidthRow(animateInRowTop);
    }

    private createFullWidthRow(animateInRowTop: boolean): void {
        let embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();

        if (embedFullWidthRows) {

            // if embedding the full width, it gets added to the body, left and right
            this.eFullWidthRowBody = this.createRowContainer(this.bodyContainerComp, animateInRowTop);
            this.eFullWidthRowLeft = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop);
            this.eFullWidthRowRight = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop);

            _.addCssClass(this.eFullWidthRowLeft, 'ag-cell-last-left-pinned');
            _.addCssClass(this.eFullWidthRowRight, 'ag-cell-first-right-pinned');

        } else {

            // otherwise we add to the fullWidth container as normal
            this.eFullWidthRow = this.createRowContainer(this.fullWidthContainerComp, animateInRowTop);

            // and fake the mouse wheel for the fullWidth container
            if (!this.gridOptionsWrapper.isForPrint()) {
                this.addMouseWheelListenerToFullWidthRow();
            }
        }
    }

    private setupNormalContainers(animateInRowTop: boolean): void {
        this.fullWidthRow = false;

        this.eBodyRow = this.createRowContainer(this.bodyContainerComp, animateInRowTop);

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop);
            this.ePinnedRightRow = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop);
        }
    }

    @PostConstruct
    public init(): void {

        var animateInRowTop = this.animateIn && _.exists(this.rowNode.oldRowTop);
        
        this.setupRowContainers(animateInRowTop);

        this.scope = this.createChildScopeOrNull(this.rowNode.data);

        if (this.fullWidthRow) {
            this.refreshFullWidthComponent();
        } else {
            this.refreshCellsIntoRow();
        }

        this.addGridClasses();
        this.addExpandedAndContractedClasses();

        this.addStyleFromRowStyle();
        this.addStyleFromRowStyleFunc();

        this.addClassesFromRowClass();
        this.addClassesFromRowClassFunc();

        this.addRowIndexes();
        this.addRowIds();
        this.setupTop(animateInRowTop);
        this.setHeight();

        this.addRowSelectedListener();
        this.addCellFocusedListener();
        this.addNodeDataChangedListener();
        this.addColumnListener();
        this.addHoverFunctionality();

        this.gridOptionsWrapper.executeProcessRowPostCreateFunc({
            eRow: this.eBodyRow,
            ePinnedLeftRow: this.ePinnedLeftRow,
            ePinnedRightRow: this.ePinnedRightRow,
            node: this.rowNode,
            api: this.gridOptionsWrapper.getApi(),
            rowIndex: this.rowNode.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        });

        this.addDataChangedListener();

        this.initialised = true;
    }

    public stopRowEditing(cancel: boolean): void {
        this.stopEditing(cancel);
    }

    public isEditing(): boolean {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            // if doing row editing, then the local variable is the one that is used
            return this.editingRow;
        } else {
            // if not doing row editing, then the renderedRow has no edit state, so
            // we have to look at the individual cells
            let editingCell = _.find(this.renderedCells, renderedCell => renderedCell && renderedCell.isEditing() );
            return _.exists(editingCell);
        }
    }

    public stopEditing(cancel = false): void {
        this.forEachRenderedCell( renderedCell => {
            renderedCell.stopEditing(cancel);
        });
        if (this.editingRow) {
            if (!cancel) {
                var event = {
                    node: this.rowNode,
                    data: this.rowNode.data,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext()
                };
                this.mainEventService.dispatchEvent(Events.EVENT_ROW_VALUE_CHANGED, event);
            }
            this.setEditingRow(false);
        }
    }

    public startRowEditing(keyPress: number = null, charPress: string = null, sourceRenderedCell: RenderedCell = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.forEachRenderedCell( renderedCell => {
            var cellStartedEdit = renderedCell === sourceRenderedCell;
            if (cellStartedEdit) {
                renderedCell.startEditingIfEnabled(keyPress, charPress, cellStartedEdit)
            } else {
                renderedCell.startEditingIfEnabled(null, null, cellStartedEdit)
            }
        });
        this.setEditingRow(true);
    }

    private setEditingRow(value: boolean): void {
        this.editingRow = value;
        this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-editing', value) );
        let event = value ? Events.EVENT_ROW_EDITING_STARTED : Events.EVENT_ROW_EDITING_STOPPED;
        this.mainEventService.dispatchEvent(event, {node: this.rowNode});
    }

    // because data can change, especially in virtual pagination and viewport row models, need to allow setting
    // styles and classes after the data has changed
    private addDataChangedListener(): void {

        var dataChangedListener = ()=> {
            this.addStyleFromRowStyleFunc();
            this.addClassesFromRowClass();
        };

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, dataChangedListener);
    }

    private angular1Compile(element: Element): void {
        if (this.scope) {
            this.$compile(element)(this.scope);
        }
    }

    private addColumnListener(): void {
        var columnListener = this.onDisplayedColumnsChanged.bind(this);
        var virtualListener = this.onVirtualColumnsChanged.bind(this);
        var gridColumnsChangedListener = this.onGridColumnsChanged.bind(this);

        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_COLUMN_RESIZED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
    }

    private onDisplayedColumnsChanged(): void {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (this.fullWidthRow) {
            if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {
                let leftMismatch = this.fullWidthPinnedLeftLastTime !== this.columnController.isPinningLeft();
                let rightMismatch = this.fullWidthPinnedRightLastTime !== this.columnController.isPinningRight();
                // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
                // embedded, as what appears in each section depends on whether we are pinned or not
                if (leftMismatch || rightMismatch) {
                    this.refreshFullWidthComponent();
                }
            } else {
                // otherwise nothing, the floating fullWidth containers are not impacted by column changes
            }
        } else {
            this.refreshCellsIntoRow();
        }
    }

    private onVirtualColumnsChanged(event: ColumnChangeEvent): void {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (!this.fullWidthRow) {
            this.refreshCellsIntoRow();
        }
    }

    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    private onGridColumnsChanged(): void {
        var allRenderedCellIds = Object.keys(this.renderedCells);
        this.removeRenderedCells(allRenderedCellIds);
    }

    private isCellInWrongRow(renderedCell: RenderedCell): boolean {
        let column = renderedCell.getColumn();
        let rowWeWant = this.getRowForColumn(column);

        // if in wrong container, remove it
        var oldRow = renderedCell.getParentRow();
        return oldRow !== rowWeWant;
    }

    // method makes sure the right cells are present, and are in the right container. so when this gets called for
    // the first time, it sets up all the cells. but then over time the cells might appear / dissappear or move
    // container (ie into pinned)
    private refreshCellsIntoRow() {

        let displayedVirtualColumns = this.columnController.getAllDisplayedVirtualColumns();
        let displayedColumns = this.columnController.getAllDisplayedColumns();

        var cellsToRemove = Object.keys(this.renderedCells);

        displayedVirtualColumns.forEach( (column: Column) => {
            var renderedCell = this.getOrCreateCell(column);
            this.ensureCellInCorrectRow(renderedCell);
            _.removeFromArray(cellsToRemove, column.getColId());
        });

        // we never remove rendered ones, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally
        cellsToRemove = _.filter(cellsToRemove, indexStr => {
            let REMOVE_CELL : boolean = true;
            let KEEP_CELL : boolean = false;
            let renderedCell = this.renderedCells[indexStr];

            if (!renderedCell) { return REMOVE_CELL; }

            // always remove the cell if it's in the wrong pinned location
            if (this.isCellInWrongRow(renderedCell)) { return REMOVE_CELL; }

            // we want to try and keep editing and focused cells
            let editing = renderedCell.isEditing();
            let focused = this.focusedCellController.isCellFocused(renderedCell.getGridCell());

            let mightWantToKeepCell = editing || focused;

            if (mightWantToKeepCell) {
                let column = renderedCell.getColumn();
                let cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
                return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
            } else {
                return REMOVE_CELL;
            }
        });

        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(cellsToRemove);
    }

    private removeRenderedCells(colIds: string[]): void {
        colIds.forEach( (key: string)=> {
            var renderedCell = this.renderedCells[key];
            // could be old reference, ie removed cell
            if (_.missing(renderedCell)) { return; }

            renderedCell.destroy();
            this.renderedCells[key] = null;
        });
    }

    private getRowForColumn(column: Column): HTMLElement {
        switch (column.getPinned()) {
            case Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    }

    private ensureCellInCorrectRow(renderedCell: RenderedCell): void {
        var eRowGui = renderedCell.getGui();
        var column = renderedCell.getColumn();

        let rowWeWant = this.getRowForColumn(column);

        // if in wrong container, remove it
        var oldRow = renderedCell.getParentRow();
        var inWrongRow = oldRow !== rowWeWant;
        if (inWrongRow) {
            // take out from old row
            if (oldRow) {
                oldRow.removeChild(eRowGui);
            }

            rowWeWant.appendChild(eRowGui);
            renderedCell.setParentRow(rowWeWant);
        }
    }

    private getOrCreateCell(column: Column): RenderedCell {

        var colId = column.getColId();
        if (this.renderedCells[colId]) {
            return this.renderedCells[colId];
        } else {
            var renderedCell = new RenderedCell(column, this.rowNode, this.scope, this);
            this.context.wireBean(renderedCell);
            this.renderedCells[colId] = renderedCell;
            this.angular1Compile(renderedCell.getGui());

            // if we are editing the row, then the cell needs to turn
            // into edit mode
            if (this.editingRow) {
                renderedCell.startEditingIfEnabled();
            }

            return renderedCell;
        }
    }

    private onRowSelected(): void {
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-selected', selected) );
    }

    private addRowSelectedListener(): void {
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
        }
    }

    private addHoverFunctionality(): void {

        // because we are adding listeners to the row, we give the user the choice to not add
        // the hover class, as it slows things down, especially in IE, when you add listeners
        // to each row. we cannot do the trick of adding one listener to the GridPanel (like we
        // do for other mouse events) as these events don't propogate
        if (this.gridOptionsWrapper.isSuppressRowHoverClass()) { return; }

        var onGuiMouseEnter = this.rowNode.onMouseEnter.bind(this.rowNode);
        var onGuiMouseLeave = this.rowNode.onMouseLeave.bind(this.rowNode);
        
        this.eAllRowContainers.forEach( eRow => {
            this.addDestroyableEventListener(eRow, 'mouseenter', onGuiMouseEnter);
            this.addDestroyableEventListener(eRow, 'mouseleave', onGuiMouseLeave);
        });

        var onNodeMouseEnter = this.addHoverClass.bind(this, true);
        var onNodeMouseLeave = this.addHoverClass.bind(this, false);

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);
    }
    
    private addHoverClass(hover: boolean): void {
        this.eAllRowContainers.forEach( eRow => _.addOrRemoveCssClass(eRow, 'ag-row-hover', hover) );
    }

    private setRowFocusClasses(): void {
        var rowFocused = this.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.floating);
        if (rowFocused !== this.rowFocusedLastTime) {
            this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused) );
            this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused) );
            this.rowFocusedLastTime = rowFocused;
        }

        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    }

    private addCellFocusedListener(): void {
        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_CELL_FOCUSED, this.setRowFocusClasses.bind(this));
        this.addDestroyableEventListener(this.mainEventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.setRowFocusClasses.bind(this));
        this.setRowFocusClasses();
    }

    private onPaginationChanged(): void {
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        this.onTopChanged();
    }

    public forEachRenderedCell(callback: (renderedCell: RenderedCell)=>void): void {
        _.iterateObject(this.renderedCells, (key: any, renderedCell: RenderedCell)=> {
            if (renderedCell) {
                callback(renderedCell);
            }
        });
    }

    private addNodeDataChangedListener(): void {
        var nodeDataChangedListener = () => {
            var animate = false;
            var newData = true;
            this.forEachRenderedCell( renderedCell => renderedCell.refreshCell(animate, newData) );
            // check for selected also, as this could be after lazy loading of the row data, in which csae
            // the id might of just gotten set inside the row and the row selected state may of changed
            // as a result. this is what happens when selected rows are loaded in virtual pagination.
            this.onRowSelected();
        };
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
    }

    private onTopChanged(): void {
        // top is not used in forPrint, as the rows are just laid out naturally
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        // console.log(`top changed for ${this.rowNode.id} = ${this.rowNode.rowTop}`);
        this.setRowTop(this.rowNode.rowTop);
    }
    
    private setRowTop(pixels: number): void {
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (_.exists(pixels)) {

            let pixelsWithOffset: number;
            if (this.rowNode.isFloating()) {
                pixelsWithOffset = pixels;
            } else {
                pixelsWithOffset = pixels - this.paginationProxy.getPixelOffset();
            }

            var topPx = pixelsWithOffset + "px";
            this.eAllRowContainers.forEach( row => row.style.top = topPx);
        }
    }
    
    private setupTop(animateInRowTop: boolean): void {
        if (this.gridOptionsWrapper.isForPrint()) { return; }

        let topChangedListener = this.onTopChanged.bind(this);

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, topChangedListener);

        if (!animateInRowTop) {
            this.onTopChanged();
        }
    }
    
    private setHeight(): void {
        let setHeightListener = () => {
            // check for exists first - if the user is resetting the row height, then
            // it will be null (or undefined) momentarily until the next time the flatten
            // stage is called where the row will then update again with a new height
            if (_.exists(this.rowNode.rowHeight)) {
                var heightPx = this.rowNode.rowHeight + 'px';
                this.eAllRowContainers.forEach( row => row.style.height = heightPx);
            }
        };

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, setHeightListener);

        setHeightListener();
    }

    private addRowIndexes(): void {
        var rowIndexListener = () => {
            var rowStr = this.rowNode.rowIndex.toString();
            if (this.rowNode.floating===Constants.FLOATING_BOTTOM) {
                rowStr = 'fb-' + rowStr;
            } else if (this.rowNode.floating===Constants.FLOATING_TOP) {
                rowStr = 'ft-' + rowStr;
            }
            this.eAllRowContainers.forEach( eRow => {
                eRow.setAttribute('row', rowStr);

                let rowIsEven = this.rowNode.rowIndex % 2 === 0;
                _.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
                _.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
            } );
        };

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, rowIndexListener);

        rowIndexListener();
    }

    // adds in row and row-id attributes to the row
    private addRowIds(): void {
        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            if (typeof businessKey === 'string' || typeof businessKey === 'number') {
                this.eAllRowContainers.forEach( row => row.setAttribute('row-id', businessKey) );
            }
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.renderedRowEventService) { this.renderedRowEventService = new EventService(); }
        this.renderedRowEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.renderedRowEventService.removeEventListener(eventType, listener);
    }

    public getRenderedCellForColumn(column: Column): RenderedCell {
        return this.renderedCells[column.getColId()];
    }

    public getCellForCol(column: Column): HTMLElement {
        var renderedCell = this.renderedCells[column.getColId()];
        if (renderedCell) {
            return renderedCell.getGui();
        } else {
            return null;
        }
    }

    public destroy(animate = false): void {
        super.destroy();

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        this.destroyScope();
        this.destroyFullWidthComponent();
        this.forEachRenderedCell( renderedCell => renderedCell.destroy() );


        if (animate) {
            this.startRemoveAnimationFunctions.forEach( func => func() );
        } else {
            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            var delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach( func => func() );
        }

        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, {node: this.rowNode});
        }

        var event = {node: this.rowNode, rowIndex: this.rowNode.rowIndex};
        this.mainEventService.dispatchEvent(Events.EVENT_VIRTUAL_ROW_REMOVED, event);
    }

    private destroyScope(): void {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    }

    public isGroup(): boolean {
        return this.rowNode.group === true;
    }

    private refreshFullWidthComponent(): void {
        this.destroyFullWidthComponent();
        this.createFullWidthComponent();
    }

    private createFullWidthComponent(): void {

        this.fullWidthPinnedLeftLastTime = this.columnController.isPinningLeft();
        this.fullWidthPinnedRightLastTime = this.columnController.isPinningRight();

        if (this.eFullWidthRow) {
            var params = this.createFullWidthParams(this.eFullWidthRow, null);
            this.fullWidthRowComponent = this.cellRendererService.useCellRenderer(
                this.fullWidthCellRenderer, this.eFullWidthRow, params);
            this.angular1Compile(this.eFullWidthRow);
        }

        if (this.eFullWidthRowBody) {
            var params = this.createFullWidthParams(this.eFullWidthRowBody, null);
            this.fullWidthRowComponentBody = this.cellRendererService.useCellRenderer(
                this.fullWidthCellRenderer, this.eFullWidthRowBody, params);
            this.angular1Compile(this.eFullWidthRowBody);
        }

        if (this.eFullWidthRowLeft) {
            var params = this.createFullWidthParams(this.eFullWidthRowLeft, Column.PINNED_LEFT);
            this.fullWidthRowComponentLeft = this.cellRendererService.useCellRenderer(
                this.fullWidthCellRenderer, this.eFullWidthRowLeft, params);
            this.angular1Compile(this.eFullWidthRowLeft);
        }

        if (this.eFullWidthRowRight) {
            var params = this.createFullWidthParams(this.eFullWidthRowRight, Column.PINNED_RIGHT);
            this.fullWidthRowComponentRight = this.cellRendererService.useCellRenderer(
                this.fullWidthCellRenderer, this.eFullWidthRowRight, params);
            this.angular1Compile(this.eFullWidthRowRight);
        }

    }

    private destroyFullWidthComponent(): void {
        if (this.fullWidthRowComponent) {
            if (this.fullWidthRowComponent.destroy) {
                this.fullWidthRowComponent.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            if (this.fullWidthRowComponentBody.destroy) {
                this.fullWidthRowComponentBody.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentLeft) {
            if (this.fullWidthRowComponentLeft.destroy) {
                this.fullWidthRowComponentLeft.destroy();
            }
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            if (this.fullWidthRowComponentRight.destroy) {
                this.fullWidthRowComponentRight.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.eFullWidthRow) {
            _.removeAllChildren(this.eFullWidthRow);
        }
        if (this.eFullWidthRowBody) {
            _.removeAllChildren(this.eFullWidthRowBody);
        }
        if (this.eFullWidthRowLeft) {
            _.removeAllChildren(this.eFullWidthRowLeft);
        }
        if (this.eFullWidthRowRight) {
            _.removeAllChildren(this.eFullWidthRowRight);
        }
    }

    private createFullWidthParams(eRow: HTMLElement, pinned: string): any {
        var params = {
            data: this.rowNode.data,
            node: this.rowNode,
            $scope: this.scope,
            rowIndex: this.rowNode.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this),
            colDef: {
                cellRenderer: this.fullWidthCellRenderer,
                cellRendererParams: this.fullWidthCellRendererParams
            }
        };

        if (this.fullWidthCellRendererParams) {
            _.assign(params, this.fullWidthCellRendererParams);
        }

        return params;
    }

    private createChildScopeOrNull(data: any) {
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            var newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            newChildScope.rowNode = this.rowNode;
            newChildScope.context = this.gridOptionsWrapper.getContext();
            return newChildScope;
        } else {
            return null;
        }
    }

    private addStyleFromRowStyle(): void {
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (rowStyle) {
            if (typeof rowStyle === 'function') {
                console.log('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            } else {
                this.eAllRowContainers.forEach( row => _.addStylesToElement(row, rowStyle));
            }
        }
    }

    private addStyleFromRowStyleFunc(): void {
        var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            var cssToUseFromFunc = rowStyleFunc(params);
            this.eAllRowContainers.forEach( row => _.addStylesToElement(row, cssToUseFromFunc));
        }
    }

    private createParams(): any {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex,
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        return params;
    }

    private createEvent(event: any, eventSource: any): any {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    }

    private createRowContainer(rowContainerComp: RowContainerComponent, slideRowIn: boolean): HTMLElement {
        var eRow = document.createElement('div');

        this.addDomData(eRow);

        rowContainerComp.appendRowElement(eRow);

        this.eAllRowContainers.push(eRow);

        this.delayedDestroyFunctions.push( ()=> {
            rowContainerComp.removeRowElement(eRow);
        });
        this.startRemoveAnimationFunctions.push( ()=> {
            _.addCssClass(eRow, 'ag-opacity-zero');
            if (_.exists(this.rowNode.rowTop)) {
                let rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
                this.setRowTop(rowTop);
            }
            // _.prepend(eParent, eRow);
        });

        if (this.animateIn) {
            this.animateRowIn(eRow, slideRowIn);
        }

        return eRow;
    }

    // puts animation into the row by setting start state and then final state in another VM turn
    // (another VM turn so the rendering engine will kick off once with start state, and then transition
    // into the end state)
    private animateRowIn(eRow: HTMLElement, slideRowIn: boolean): void {

        if (slideRowIn) {
            // for sliding the row in, we position the row in it's old position first
            let rowTop = this.roundRowTopToBounds(this.rowNode.oldRowTop);
            this.setRowTop(rowTop);

            // and then update the position to it's new position
            this.nextVmTurnFunctions.push(this.onTopChanged.bind(this));
        } else {
            // for fading in, we first set it invisible
            _.addCssClass(eRow, 'ag-opacity-zero');
            // and then transition to visible
            this.nextVmTurnFunctions.push( () => _.removeCssClass(eRow, 'ag-opacity-zero') );
        }
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    private roundRowTopToBounds(rowTop: number): number {
        let range = this.gridPanel.getVerticalPixelRange();
        let minPixel = range.top - 100;
        let maxPixel = range.bottom + 100;
        if (rowTop < minPixel) {
            return minPixel;
        } else if (rowTop > maxPixel) {
            return maxPixel;
        } else {
            return rowTop;
        }
    }

    private onRowDblClick(event: MouseEvent): void {
        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
    }

    public onRowClick(event: MouseEvent) {

        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(Events.EVENT_ROW_CLICKED, agEvent);

        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = event.ctrlKey || event.metaKey;

        var shiftKeyPressed = event.shiftKey;

        // we do not allow selecting groups by clicking (as the click here expands the group)
        // so return if it's a group row
        if (this.rowNode.group) {
            return;
        }

        // we also don't allow selection of floating rows
        if (this.rowNode.floating) {
            return;
        }

        // if no selection method enabled, do nothing
        if (!this.gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        if (this.rowNode.isSelected()) {
            if (multiSelectKeyPressed) {
                if (this.gridOptionsWrapper.isRowDeselection()) {
                    this.rowNode.setSelectedParams({newValue: false});
                }
            } else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({newValue: true, clearSelection: true});
            }
        } else {
            this.rowNode.setSelectedParams({newValue: true, clearSelection: !multiSelectKeyPressed, rangeSelect: shiftKeyPressed});
        }
    }

    public getRowNode(): any {
        return this.rowNode;
    }

    public refreshCells(cols: (string|ColDef|Column)[], animate: boolean): void {
        if (!cols) {
            return;
        }
        var columnsToRefresh = this.columnController.getGridColumns(cols);

        this.forEachRenderedCell( renderedCell => {
            var colForCel = renderedCell.getColumn();
            if (columnsToRefresh.indexOf(colForCel)>=0) {
                renderedCell.refreshCell(animate);
            }
        });
    }

    private addClassesFromRowClassFunc(): void {

        var classes: string[] = [];

        var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
        if (gridOptionsRowClassFunc) {
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowNode.rowIndex,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()
            };
            var classToUseFromFunc = gridOptionsRowClassFunc(params);
            if (classToUseFromFunc) {
                if (typeof classToUseFromFunc === 'string') {
                    classes.push(classToUseFromFunc);
                } else if (Array.isArray(classToUseFromFunc)) {
                    classToUseFromFunc.forEach(function (classItem: any) {
                        classes.push(classItem);
                    });
                }
            }
        }

        classes.forEach( (classStr: string) => {
            this.eAllRowContainers.forEach( row => _.addCssClass(row, classStr));
        });
    }

    private addGridClasses() {
        var classes: string[] = [];

        classes.push('ag-row');
        classes.push('ag-row-no-focus');

        if (this.gridOptionsWrapper.isAnimateRows()) {
            classes.push('ag-row-animation');
        } else {
            classes.push('ag-row-no-animation');
        }

        if (this.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (this.rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + this.rowNode.level);

            if (this.rowNode.footer) {
                classes.push('ag-row-footer');
            }
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.rowNode.parent) {
                classes.push('ag-row-level-' + (this.rowNode.parent.level + 1));
            } else {
                classes.push('ag-row-level-0');
            }
        }

        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }

        classes.forEach( (classStr: string) => {
            this.eAllRowContainers.forEach( row => _.addCssClass(row, classStr));
        });
    }

    private addExpandedAndContractedClasses(): void {
        let isGroupNode = this.rowNode.group && !this.rowNode.footer;
        if (!isGroupNode) { return; }

        let listener = () => {
            let expanded = this.rowNode.expanded;
            this.eAllRowContainers.forEach( row => _.addOrRemoveCssClass(row, 'ag-row-group-expanded', expanded));
            this.eAllRowContainers.forEach( row => _.addOrRemoveCssClass(row, 'ag-row-group-contracted', !expanded));
        };

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, listener);
    }

    private addClassesFromRowClass() {
        var classes: string[] = [];

        // add in extra classes provided by the config
        var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
        if (gridOptionsRowClass) {
            if (typeof gridOptionsRowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
            } else {
                if (typeof gridOptionsRowClass === 'string') {
                    classes.push(gridOptionsRowClass);
                } else if (Array.isArray(gridOptionsRowClass)) {
                    gridOptionsRowClass.forEach(function (classItem: any) {
                        classes.push(classItem);
                    });
                }
            }
        }

        classes.forEach( (classStr: string) => {
            this.eAllRowContainers.forEach( row => _.addCssClass(row, classStr));
        });
    }
}
