import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { GridPanel, RowContainerComponents } from "../gridPanel/gridPanel";
import { EventService } from "../eventService";
import { RowComp } from "./rowComp";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Events, FirstDataRenderedEvent, ModelUpdatedEvent, ViewportChangedEvent } from "../events";
import { Constants } from "../constants";
import { CellComp } from "./cellComp";
import { Autowired, Bean, Optional, Qualifier } from "../context/context";
import { GridCore } from "../gridCore";
import { ColumnApi } from "../columnController/columnApi";
import { ColumnController } from "../columnController/columnController";
import { Logger, LoggerFactory } from "../logger";
import { FocusedCellController } from "../focusedCellController";
import { IRangeController } from "../interfaces/iRangeController";
import { CellNavigationService } from "../cellNavigationService";
import { CellPosition } from "../entities/cellPosition";
import { NavigateToNextCellParams, TabToNextCellParams } from "../entities/gridOptions";
import { RowContainerComponent } from "./rowContainerComponent";
import { BeanStub } from "../context/beanStub";
import { PaginationProxy } from "../rowModels/paginationProxy";
import { FlashCellsParams, GetCellRendererInstancesParams, GridApi, RefreshCellsParams } from "../gridApi";
import { PinnedRowModel } from "../rowModels/pinnedRowModel";
import { Beans } from "./beans";
import { AnimationFrameService } from "../misc/animationFrameService";
import { MaxDivHeightScaler } from "./maxDivHeightScaler";
import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { ICellEditorComp } from "../interfaces/iCellEditor";
import { IRowModel } from "../interfaces/iRowModel";
import { _ } from "../utils";
import { RowPosition, RowPositionUtils } from "../entities/rowPosition";

@Bean("rowRenderer")
export class RowRenderer extends BeanStub {

    @Autowired("paginationProxy") private paginationProxy: PaginationProxy;
    @Autowired("columnController") private columnController: ColumnController;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("$scope") private $scope: any;
    @Autowired("eventService") private eventService: EventService;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;
    @Autowired("rowModel") private rowModel: IRowModel;
    @Autowired("loggerFactory") private loggerFactory: LoggerFactory;
    @Autowired("focusedCellController") private focusedCellController: FocusedCellController;
    @Autowired("cellNavigationService") private cellNavigationService: CellNavigationService;
    @Autowired("columnApi") private columnApi: ColumnApi;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("beans") private beans: Beans;
    @Autowired("maxDivHeightScaler") private maxDivHeightScaler: MaxDivHeightScaler;
    @Autowired("animationFrameService") private animationFrameService: AnimationFrameService;
    @Autowired("rowPositionUtils") private rowPositionUtils: RowPositionUtils;
    @Optional("rangeController") private rangeController: IRangeController;

    private gridPanel: GridPanel;

    private destroyFuncsForColumnListeners: (() => void)[] = [];

    private firstRenderedRow: number;
    private lastRenderedRow: number;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom.
    private rowCompsByIndex: { [key: string]: RowComp } = {};
    private floatingTopRowComps: RowComp[] = [];
    private floatingBottomRowComps: RowComp[] = [];

    private rowContainers: RowContainerComponents;

    private pinningLeft: boolean;
    private pinningRight: boolean;

    // we only allow one refresh at a time, otherwise the internal memory structure here
    // will get messed up. this can happen if the user has a cellRenderer, and inside the
    // renderer they call an API method that results in another pass of the refresh,
    // then it will be trying to draw rows in the middle of a refresh.
    private refreshInProgress = false;

    private logger: Logger;

    private printLayout: boolean;
    private embedFullWidthRows: boolean;

    private gridCore: GridCore;

    public registerGridCore(gridCore: GridCore): void {
        this.gridCore = gridCore;
    }

    public getGridCore(): GridCore {
        return this.gridCore;
    }

