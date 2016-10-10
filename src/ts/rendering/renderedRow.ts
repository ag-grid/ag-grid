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
import {GridCell} from "../entities/gridCell";
import {CellRendererService} from "./cellRendererService";
import {CellRendererFactory} from "./cellRendererFactory";
import {ICellRenderer, ICellRendererFunc} from "./cellRenderers/iCellRenderer";
import {GridPanel} from "../gridPanel/gridPanel";

export class RenderedRow {

    public static EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('$compile') private $compile: any;
    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private ePinnedLeftRow: HTMLElement;
    private ePinnedRightRow: HTMLElement;
    private eBodyRow: HTMLElement;
    private eFullWidthRow: HTMLElement;
    private eAllRowContainers: HTMLElement[] = [];

    private fullWidthRowComponent: ICellRenderer;

    private renderedCells: {[key: string]: RenderedCell} = {};
    private scope: any;
    private rowNode: RowNode;
    private rowIndex: number;

    private fullWidthRow: boolean;
    private fullWidthCellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;
    private fullWidthCellRendererParams: any;

    private parentScope: any;
    private rowRenderer: RowRenderer;
    private eBodyContainer: HTMLElement;
    private eFullWidthContainer: HTMLElement;
    private ePinnedLeftContainer: HTMLElement;
    private ePinnedRightContainer: HTMLElement;

    private destroyFunctions: Function[] = [];

    private renderedRowEventService: EventService;

    private editingRow = false;

    private initialised = false;

    constructor(parentScope: any,
                rowRenderer: RowRenderer,
                eBodyContainer: HTMLElement,
                eFullWidthContainer: HTMLElement,
                ePinnedLeftContainer: HTMLElement,
                ePinnedRightContainer: HTMLElement,
                node: RowNode,
                rowIndex: number) {
        this.parentScope = parentScope;
        this.rowRenderer = rowRenderer;
        this.eBodyContainer = eBodyContainer;
        this.eFullWidthContainer = eFullWidthContainer;
        this.ePinnedLeftContainer = ePinnedLeftContainer;
        this.ePinnedRightContainer = ePinnedRightContainer;

        this.rowIndex = rowIndex;
        this.rowNode = node;
    }

    private setupRowContainers(): void {

        let isFullWidthCellFunc = this.gridOptionsWrapper.getIsFullWidthCellFunc();
        let isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        let isGroupSpanningRow = this.rowNode.group && this.gridOptionsWrapper.isGroupUseEntireRow();

        if (isFullWidthCell) {
            this.setupFullWidthContainers();
        } else if (isGroupSpanningRow) {
            this.setupFullWidthGroupContainers();
        } else {
            this.setupNormalContainers();
        }
    }