    public agWire(@Qualifier("loggerFactory") loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create("RowRenderer");
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;

        this.rowContainers = this.gridPanel.getRowContainers();
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_BODY_SCROLL, this.redrawAfterScroll.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));

        this.registerCellEventListeners();

        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.embedFullWidthRows = this.printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();

        this.redrawAfterModelUpdate();
    }

    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    private registerCellEventListeners(): void {

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_FOCUSED, event => {
            this.forEachCellComp(cellComp => cellComp.onCellFocused(event));
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_FLASH_CELLS, event => {
            this.forEachCellComp(cellComp => cellComp.onFlashCells(event));
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, () => {
            this.forEachCellComp(cellComp => cellComp.onColumnHover());
        });

        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, () => {
            if (this.printLayout) {
                this.forEachCellComp(cellComp => cellComp.onLeftChanged());
            }
        });

        const rangeSelectionEnabled = this.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {

            this.addDestroyableEventListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, () => {
                this.forEachCellComp(cellComp => cellComp.onRangeSelectionChanged());
            });
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PINNED, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });

        }

        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addDestroyableEventListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));

        this.addDestroyFunc(this.removeGridColumnListeners.bind(this));
    }

    // executes all functions in destroyFuncsForColumnListeners and then clears the list
    private removeGridColumnListeners(): void {
        this.destroyFuncsForColumnListeners.forEach(func => func());
        this.destroyFuncsForColumnListeners.length = 0;
    }

    // this function adds listeners onto all the grid columns, which are the column that we could have cellComps for.
    // when the grid columns change, we add listeners again. in an ideal design, each CellComp would just register to
    // the column it belongs to on creation, however this was a bottleneck with the number of cells, so do it here
    // once instead.
    private refreshListenersToColumnsForCellComps(): void {

        this.removeGridColumnListeners();

        const cols = this.columnController.getAllGridColumns();

        if (!cols) { return; }

        cols.forEach(col => {

            const forEachCellWithThisCol = (callback: (cellComp: CellComp) => void) => {
                this.forEachCellComp(cellComp => {
                    if (cellComp.getColumn() === col) {
                        callback(cellComp);
                    }
                });
            };

            const leftChangedListener = () => {
                forEachCellWithThisCol(cellComp => cellComp.onLeftChanged());
            };
            const widthChangedListener = () => {
                forEachCellWithThisCol(cellComp => cellComp.onWidthChanged());
            };
            const firstRightPinnedChangedListener = () => {
                forEachCellWithThisCol(cellComp => cellComp.onFirstRightPinnedChanged());
            };
            const lastLeftPinnedChangedListener = () => {
                forEachCellWithThisCol(cellComp => cellComp.onLastLeftPinnedChanged());
            };

            col.addEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
            col.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            col.addEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstRightPinnedChangedListener);
            col.addEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, lastLeftPinnedChangedListener);

            this.destroyFuncsForColumnListeners.push(() => {
                col.removeEventListener(Column.EVENT_LEFT_CHANGED, leftChangedListener);
                col.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                col.removeEventListener(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstRightPinnedChangedListener);
                col.removeEventListener(Column.EVENT_LAST_LEFT_PINNED_CHANGED, lastLeftPinnedChangedListener);
            });
        });

    }

    private onDomLayoutChanged(): void {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        const embedFullWidthRows = printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();

        // if moving towards or away from print layout, means we need to destroy all rows, as rows are not laid
        // out using absolute positioning when doing print layout
        const destroyRows = embedFullWidthRows !== this.embedFullWidthRows || this.printLayout !== printLayout;

        this.printLayout = printLayout;
        this.embedFullWidthRows = embedFullWidthRows;

        if (destroyRows) {
            this.redrawAfterModelUpdate();
        }
    }

    // for row models that have datasources, when we update the datasource, we need to force the rowRenderer
    // to redraw all rows. otherwise the old rows from the old datasource will stay displayed.
    public datasourceChanged(): void {
        this.firstRenderedRow = 0;
        this.lastRenderedRow = -1;
        const rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
    }

    private onPageLoaded(refreshEvent?: ModelUpdatedEvent): void {
        if (_.missing(refreshEvent)) {
            refreshEvent = {
                type: Events.EVENT_MODEL_UPDATED,
                api: this.gridApi,
                columnApi: this.columnApi,
                animate: false,
                keepRenderedRows: false,
                newData: false,
                newPage: false
            };
        }
        this.onModelUpdated(refreshEvent);
    }

    public getAllCellsForColumn(column: Column): HTMLElement[] {
        const eCells: HTMLElement[] = [];

        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
        _.iterateObject(this.floatingTopRowComps, callback);

        function callback(key: any, rowComp: RowComp) {
            const eCell = rowComp.getCellForCol(column);
            if (eCell) {
                eCells.push(eCell);
            }
        }

        return eCells;
    }

    public refreshFloatingRowComps(): void {
        this.refreshFloatingRows(
            this.floatingTopRowComps,
            this.pinnedRowModel.getPinnedTopRowData(),
            this.rowContainers.floatingTopPinnedLeft,
            this.rowContainers.floatingTopPinnedRight,
            this.rowContainers.floatingTop,
            this.rowContainers.floatingTopFullWidth
        );
        this.refreshFloatingRows(
            this.floatingBottomRowComps,
            this.pinnedRowModel.getPinnedBottomRowData(),
            this.rowContainers.floatingBottomPinnedLeft,
            this.rowContainers.floatingBottomPinnedRight,
            this.rowContainers.floatingBottom,
            this.rowContainers.floatingBottomFullWith
        );
    }

    private refreshFloatingRows(
        rowComps: RowComp[],
        rowNodes: RowNode[],
        pinnedLeftContainerComp: RowContainerComponent,
        pinnedRightContainerComp: RowContainerComponent,
        bodyContainerComp: RowContainerComponent,
        fullWidthContainerComp: RowContainerComponent
    ): void {
        rowComps.forEach((row: RowComp) => {
            row.destroy();
        });

        rowComps.length = 0;

        if (rowNodes) {
            rowNodes.forEach((node: RowNode) => {
                const rowComp = new RowComp(
                    this.$scope,
                    bodyContainerComp,
                    pinnedLeftContainerComp,
                    pinnedRightContainerComp,
                    fullWidthContainerComp,
                    node,
                    this.beans,
                    false,
                    false,
                    this.printLayout,
                    this.embedFullWidthRows
                );

                rowComp.init();
                rowComps.push(rowComp);
            });
        }

        this.flushContainers(rowComps);
    }

    private onPinnedRowDataChanged(): void {
        // recycling rows in order to ensure cell editing is not cancelled
        const params: RefreshViewParams = {
            recycleRows: true
        };

        this.redrawAfterModelUpdate(params);
    }

    private onModelUpdated(refreshEvent: ModelUpdatedEvent): void {
        const params: RefreshViewParams = {
            recycleRows: refreshEvent.keepRenderedRows,
            animate: refreshEvent.animate,
            newData: refreshEvent.newData,
            newPage: refreshEvent.newPage,
            // because this is a model updated event (not pinned rows), we
            // can skip updating the pinned rows. this is needed so that if user
            // is doing transaction updates, the pinned rows are not getting constantly
            // trashed - or editing cells in pinned rows are not refreshed and put into read mode
            onlyBody: true
        };
        this.redrawAfterModelUpdate(params);
    }

    // if the row nodes are not rendered, no index is returned
    private getRenderedIndexesForRowNodes(rowNodes: RowNode[]): string[] {
        const result: string[] = [];
        if (_.missing(rowNodes)) {
            return result;
        }
        _.iterateObject(this.rowCompsByIndex, (index: string, renderedRow: RowComp) => {
            const rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                result.push(index);
            }
        });
        return result;
    }

    public redrawRows(rowNodes: RowNode[]): void {
        if (!rowNodes || rowNodes.length == 0) {
            return;
        }

        // we only need to be worried about rendered rows, as this method is
        // called to what's rendered. if the row isn't rendered, we don't care
        const indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes);

        // remove the rows
        this.removeRowComps(indexesToRemove);

        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: true
        });
    }

    private getCellToRestoreFocusToAfterRefresh(params: RefreshViewParams): CellPosition {
        const focusedCell = params.suppressKeepFocus ? null : this.focusedCellController.getFocusCellToUseAfterRefresh();

        if (_.missing(focusedCell)) {
            return null;
        }

        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        const activeElement = document.activeElement;
        const domData = this.gridOptionsWrapper.getDomData(activeElement, CellComp.DOM_DATA_KEY_CELL_COMP);
        const elementIsNotACellDev = _.missing(domData);
        if (elementIsNotACellDev) {
            return null;
        }

        return focusedCell;
    }

    // gets called after changes to the model.
    public redrawAfterModelUpdate(params: RefreshViewParams = {}): void {
        this.getLockOnRefresh();

        const focusedCell: CellPosition = this.getCellToRestoreFocusToAfterRefresh(params);

        this.sizeContainerToPageHeight();

        this.scrollToTopIfNewData(params);

        // never recycle rows when print layout, we draw each row again from scratch. this is because print layout
        // uses normal dom layout to put cells into dom - it doesn't allow reordering rows.
        const recycleRows = !this.printLayout && params.recycleRows;
        const animate = params.animate && this.gridOptionsWrapper.isAnimateRows();

        const rowsToRecycle: { [key: string]: RowComp } = this.binRowComps(recycleRows);

        this.redraw(rowsToRecycle, animate);

        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }

        this.restoreFocusedCell(focusedCell);

        this.releaseLockOnRefresh();
    }

    private scrollToTopIfNewData(params: RefreshViewParams): void {
        const scrollToTop = params.newData || params.newPage;
        const suppressScrollToTop = this.gridOptionsWrapper.isSuppressScrollOnNewData();
        if (scrollToTop && !suppressScrollToTop) {
            this.gridPanel.scrollToTop();
        }
    }

    private sizeContainerToPageHeight(): void {
        const containers: RowContainerComponent[] = [
            this.rowContainers.body,
            this.rowContainers.fullWidth,
            this.rowContainers.pinnedLeft,
            this.rowContainers.pinnedRight
        ];

        if (this.printLayout) {
            containers.forEach(container => container.setHeight(null));
            return;
        }

        let containerHeight = this.paginationProxy.getCurrentPageHeight();
        // we need at least 1 pixel for the horizontal scroll to work. so if there are now rows,
        // we still want the scroll to be present, otherwise there would be no way to scroll the header
        // which might be needed us user wants to access columns
        // on the RHS - and if that was where the filter was that cause no rows to be presented, there
        // is no way to remove the filter.
        if (containerHeight === 0) {
            containerHeight = 1;
        }

        this.maxDivHeightScaler.setModelHeight(containerHeight);

        const realHeight = this.maxDivHeightScaler.getUiContainerHeight();

        containers.forEach(container => container.setHeight(realHeight));
    }

    private getLockOnRefresh(): void {
        if (this.refreshInProgress) {
            throw new Error(
                "ag-Grid: cannot get grid to draw rows when it is in the middle of drawing rows. " +
                    "Your code probably called a grid API method while the grid was in the render stage. To overcome " +
                    "this, put the API call into a timeout, eg instead of api.refreshView(), " +
                    "call setTimeout(function(){api.refreshView(),0}). To see what part of your code " +
                    "that caused the refresh check this stacktrace."
            );
        }

        this.refreshInProgress = true;
    }

    private releaseLockOnRefresh(): void {
        this.refreshInProgress = false;
    }

    // sets the focus to the provided cell, if the cell is provided. this way, the user can call refresh without
    // worry about the focus been lost. this is important when the user is using keyboard navigation to do edits
    // and the cellEditor is calling 'refresh' to get other cells to update (as other cells might depend on the
    // edited cell).
    private restoreFocusedCell(cellPosition: CellPosition): void {
        if (cellPosition) {
            this.focusedCellController.setFocusedCell(cellPosition.rowIndex, cellPosition.column, cellPosition.rowPinned, true);
        }
    }

    public stopEditing(cancel: boolean = false) {
        this.forEachRowComp((key: string, rowComp: RowComp) => {
            rowComp.stopEditing(cancel);
        });
    }

    public forEachCellComp(callback: (cellComp: CellComp) => void): void {
        this.forEachRowComp((key: string, rowComp: RowComp) => rowComp.forEachCellComp(callback));
    }

    private forEachRowComp(callback: (key: string, rowComp: RowComp) => void): void {
        _.iterateObject(this.rowCompsByIndex, callback);
        _.iterateObject(this.floatingTopRowComps, callback);
        _.iterateObject(this.floatingBottomRowComps, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void {
        const rowComp = this.rowCompsByIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    }

    public flashCells(params: FlashCellsParams = {}): void {
        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => cellComp.flashCell());
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        const refreshCellParams = {
            forceRefresh: params.force,
            newData: false
        };
        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => cellComp.refreshCell(refreshCellParams));
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams): ICellRendererComp[] {

        const res: ICellRendererComp[] = [];

        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => {
            const cellRenderer = cellComp.getCellRenderer();
            if (cellRenderer) {
                res.push(cellRenderer);
            }
        });

        return res;
    }

    public getCellEditorInstances(params: GetCellRendererInstancesParams): ICellEditorComp[] {

        const res: ICellEditorComp[] = [];

        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => {
            const cellEditor = cellComp.getCellEditor();
            if (cellEditor) {
                res.push(cellEditor);
            }
        });

        return res;
    }

    public getEditingCells(): CellPosition[] {
        const res: CellPosition[] = [];
        this.forEachCellComp(cellComp => {
            if (cellComp.isEditing()) {
                const cellPosition = cellComp.getCellPosition();
                res.push(cellPosition);
            }
        });
        return res;
    }

    // calls the callback for each cellComp that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so callback gets called 4 times, once for each cell.
    private forEachCellCompFiltered(rowNodes: RowNode[], columns: (string | Column)[], callback: (cellComp: CellComp) => void): void {
        let rowIdsMap: any;
        if (_.exists(rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };
            rowNodes.forEach(rowNode => {
                if (rowNode.rowPinned === Constants.PINNED_TOP) {
                    rowIdsMap.top[rowNode.id] = true;
                } else if (rowNode.rowPinned === Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[rowNode.id] = true;
                } else {
                    rowIdsMap.normal[rowNode.id] = true;
                }
            });
        }

        let colIdsMap: any;
        if (_.exists(columns)) {
            colIdsMap = {};
            columns.forEach((colKey: string | Column) => {
                const column: Column = this.columnController.getGridColumn(colKey);
                if (_.exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }

        const processRow = (rowComp: RowComp) => {
            const rowNode: RowNode = rowComp.getRowNode();

            const id = rowNode.id;
            const floating = rowNode.rowPinned;

            // skip this row if it is missing from the provided list
            if (_.exists(rowIdsMap)) {
                if (floating === Constants.PINNED_BOTTOM) {
                    if (!rowIdsMap.bottom[id]) {
                        return;
                    }
                } else if (floating === Constants.PINNED_TOP) {
                    if (!rowIdsMap.top[id]) {
                        return;
                    }
                } else {
                    if (!rowIdsMap.normal[id]) {
                        return;
                    }
                }
            }

            rowComp.forEachCellComp(cellComp => {
                const colId: string = cellComp.getColumn().getId();
                const excludeColFromRefresh = colIdsMap && !colIdsMap[colId];
                if (excludeColFromRefresh) {
                    return;
                }

                callback(cellComp);
            });
        };

        _.iterateObject(this.rowCompsByIndex, (index: string, rowComp: RowComp) => {
            processRow(rowComp);
        });

        if (this.floatingTopRowComps) {
            this.floatingTopRowComps.forEach(processRow);
        }

        if (this.floatingBottomRowComps) {
            this.floatingBottomRowComps.forEach(processRow);
        }
    }

    public destroy() {
        super.destroy();

        const rowIndexesToRemove = Object.keys(this.rowCompsByIndex);
        this.removeRowComps(rowIndexesToRemove);
    }

    private binRowComps(recycleRows: boolean): { [key: string]: RowComp } {
        let indexesToRemove: string[];
        const rowsToRecycle: { [key: string]: RowComp } = {};

        if (recycleRows) {
            indexesToRemove = [];
            _.iterateObject(this.rowCompsByIndex, (index: string, rowComp: RowComp) => {
                const rowNode = rowComp.getRowNode();
                if (_.exists(rowNode.id)) {
                    rowsToRecycle[rowNode.id] = rowComp;
                    delete this.rowCompsByIndex[index];
                } else {
                    indexesToRemove.push(index);
                }
            });
        } else {
            indexesToRemove = Object.keys(this.rowCompsByIndex);
        }

        this.removeRowComps(indexesToRemove);

        return rowsToRecycle;
    }

    // takes array of row indexes
    private removeRowComps(rowsToRemove: any[]) {
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach(indexToRemove => {
            const renderedRow = this.rowCompsByIndex[indexToRemove];
            renderedRow.destroy();
            delete this.rowCompsByIndex[indexToRemove];
        });
    }

    // gets called when rows don't change, but viewport does, so after:
    // 1) height of grid body changes, ie number of displayed rows has changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    public redrawAfterScroll() {
        this.getLockOnRefresh();
        this.redraw(null, false, true);
        this.releaseLockOnRefresh();
    }

    private removeRowCompsNotToDraw(indexesToDraw: number[]): void {
        // for speedy lookup, dump into map
        const indexesToDrawMap: { [index: string]: boolean } = {};
        indexesToDraw.forEach(index => (indexesToDrawMap[index] = true));

        const existingIndexes = Object.keys(this.rowCompsByIndex);
        const indexesNotToDraw: string[] = _.filter(existingIndexes, index => !indexesToDrawMap[index]);

        this.removeRowComps(indexesNotToDraw);
    }

    private calculateIndexesToDraw(): number[] {
        // all in all indexes in the viewport
        const indexesToDraw = _.createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);

        // add in indexes of rows we want to keep, because they are currently editing
        _.iterateObject(this.rowCompsByIndex, (indexStr: string, rowComp: RowComp) => {
            const index = Number(indexStr);
            if (index < this.firstRenderedRow || index > this.lastRenderedRow) {
                if (this.doNotUnVirtualiseRow(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        });

        indexesToDraw.sort((a: number, b: number) => a - b);

        return indexesToDraw;
    }

    private redraw(rowsToRecycle?: { [key: string]: RowComp }, animate = false, afterScroll = false) {
        this.maxDivHeightScaler.updateOffset();
        this.workOutFirstAndLastRowsToRender();

        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport

        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        const indexesToDraw = this.calculateIndexesToDraw();

        this.removeRowCompsNotToDraw(indexesToDraw);

        // never animate when doing print layout - as we want to get things ready to print as quickly as possible,
        // otherwise we risk the printer printing a row that's half faded (half way through fading in)
        if (this.printLayout) {
            animate = false;
        }

        // add in new rows
        const nextVmTurnFunctions: Function[] = [];

        const rowComps: RowComp[] = [];
        indexesToDraw.forEach(rowIndex => {
            const rowComp = this.createOrUpdateRowComp(rowIndex, rowsToRecycle, animate, afterScroll);
            if (_.exists(rowComp)) {
                rowComps.push(rowComp);
                _.pushAll(nextVmTurnFunctions, rowComp.getAndClearNextVMTurnFunctions());
            }
        });

        this.flushContainers(rowComps);

        _.executeNextVMTurn(nextVmTurnFunctions);

        const useAnimationFrame = afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame() && !this.printLayout;
        if (useAnimationFrame) {
            this.beans.taskQueue.addP2Task(this.destroyRowComps.bind(this, rowsToRecycle, animate));
        } else {
            this.destroyRowComps(rowsToRecycle, animate);
        }

        this.checkAngularCompile();
        this.gridPanel.updateRowCount();
    }

    private flushContainers(rowComps: RowComp[]): void {
        _.iterateObject(this.rowContainers, (key: string, rowContainerComp: RowContainerComponent) => {
            if (rowContainerComp) {
                rowContainerComp.flushRowTemplates();
            }
        });

        rowComps.forEach(rowComp => rowComp.afterFlush());
    }

    private onDisplayedColumnsChanged(): void {
        const pinningLeft = this.columnController.isPinningLeft();
        const pinningRight = this.columnController.isPinningRight();
        const atLeastOneChanged = this.pinningLeft !== pinningLeft || pinningRight !== this.pinningRight;
        if (atLeastOneChanged) {
            this.pinningLeft = pinningLeft;
            this.pinningRight = pinningRight;
            if (this.embedFullWidthRows) {
                this.redrawFullWidthEmbeddedRows();
            }
        }
    }

    // when embedding, what gets showed in each section depends on what is pinned. eg if embedding group expand / collapse,
    // then it should go into the pinned left area if pinning left, or the center area if not pinning.
    private redrawFullWidthEmbeddedRows(): void {
        // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
        // embedded, as what appears in each section depends on whether we are pinned or not
        const rowsToRemove: string[] = [];

        _.iterateObject(this.rowCompsByIndex, (id: string, rowComp: RowComp) => {
            if (rowComp.isFullWidth()) {
                const rowIndex = rowComp.getRowNode().rowIndex;
                rowsToRemove.push(rowIndex.toString());
            }
        });

        this.refreshFloatingRowComps();
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    }

    public refreshFullWidthRows(): void {
        const rowsToRemove: string[] = [];
        _.iterateObject(this.rowCompsByIndex, (id: string, rowComp: RowComp) => {
            if (rowComp.isFullWidth()) {
                const fullWidthRowsRefreshed = rowComp.refreshFullWidth();
                if (!fullWidthRowsRefreshed) {
                    const rowIndex = rowComp.getRowNode().rowIndex;
                    rowsToRemove.push(rowIndex.toString());
                }
            }
        });
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    }

    private createOrUpdateRowComp(rowIndex: number, rowsToRecycle: { [key: string]: RowComp }, animate: boolean, afterScroll: boolean): RowComp {
        let rowNode: RowNode;

        let rowComp: RowComp = this.rowCompsByIndex[rowIndex];

        // if no row comp, see if we can get it from the previous rowComps
        if (!rowComp) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (_.exists(rowNode) && _.exists(rowsToRecycle) && rowsToRecycle[rowNode.id] && rowNode.alreadyRendered) {
                rowComp = rowsToRecycle[rowNode.id];
                rowsToRecycle[rowNode.id] = null;
            }
        }

        const creatingNewRowComp = !rowComp;

        if (creatingNewRowComp) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }
            if (_.exists(rowNode)) {
                rowComp = this.createRowComp(rowNode, animate, afterScroll);
            } else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        } else {
            // ensure row comp is in right position in DOM
            rowComp.ensureDomOrder();
        }

        if (rowNode) {
            // set node as 'alreadyRendered' to ensure we only recycle rowComps that have been rendered, this ensures
            // we don't reuse rowComps that have been removed and then re-added in the same batch transaction.
            rowNode.alreadyRendered = true;
        }

        this.rowCompsByIndex[rowIndex] = rowComp;

        return rowComp;
    }

    private destroyRowComps(rowCompsMap: { [key: string]: RowComp }, animate: boolean): void {
        const delayedFuncs: Function[] = [];
        _.iterateObject(rowCompsMap, (nodeId: string, rowComp: RowComp) => {
            // if row was used, then it's null
            if (!rowComp) {
                return;
            }
            rowComp.destroy(animate);
            _.pushAll(delayedFuncs, rowComp.getAndClearDelayedDestroyFunctions());
        });
        _.executeInAWhile(delayedFuncs);
    }

    private checkAngularCompile(): void {
        // if we are doing angular compiling, then do digest the scope here
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            // we do it in a timeout, in case we are already in an apply
            window.setTimeout(() => {
                this.$scope.$apply();
            }, 0);
        }
    }

    private workOutFirstAndLastRowsToRender(): void {

        let newFirst: number;
        let newLast: number;

        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        } else if (this.printLayout) {
            newFirst = this.paginationProxy.getPageFirstRow();
            newLast = this.paginationProxy.getPageLastRow();
        } else {

            const paginationOffset = this.paginationProxy.getPixelOffset();
            const maxDivHeightScaler = this.maxDivHeightScaler.getOffset();

            const bodyVRange = this.gridPanel.getVScrollPosition();
            const bodyTopPixel = bodyVRange.top;
            const bodyBottomPixel = bodyVRange.bottom;

            const bufferPixels = this.gridOptionsWrapper.getRowBufferInPixels();

            const firstPixel = bodyTopPixel + paginationOffset + maxDivHeightScaler - bufferPixels;
            const lastPixel = bodyBottomPixel + paginationOffset + maxDivHeightScaler + bufferPixels;

            this.ensureAllRowsInRangeHaveHeightsCalculated(firstPixel, lastPixel);

            let firstRowIndex = this.paginationProxy.getRowIndexAtPixel(firstPixel);
            let lastRowIndex = this.paginationProxy.getRowIndexAtPixel(lastPixel);

            const pageFirstRow = this.paginationProxy.getPageFirstRow();
            const pageLastRow = this.paginationProxy.getPageLastRow();

            // adjust, in case buffer extended actual size
            if (firstRowIndex < pageFirstRow) {
                firstRowIndex = pageFirstRow;
            }

            if (lastRowIndex > pageLastRow) {
                lastRowIndex = pageLastRow;
            }

            newFirst = firstRowIndex;
            newLast = lastRowIndex;
        }

        // sometimes user doesn't set CSS right and ends up with grid with no height and grid ends up
        // trying to render all the rows, eg 10,000+ rows. this will kill the browser. so instead of
        // killing the browser, we limit the number of rows. just in case some use case we didn't think
        // of, we also have a property to not do this operation.
        const rowLayoutNormal = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;
        const suppressRowCountRestriction = this.gridOptionsWrapper.isSuppressMaxRenderedRowRestriction();
        const rowBufferMaxSize = Math.max(this.gridOptionsWrapper.getRowBuffer(), 500);

        if (rowLayoutNormal && !suppressRowCountRestriction) {
            if (newLast - newFirst > rowBufferMaxSize) {
                newLast = newFirst + rowBufferMaxSize;
            }
        }

        const firstDiffers = newFirst !== this.firstRenderedRow;
        const lastDiffers = newLast !== this.lastRenderedRow;
        if (firstDiffers || lastDiffers) {
            this.firstRenderedRow = newFirst;
            this.lastRenderedRow = newLast;

            const event: ViewportChangedEvent = {
                type: Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };

            this.eventService.dispatchEvent(event);
        }

        if (this.paginationProxy.isRowsToRender()) {

            const event: FirstDataRenderedEvent = {
                type: Events.EVENT_FIRST_DATA_RENDERED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };

            this.eventService.dispatchEventOnce(event);
        }
    }

    private ensureAllRowsInRangeHaveHeightsCalculated(topPixel: number, bottomPixel: number): void {
        // ensureRowHeightsVisible only works with CSRM, as it's the only row model that allows lazy row height calcs.
        // all the other row models just hard code so the method just returns back false
        const rowHeightsChanged = this.paginationProxy.ensureRowHeightsValid(topPixel, bottomPixel, -1, -1);
        if (rowHeightsChanged) {
            // if row heights have changed, we need to resize the containers the rows sit it
            this.sizeContainerToPageHeight();
            // we also need to update heightScaler as this has dependency of row container height
            this.maxDivHeightScaler.updateOffset();
        }
    }

    public getFirstVirtualRenderedRow() {
        return this.firstRenderedRow;
    }

    public getLastVirtualRenderedRow() {
        return this.lastRenderedRow;
    }

    // check that none of the rows to remove are editing or focused as:
    // a) if editing, we want to keep them, otherwise the user will loose the context of the edit,
    //    eg user starts editing, enters some text, then scrolls down and then up, next time row rendered
    //    the edit is reset - so we want to keep it rendered.
    // b) if focused, we want ot keep keyboard focus, so if user ctrl+c, it goes to clipboard,
    //    otherwise the user can range select and drag (with focus cell going out of the viewport)
    //    and then ctrl+c, nothing will happen if cell is removed from dom.
    // c) if detail record of master detail, as users complained that the context of detail rows
    //    was getting lost when detail row out of view. eg user expands to show detail row,
    //    then manipulates the detail panel (eg sorts the detail grid), then context is lost
    //    after detail panel is scrolled out of / into view.
    private doNotUnVirtualiseRow(rowComp: RowComp): boolean {
        const REMOVE_ROW: boolean = false;
        const KEEP_ROW: boolean = true;
        const rowNode = rowComp.getRowNode();

        const rowHasFocus = this.focusedCellController.isRowNodeFocused(rowNode);
        const rowIsEditing = rowComp.isEditing();
        const rowIsDetail = rowNode.detail;

        const mightWantToKeepRow = rowHasFocus || rowIsEditing || rowIsDetail;

        // if we deffo don't want to keep it,
        if (!mightWantToKeepRow) {
            return REMOVE_ROW;
        }

        // editing row, only remove if it is no longer rendered, eg filtered out or new data set.
        // the reason we want to keep is if user is scrolling up and down, we don't want to loose
        // the context of the editing in process.
        const rowNodePresent = this.paginationProxy.isRowPresent(rowNode);
        return rowNodePresent ? KEEP_ROW : REMOVE_ROW;
    }

    private createRowComp(rowNode: RowNode, animate: boolean, afterScroll: boolean): RowComp {

        const suppressAnimationFrame = this.gridOptionsWrapper.isSuppressAnimationFrame();

        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.

        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.

        const useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;

        const rowComp = new RowComp(
            this.$scope,
            this.rowContainers.body,
            this.rowContainers.pinnedLeft,
            this.rowContainers.pinnedRight,
            this.rowContainers.fullWidth,
            rowNode,
            this.beans,
            animate,
            useAnimationFrameForCreate,
            this.printLayout,
            this.embedFullWidthRows
        );

        rowComp.init();

        return rowComp;
    }

    public getRenderedNodes() {
        const renderedRows = this.rowCompsByIndex;
        return Object.keys(renderedRows).map(key => {
            return renderedRows[key].getRowNode();
        });
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(event: KeyboardEvent | null, key: number, currentCell: CellPosition, allowUserOverride: boolean) {
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        let nextCell = currentCell;
        let finished = false;
        while (!finished) {
            // if the current cell is spanning across multiple columns, we need to move
            // our current position to be the last cell on the right before finding the
            // the next target.
            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (key === Constants.KEY_LEFT) {
                    nextCell = this.getLastCellOfColSpan(nextCell);
                }
            } else if (key === Constants.KEY_RIGHT) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }

            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);

            // eg if going down, and nextCell=undefined, means we are gone past the last row
            const hitEdgeOfGrid = _.missing(nextCell);
            if (hitEdgeOfGrid) {
                finished = true;
                continue;
            }

            const rowNode = this.rowPositionUtils.getRowNode(nextCell);

            // we do not allow focusing on full width rows, this includes details rows
            if (rowNode.detail) {
                continue;
            }

            // if not a group, then we have a valid row, so quit the search
            if (!rowNode.group) {
                finished = true;
                continue;
            }

            // full width rows cannot be focused, so if it's a group and using full width rows,
            // we need to skip over the row
            const pivotMode = this.columnController.isPivotMode();
            const usingFullWidthRows = this.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);
            if (!usingFullWidthRows) {
                finished = true;
            }
        }

        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            const userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
            if (_.exists(userFunc)) {
                const params: NavigateToNextCellParams = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event
                };
                const userCell = userFunc(params);
                if (_.exists(userCell)) {
                    if ((userCell as any).floating) {
                        _.doOnce(() => {console.warn(`ag-Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`); }, 'no floating in userCell');
                        userCell.rowPinned = (userCell as any).floating;
                    }
                    nextCell = {
                        rowPinned: userCell.rowPinned,
                        rowIndex: userCell.rowIndex,
                        column: userCell.column
                    } as CellPosition;
                } else {
                    nextCell = null;
                }
            }
        }

        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
        if (!nextCell) {
            return;
        }

        // in case we have col spanning we get the cellComp and use it to
        // get the position. This was we always focus the first cell inside
        // the spanning.
        this.ensureCellVisible(nextCell); // ensureCellVisible first, to make sure nextCell is rendered
        const cellComp = this.getComponentForCell(nextCell);
        nextCell = cellComp.getCellPosition();

        // we call this again, as nextCell can be different to it's previous value due to Column Spanning
        // (ie if cursor moving from right to left, and cell is spanning columns, then nextCell was the
        // last column in the group, however now it's the first column in the group). if we didn't do
        // ensureCellVisible again, then we could only be showing the last portion (last column) of the
        // merged cells.
        this.ensureCellVisible(nextCell);

        this.focusedCellController.setFocusedCell(nextCell.rowIndex, nextCell.column, nextCell.rowPinned, true);

        if (this.rangeController) {
            this.rangeController.setRangeToCell(nextCell);
        }
    }

    private getLastCellOfColSpan(cell: CellPosition): CellPosition {
        const cellComp = this.getComponentForCell(cell);

        if (!cellComp) {
            return cell;
        }

        const colSpanningList = cellComp.getColSpanningList();

        if (colSpanningList.length === 1) {
            return cell;
        }

        return {
            rowIndex: cell.rowIndex,
            column: _.last(colSpanningList),
            rowPinned: cell.rowPinned
        };
    }

    public ensureCellVisible(gridCell: CellPosition): void {
        // this scrolls the row into view
        if (_.missing(gridCell.rowPinned)) {
            this.gridPanel.ensureIndexVisible(gridCell.rowIndex);
        }

        if (!gridCell.column.isPinned()) {
            this.gridPanel.ensureColumnVisible(gridCell.column);
        }

        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    }

    public startEditingCell(gridCell: CellPosition, keyPress: number, charPress: string): void {
        const cell = this.getComponentForCell(gridCell);
        if (cell) {
            cell.startRowOrCellEdit(keyPress, charPress);
        }
    }

    public getComponentForCell(cellPosition: CellPosition): CellComp {
        let rowComponent: RowComp;
        switch (cellPosition.rowPinned) {
            case Constants.PINNED_TOP:
                rowComponent = this.floatingTopRowComps[cellPosition.rowIndex];
                break;
            case Constants.PINNED_BOTTOM:
                rowComponent = this.floatingBottomRowComps[cellPosition.rowIndex];
                break;
            default:
                rowComponent = this.rowCompsByIndex[cellPosition.rowIndex];
                break;
        }

        if (!rowComponent) {
            return null;
        }

        const cellComponent: CellComp = rowComponent.getRenderedCellForColumn(cellPosition.column);
        return cellComponent;
    }

    public getRowNode(gridRow: RowPosition): RowNode | null {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }

    public onTabKeyDown(previousRenderedCell: CellComp, keyboardEvent: KeyboardEvent): void {
        const backwards = keyboardEvent.shiftKey;
        const success = this.moveToCellAfter(previousRenderedCell, backwards);
        if (success) {
            keyboardEvent.preventDefault();
        }
    }

    public tabToNextCell(backwards: boolean): boolean {
        const focusedCell = this.focusedCellController.getFocusedCell();
        // if no focus, then cannot navigate
        if (_.missing(focusedCell)) {
            return false;
        }
        const renderedCell = this.getComponentForCell(focusedCell);
        // if cell is not rendered, means user has scrolled away from the cell
        if (_.missing(renderedCell)) {
            return false;
        }

        const result = this.moveToCellAfter(renderedCell, backwards);
        return result;
    }

    private moveToCellAfter(previousRenderedCell: CellComp, backwards: boolean): boolean {
        const editing = previousRenderedCell.isEditing();
        let res: boolean;
        if (editing) {
            if (this.gridOptionsWrapper.isFullRowEdit()) {
                res = this.moveToNextEditingRow(previousRenderedCell, backwards);
            } else {
                res = this.moveToNextEditingCell(previousRenderedCell, backwards);
            }
        } else {
            res = this.moveToNextCellNotEditing(previousRenderedCell, backwards);
        }
        return res;
    }

    private moveToNextEditingCell(previousRenderedCell: CellComp, backwards: boolean): boolean {
        const gridCell = previousRenderedCell.getCellPosition();

        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousRenderedCell.stopEditing();

        // find the next cell to start editing
        const nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);

        const foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.startEditingIfEnabled(null, null, true);
            nextRenderedCell.focusCell(false);
        }

        return foundCell;
    }

    private moveToNextEditingRow(previousRenderedCell: CellComp, backwards: boolean): boolean {
        const gridCell = previousRenderedCell.getCellPosition();

        // find the next cell to start editing
        const nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true);

        const foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            this.moveEditToNextCellOrRow(previousRenderedCell, nextRenderedCell);
        }

        return foundCell;
    }

    private moveToNextCellNotEditing(previousRenderedCell: CellComp, backwards: boolean): boolean {
        const gridCell = previousRenderedCell.getCellPosition();

        // find the next cell to start editing
        const nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, false);

        const foundCell = _.exists(nextRenderedCell);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.focusCell(true);
        }

        return foundCell;
    }

    private moveEditToNextCellOrRow(previousRenderedCell: CellComp, nextRenderedCell: CellComp): void {
        const pGridCell = previousRenderedCell.getCellPosition();
        const nGridCell = nextRenderedCell.getCellPosition();

        const rowsMatch = pGridCell.rowIndex === nGridCell.rowIndex && pGridCell.rowPinned === nGridCell.rowPinned;

        if (rowsMatch) {
            // same row, so we don't start / stop editing, we just move the focus along
            previousRenderedCell.setFocusOutOnEditor();
            nextRenderedCell.setFocusInOnEditor();
        } else {
            const pRow = previousRenderedCell.getRenderedRow();
            const nRow = nextRenderedCell.getRenderedRow();

            previousRenderedCell.setFocusOutOnEditor();
            pRow.stopEditing();

            nRow.startRowEditing();
            nextRenderedCell.setFocusInOnEditor();
        }

        nextRenderedCell.focusCell();
    }

    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    private findNextCellToFocusOn(gridCell: CellPosition, backwards: boolean, startEditing: boolean): CellComp {
        let nextCell: CellPosition = gridCell;

        while (true) {
            if (!backwards) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);

            // allow user to override what cell to go to next
            const userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();
            if (_.exists(userFunc)) {
                const params = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: gridCell,
                    nextCellPosition: nextCell ? nextCell : null
                } as TabToNextCellParams;
                const userCell = userFunc(params);
                if (_.exists(userCell)) {
                    if ((userCell as any).floating) {
                        _.doOnce(() => {console.warn(`ag-Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`); }, 'no floating in userCell');
                        userCell.rowPinned = (userCell as any).floating;
                    }
                    nextCell = {
                        rowIndex: userCell.rowIndex,
                        column: userCell.column,
                        rowPinned: userCell.rowPinned
                    } as CellPosition;
                } else {
                    nextCell = null;
                }
            }

            // if no 'next cell', means we have got to last cell of grid, so nothing to move to,
            // so bottom right cell going forwards, or top left going backwards
            if (!nextCell) {
                return null;
            }

            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            if (startEditing) {
                const rowNode = this.lookupRowNodeForCell(nextCell);
                const cellIsEditable = nextCell.column.isCellEditable(rowNode);
                if (!cellIsEditable) { continue; }
            }

            // this scrolls the row into view
            const cellIsNotFloating = _.missing(nextCell.rowPinned);
            if (cellIsNotFloating) {
                this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
            }

            // pinned columns don't scroll, so no need to ensure index visible
            if (!nextCell.column.isPinned()) {
                this.gridPanel.ensureColumnVisible(nextCell.column);
            }

            // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
            // floating cell, the scrolls get out of sync
            this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

            // get the grid panel to flush all animation frames - otherwise the call below to get the cellComp
            // could fail, if we just scrolled the grid (to make a cell visible) and the rendering hasn't finished.
            this.animationFrameService.flushAllFrames();

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            const nextCellComp = this.getComponentForCell(nextCell);

            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (_.missing(nextCellComp)) {
                continue;
            }

            if (nextCellComp.isSuppressNavigable()) {
                continue;
            }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeController) {
                this.rangeController.setRangeToCell(nextCell);
            }

            // we successfully tabbed onto a grid cell, so return true
            return nextCellComp;
        }
    }

    private lookupRowNodeForCell(cell: CellPosition) {
        if (cell.rowPinned === Constants.PINNED_TOP) {
            return this.pinnedRowModel.getPinnedTopRow(cell.rowIndex);
        }

        if (cell.rowPinned === Constants.PINNED_BOTTOM) {
            return this.pinnedRowModel.getPinnedBottomRow(cell.rowIndex);
        }

        return this.paginationProxy.getRow(cell.rowIndex);
    }
}

export interface RefreshViewParams {
    recycleRows?: boolean;
    animate?: boolean;
    suppressKeepFocus?: boolean;
    onlyBody?: boolean;
    // when new data, grid scrolls back to top
    newData?: boolean;
    newPage?: boolean;
}