    private setupFullWidthContainers(): void {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getFullWidthCellRendererParams();
        if (_.missing(this.fullWidthCellRenderer)) {
            console.warn(`ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()`);
        }

        this.eFullWidthRow = this.createRowContainer(this.eFullWidthContainer);

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addMouseWheelListenerToFullWidthRow();
        }
    }

    private addMouseWheelListenerToFullWidthRow(): void {
        var mouseWheelListener = this.gridPanel.genericMouseWheelListener.bind(this.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.eFullWidthRow.addEventListener('mousewheel', mouseWheelListener);
        // Firefox
        this.eFullWidthRow.addEventListener('DOMMouseScroll', mouseWheelListener);

        this.destroyFunctions.push( ()=> {
            this.eFullWidthRow.removeEventListener('mousewheel', mouseWheelListener);
            this.eFullWidthRow.removeEventListener('DOMMouseScroll', mouseWheelListener);
        });
    }

    private setupFullWidthGroupContainers(): void {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getGroupRowRendererParams();

        if (!this.fullWidthCellRenderer) {
            this.fullWidthCellRenderer = CellRendererFactory.GROUP;
            this.fullWidthCellRendererParams = {
                innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer(),
            }
        }

        this.eFullWidthRow = this.createRowContainer(this.eFullWidthContainer);

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addMouseWheelListenerToFullWidthRow();
        }
    }

    private setupNormalContainers(): void {
        this.fullWidthRow = false;

        this.eBodyRow = this.createRowContainer(this.eBodyContainer);

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer(this.ePinnedLeftContainer);
            this.ePinnedRightRow = this.createRowContainer(this.ePinnedRightContainer);
        }
    }

    @PostConstruct
    public init(): void {

        this.setupRowContainers();

        this.scope = this.createChildScopeOrNull(this.rowNode.data);

        if (this.fullWidthRow) {
            this.refreshFullWidthComponent();
        } else {
            this.refreshCellsIntoRow();
        }

        this.addGridClasses();

        this.addStyleFromRowStyle();
        this.addStyleFromRowStyleFunc();

        this.addClassesFromRowClass();
        this.addClassesFromRowClassFunc();

        this.addRowIds();
        this.setTopAndHeightCss();

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
            rowIndex: this.rowIndex,
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

    public stopEditing(cancel = false): void {
        this.forEachRenderedCell( renderedCell => {
            renderedCell.stopEditing(cancel);
        });
        this.setEditingRow(false);
        if (!cancel) {
            var event = {
                node: this.rowNode,
                data: this.rowNode.data,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            this.mainEventService.dispatchEvent(Events.EVENT_ROW_VALUE_CHANGED, event);
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
    }

    // because data can change, especially in virtual pagination and viewport row models, need to allow setting
    // styles and classes after the data has changed
    private addDataChangedListener(): void {
        var dataChangedListener = ()=> {
            this.addStyleFromRowStyleFunc();
            this.addClassesFromRowClass();
        };

        this.rowNode.addEventListener(RowNode.EVENT_DATA_CHANGED, dataChangedListener);
        this.destroyFunctions.push( ()=> this.rowNode.removeEventListener(RowNode.EVENT_DATA_CHANGED, dataChangedListener) );
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

        this.mainEventService.addEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.mainEventService.addEventListener(Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
        this.mainEventService.addEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
        this.mainEventService.addEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);

        this.destroyFunctions.push( () => {
            this.mainEventService.removeEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
            this.mainEventService.removeEventListener(Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
            this.mainEventService.removeEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
            this.mainEventService.removeEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
        });
    }

    private onDisplayedColumnsChanged(event: ColumnChangeEvent): void {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (this.fullWidthRow) {
            var columnPinned = event.getType() === Events.EVENT_COLUMN_PINNED;
            if (columnPinned) {
                this.refreshFullWidthComponent();
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

    // method makes sure the right cells are present, and are in the right container. so when this gets called for
    // the first time, it sets up all the cells. but then over time the cells might appear / dissappear or move
    // container (ie into pinned)
    private refreshCellsIntoRow() {

        var columns = this.columnController.getAllDisplayedVirtualColumns();
        
        var renderedCellKeys = Object.keys(this.renderedCells);

        columns.forEach( (column: Column) => {
            var renderedCell = this.getOrCreateCell(column);
            this.ensureCellInCorrectRow(renderedCell);
            _.removeFromArray(renderedCellKeys, column.getColId());
        });

        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(renderedCellKeys);
    }

    private removeRenderedCells(colIds: string[]): void {
        colIds.forEach( (key: string)=> {
            var renderedCell = this.renderedCells[key];
            // could be old reference, ie removed cell
            if (_.missing(renderedCell)) { return; }

            if (renderedCell.getParentRow()) {
                renderedCell.getParentRow().removeChild(renderedCell.getGui());
                renderedCell.setParentRow(null);
            }

            renderedCell.destroy();
            this.renderedCells[key] = null;
        });
    }

    private ensureCellInCorrectRow(renderedCell: RenderedCell): void {
        var eRowGui = renderedCell.getGui();
        var column = renderedCell.getColumn();

        var rowWeWant: HTMLElement;
        switch (column.getPinned()) {
            case Column.PINNED_LEFT: rowWeWant = this.ePinnedLeftRow; break;
            case Column.PINNED_RIGHT: rowWeWant = this.ePinnedRightRow; break;
            default: rowWeWant = this.eBodyRow; break;
        }

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
            var renderedCell = new RenderedCell(column,
                this.rowNode, this.rowIndex, this.scope, this);
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
        var rowSelectedListener = this.onRowSelected.bind(this);
        this.rowNode.addEventListener(RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        this.destroyFunctions.push(()=> {
            this.rowNode.removeEventListener(RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        });
    }

    private addHoverFunctionality(): void {

        var onGuiMouseEnter = this.rowNode.onMouseEnter.bind(this.rowNode);
        var onGuiMouseLeave = this.rowNode.onMouseLeave.bind(this.rowNode);
        
        this.eAllRowContainers.forEach( eRow => {
            eRow.addEventListener('mouseenter', onGuiMouseEnter);
            eRow.addEventListener('mouseleave', onGuiMouseLeave);
        });

        var onNodeMouseEnter = this.addHoverClass.bind(this, true);
        var onNodeMouseLeave = this.addHoverClass.bind(this, false);

        this.rowNode.addEventListener(RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
        this.rowNode.addEventListener(RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);

        this.destroyFunctions.push( ()=> {
            this.eAllRowContainers.forEach( eRow => {
                eRow.removeEventListener('mouseenter', onGuiMouseEnter);
                eRow.removeEventListener('mouseleave', onGuiMouseLeave);
            });

            this.rowNode.removeEventListener(RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
            this.rowNode.removeEventListener(RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);
        });
    }
    
    private addHoverClass(hover: boolean): void {
        this.eAllRowContainers.forEach( eRow => _.addOrRemoveCssClass(eRow, 'ag-row-hover', hover) );
    }

    private addCellFocusedListener(): void {
        var rowFocusedLastTime: boolean = null;
        var rowFocusedListener = () => {
            var rowFocused = this.focusedCellController.isRowFocused(this.rowIndex, this.rowNode.floating);
            if (rowFocused !== rowFocusedLastTime) {
                this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused) );
                this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused) );
                rowFocusedLastTime = rowFocused;
            }

            if (!rowFocused && this.editingRow) {
                this.stopEditing(false);
            }
        };
        this.mainEventService.addEventListener(Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        this.destroyFunctions.push(()=> {
            this.mainEventService.removeEventListener(Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        });
        rowFocusedListener();
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
        this.rowNode.addEventListener(RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
        this.destroyFunctions.push(()=> {
            this.rowNode.removeEventListener(RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
        });
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent, cell: GridCell): void {
        var renderedCell = this.renderedCells[cell.column.getId()];
        if (renderedCell) {
            renderedCell.onMouseEvent(eventName, mouseEvent);
        }
    }

    private setTopAndHeightCss(): void {
        // if showing scrolls, position on the container
        if (!this.gridOptionsWrapper.isForPrint()) {
            var topPx = this.rowNode.rowTop + "px";
            this.eAllRowContainers.forEach( row => row.style.top = topPx);
        }
        var heightPx = this.rowNode.rowHeight + 'px';
        this.eAllRowContainers.forEach( row => row.style.height = heightPx);
    }

    // adds in row and row-id attributes to the row
    private addRowIds(): void {
        var rowStr = this.rowIndex.toString();
        if (this.rowNode.floating===Constants.FLOATING_BOTTOM) {
            rowStr = 'fb-' + rowStr;
        } else if (this.rowNode.floating===Constants.FLOATING_TOP) {
            rowStr = 'ft-' + rowStr;
        }
        this.eAllRowContainers.forEach( row => row.setAttribute('row', rowStr) );

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

    public destroy(): void {

        this.destroyScope();
        this.destroyFullWidthComponent();
        this.forEachRenderedCell( renderedCell => renderedCell.destroy() );

        this.destroyFunctions.forEach( func => func() );

        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, {node: this.rowNode});
        }
    }

    private destroyScope(): void {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    }

    public isDataInList(rows: any[]): boolean {
        return rows.indexOf(this.rowNode.data) >= 0;
    }

    public isGroup(): boolean {
        return this.rowNode.group === true;
    }

    private refreshFullWidthComponent(): void {
        this.destroyFullWidthComponent();
        this.createFullWidthComponent();
    }

    private createFullWidthComponent(): void {
        var params = this.createFullWidthParams(this.eFullWidthRow);
        this.fullWidthRowComponent = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRow, params);
        this.angular1Compile(this.eFullWidthRow);
    }

    private destroyFullWidthComponent(): void {
        if (this.fullWidthRowComponent && this.fullWidthRowComponent.destroy) {
            this.fullWidthRowComponent.destroy();
            this.fullWidthRowComponent = null;
        }
        _.removeAllChildren(this.eFullWidthRow);
    }

    private createFullWidthParams(eRow: HTMLElement): any {
        var params = {
            data: this.rowNode.data,
            node: this.rowNode,
            $scope: this.scope,
            rowIndex: this.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            eGridCell: eRow,
            eParentOfValue: eRow,
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

    private createGroupSpanningEntireRowCell(padding: boolean): HTMLElement {
        var eRow: HTMLElement = document.createElement('span');
        // padding means we are on the right hand side of a pinned table, ie
        // in the main body.
        if (!padding) {

            var params = this.createFullWidthParams(eRow);

            var cellComponent = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, eRow, params);

            if (cellComponent && cellComponent.destroy) {
                this.destroyFunctions.push( () => cellComponent.destroy() );
            }
        }

        if (this.rowNode.footer) {
            _.addCssClass(eRow, 'ag-footer-cell-entire-row');
        } else {
            _.addCssClass(eRow, 'ag-group-cell-entire-row');
        }

        return eRow;
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
            rowIndex: this.rowIndex,
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

    private createRowContainer(eParent: HTMLElement): HTMLElement {
        var eRow = document.createElement('div');

        var rowClickListener = this.onRowClick.bind(this);
        var rowDblClickListener = this.onRowDblClick.bind(this);

        eRow.addEventListener("click", rowClickListener);
        eRow.addEventListener("dblclick", rowDblClickListener);

        eParent.appendChild(eRow);

        this.eAllRowContainers.push(eRow);

        this.destroyFunctions.push( ()=> {
            eRow.removeEventListener("click", rowClickListener);
            eRow.removeEventListener("dblclick", rowDblClickListener);
            eParent.removeChild(eRow);
        });

        return eRow;
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

        // making local variables to make the below more readable
        var gridOptionsWrapper = this.gridOptionsWrapper;

        // if no selection method enabled, do nothing
        if (!gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        if (this.rowNode.isSelected()) {
            if (multiSelectKeyPressed) {
                if (gridOptionsWrapper.isRowDeselection()) {
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

    public refreshCells(colIds: string[], animate: boolean): void {
        if (!colIds) {
            return;
        }
        var columnsToRefresh = this.columnController.getGridColumns(colIds);

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
                rowIndex: this.rowIndex,
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

        classes.push(this.rowIndex % 2 == 0 ? 'ag-row-even' : 'ag-row-odd');

        if (this.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (this.rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + this.rowNode.level);

            if (!this.rowNode.footer && this.rowNode.expanded) {
                classes.push('ag-row-group-expanded');
            }
            if (!this.rowNode.footer && !this.rowNode.expanded) {
                // opposite of expanded is contracted according to the internet.
                classes.push('ag-row-group-contracted');
            }
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
