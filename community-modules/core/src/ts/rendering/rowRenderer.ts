import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RowCtrl } from "./row/rowCtrl";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import {
    CellFocusedEvent,
    DisplayedRowsChangedEvent,
    Events,
    FirstDataRenderedEvent,
    ModelUpdatedEvent,
    ViewportChangedEvent
} from "../events";
import { Constants } from "../constants/constants";
import { CellComp } from "./cellComp";
import { Autowired, Bean, Optional, PostConstruct, Qualifier } from "../context/context";
import { ColumnApi } from "../columns/columnApi";
import { ColumnModel } from "../columns/columnModel";
import { Logger, LoggerFactory } from "../logger";
import { FocusService } from "../focusService";
import { IRangeService } from "../interfaces/IRangeService";
import { CellNavigationService } from "../cellNavigationService";
import { CellPosition } from "../entities/cellPosition";
import { NavigateToNextCellParams, TabToNextCellParams } from "../entities/gridOptions";
import { BeanStub } from "../context/beanStub";
import { PaginationProxy } from "../pagination/paginationProxy";
import { FlashCellsParams, GetCellRendererInstancesParams, GridApi, RefreshCellsParams } from "../gridApi";
import { Beans } from "./beans";
import { AnimationFrameService } from "../misc/animationFrameService";
import { RowContainerHeightService } from "./rowContainerHeightService";
import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { ICellEditorComp } from "../interfaces/iCellEditor";
import { IRowModel } from "../interfaces/iRowModel";
import { RowPosition, RowPositionUtils } from "../entities/rowPosition";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { exists, missing } from "../utils/generic";
import { getAllValuesInObject, iterateObject } from "../utils/object";
import { createArrayOfNumbers } from "../utils/number";
import { last } from "../utils/array";
import { doOnce, executeInAWhile } from "../utils/function";
import { KeyCode } from '../constants/keyCode';
import { ControllersService } from "../controllersService";
import { GridBodyCtrl } from "../gridBodyComp/gridBodyCtrl";

export interface RowMap {
    [key: string]: RowCtrl;
}

@Bean("rowRenderer")
export class RowRenderer extends BeanStub {

    @Autowired("paginationProxy") private paginationProxy: PaginationProxy;
    @Autowired("columnModel") private columnModel: ColumnModel;
    @Autowired("$scope") private $scope: any;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;
    @Autowired("rowModel") private rowModel: IRowModel;
    @Autowired("focusService") private focusService: FocusService;
    @Autowired("cellNavigationService") private cellNavigationService: CellNavigationService;
    @Autowired("columnApi") private columnApi: ColumnApi;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("beans") private beans: Beans;
    @Autowired("rowContainerHeightService") private rowContainerHeightService: RowContainerHeightService;
    @Autowired("animationFrameService") private animationFrameService: AnimationFrameService;
    @Autowired("rowPositionUtils") private rowPositionUtils: RowPositionUtils;
    @Optional("rangeService") private rangeService: IRangeService;
    @Optional("controllersService") private controllersService: ControllersService;

    // private gridBodyComp: GridBodyComp;
    private gridBodyCon: GridBodyCtrl;

    private destroyFuncsForColumnListeners: (() => void)[] = [];

    private firstRenderedRow: number;
    private lastRenderedRow: number;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom.
    private rowConsByRowIndex: RowMap = {};
    private zombieRowCons: RowMap = {};
    private allRowCons: RowCtrl[] = [];

    private topRowCons: RowCtrl[] = [];
    private bottomRowCons: RowCtrl[] = [];

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

    public agWire(@Qualifier("loggerFactory") loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create("RowRenderer");
    }

    @PostConstruct
    private postConstruct(): void {
        this.controllersService.whenReady(() => {
            this.gridBodyCon = this.controllersService.getGridBodyController();
            this.initialise();
        });
    }

    private initialise(): void {
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redrawAfterScroll.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.registerCellEventListeners();

        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.embedFullWidthRows = this.printLayout || this.gridOptionsWrapper.isEmbedFullWidthRows();

        this.redrawAfterModelUpdate();
    }

    public getRowCons(): RowCtrl[] {
        return this.allRowCons;
    }

    private updateAllRowCons(): void {
        this.allRowCons = [...getAllValuesInObject(this.rowConsByRowIndex), ...getAllValuesInObject(this.zombieRowCons)];
    }

    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    private registerCellEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, (event: CellFocusedEvent) => {
            this.forEachCellComp(cellComp => cellComp.onCellFocused(event));
            this.forEachRowComp((key: string, rowComp: RowCtrl) => {
                if (rowComp.isFullWidth()) {
                    rowComp.onFullWidthRowFocused(event);
                }
            });
        });

        this.addManagedListener(this.eventService, Events.EVENT_FLASH_CELLS, event => {
            this.forEachCellComp(cellComp => cellComp.onFlashCells(event));
        });

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, () => {
            this.forEachCellComp(cellComp => cellComp.onColumnHover());
        });

        // only for printLayout - because we are rendering all the cells in the same row, regardless of pinned state,
        // then changing the width of the containers will impact left position. eg the center cols all have their
        // left position adjusted by the width of the left pinned column, so if the pinned left column width changes,
        // all the center cols need to be shifted to accommodate this. when in normal layout, the pinned cols are
        // in different containers so doesn't impact.
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, () => {
            if (this.printLayout) {
                this.forEachCellComp(cellComp => cellComp.onLeftChanged());
            }
        });

        const rangeSelectionEnabled = this.gridOptionsWrapper.isEnableRangeSelection();
        if (rangeSelectionEnabled) {

            this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, () => {
                this.forEachCellComp(cellComp => cellComp.onRangeSelectionChanged());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => {
                this.forEachCellComp(cellComp => cellComp.updateRangeBordersIfRangeCount());
            });

        }

        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));

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

        const cols = this.columnModel.getAllGridColumns();

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
        const rowIndexesToRemove = Object.keys(this.rowConsByRowIndex);
        this.removeRowComps(rowIndexesToRemove);
    }

    private onPageLoaded(event: ModelUpdatedEvent): void {
        const params: RefreshViewParams = {
            recycleRows: event.keepRenderedRows,
            animate: event.animate,
            newData: event.newData,
            newPage: event.newPage,
            // because this is a model updated event (not pinned rows), we
            // can skip updating the pinned rows. this is needed so that if user
            // is doing transaction updates, the pinned rows are not getting constantly
            // trashed - or editing cells in pinned rows are not refreshed and put into read mode
            onlyBody: true
        };
        this.redrawAfterModelUpdate(params);
    }

    public getAllCellsForColumn(column: Column): HTMLElement[] {
        const eCells: HTMLElement[] = [];

        function callback(key: any, rowComp: RowCtrl) {
            const eCell = rowComp.getCellForCol(column);
            if (eCell) { eCells.push(eCell); }
        }

        iterateObject(this.rowConsByRowIndex, callback);
        iterateObject(this.bottomRowCons, callback);
        iterateObject(this.topRowCons, callback);

        return eCells;
    }

    public refreshFloatingRowComps(): void {
        this.refreshFloatingRows(
            this.topRowCons,
            this.pinnedRowModel.getPinnedTopRowData()
        );

        this.refreshFloatingRows(
            this.bottomRowCons,
            this.pinnedRowModel.getPinnedBottomRowData()
        );
    }

    public getTopRowCons(): RowCtrl[] {
        return this.topRowCons;
    }

    public getBottomRowCons(): RowCtrl[] {
        return this.bottomRowCons;
    }

    private refreshFloatingRows(rowComps: RowCtrl[], rowNodes: RowNode[]): void {
        rowComps.forEach((row: RowCtrl) => {
            row.destroyFirstPass();
            row.destroySecondPass();
        });

        rowComps.length = 0;

        if (!rowNodes) { return; }

        rowNodes.forEach(rowNode => {
            const rowCon = new RowCtrl(
                this.$scope,
                rowNode,
                this.beans,
                false,
                false,
                this.printLayout
            );

            rowComps.push(rowCon);
        });
    }

    private onPinnedRowDataChanged(): void {
        // recycling rows in order to ensure cell editing is not cancelled
        const params: RefreshViewParams = {
            recycleRows: true
        };

        this.redrawAfterModelUpdate(params);
    }

    // if the row nodes are not rendered, no index is returned
    private getRenderedIndexesForRowNodes(rowNodes: RowNode[]): string[] {
        const result: string[] = [];

        if (missing(rowNodes)) { return result; }

        iterateObject(this.rowConsByRowIndex, (index: string, renderedRow: RowCtrl) => {
            const rowNode = renderedRow.getRowNode();
            if (rowNodes.indexOf(rowNode) >= 0) {
                result.push(index);
            }
        });

        return result;
    }

    public redrawRows(rowNodes?: RowNode[]): void {
        // if no row nodes provided, then refresh everything
        const partialRefresh = rowNodes != null && rowNodes.length > 0;

        if (partialRefresh) {
            const indexesToRemove = this.getRenderedIndexesForRowNodes(rowNodes!);
            // remove the rows
            this.removeRowComps(indexesToRemove);
        }

        // add draw them again
        this.redrawAfterModelUpdate({
            recycleRows: partialRefresh
        });
    }

    private getCellToRestoreFocusToAfterRefresh(params: RefreshViewParams): CellPosition | null {
        const focusedCell = params.suppressKeepFocus ? null : this.focusService.getFocusCellToUseAfterRefresh();

        if (missing(focusedCell)) { return null; }

        // if the dom is not actually focused on a cell, then we don't try to refocus. the problem this
        // solves is with editing - if the user is editing, eg focus is on a text field, and not on the
        // cell itself, then the cell can be registered as having focus, however it's the text field that
        // has the focus and not the cell div. therefore, when the refresh is finished, the grid will focus
        // the cell, and not the textfield. that means if the user is in a text field, and the grid refreshes,
        // the focus is lost from the text field. we do not want this.
        const activeElement = document.activeElement;
        const domData = this.gridOptionsWrapper.getDomData(activeElement, CellComp.DOM_DATA_KEY_CELL_COMP);
        const elementIsNotACellDev = missing(domData);

        return elementIsNotACellDev ? null : focusedCell;
    }

    // gets called from:
    // +) initialisation (in registerGridComp) params = null
    // +) onDomLayoutChanged, params = null
    // +) onPageLoaded, recycleRows, animate, newData, newPage from event, onlyBody=true
    // +) onPinnedRowDataChanged, recycleRows = true
    // +) redrawRows (from Grid API), recycleRows = true/false
    private redrawAfterModelUpdate(params: RefreshViewParams = {}): void {
        this.getLockOnRefresh();

        const focusedCell: CellPosition | null = this.getCellToRestoreFocusToAfterRefresh(params);

        this.updateContainerHeights();
        this.scrollToTopIfNewData(params);

        // never recycle rows when print layout, we draw each row again from scratch. this is because print layout
        // uses normal dom layout to put cells into dom - it doesn't allow reordering rows.
        const recycleRows = !this.printLayout && !!params.recycleRows;
        const animate = params.animate && this.gridOptionsWrapper.isAnimateRows();

        // after modelUpdate, row indexes can change, so we clear out the rowsByIndex map,
        // however we can reuse the rows, so we keep them but index by rowNode.id
        const rowsToRecycle = recycleRows ? this.recycleRows() : null;
        if (!recycleRows) {
            this.removeAllRowComps();
        }

        const isFocusedCellGettingRecycled = () => {
            if (focusedCell == null || rowsToRecycle == null) { return false; }
            let res = false;

            iterateObject(rowsToRecycle, (key: string, rowComp: RowCtrl) => {
                const rowNode = rowComp.getRowNode();
                const rowIndexEqual = rowNode.rowIndex == focusedCell.rowIndex;
                const pinnedEqual = rowNode.rowPinned == focusedCell.rowPinned;
                if (rowIndexEqual && pinnedEqual) {
                    res = true;
                }
            });

            return res;
        };

        const focusedCellRecycled = isFocusedCellGettingRecycled();

        this.redraw(rowsToRecycle, animate);

        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }

        this.dispatchDisplayedRowsChanged();

        // if we focus a cell that's already focused, then we get an unnecessary 'cellFocused' event fired.
        // this was happening when user clicked 'expand' on a rowGroup, then cellFocused was getting fired twice.
        if (!focusedCellRecycled) {
            this.restoreFocusedCell(focusedCell);
        }

        this.releaseLockOnRefresh();
    }

    private scrollToTopIfNewData(params: RefreshViewParams): void {
        const scrollToTop = params.newData || params.newPage;
        const suppressScrollToTop = this.gridOptionsWrapper.isSuppressScrollOnNewData();

        if (scrollToTop && !suppressScrollToTop) {
            this.gridBodyCon.getScrollFeature().scrollToTop();
        }
    }

    private updateContainerHeights(): void {
        // when doing print layout, we don't explicitly set height on the containers
        if (this.printLayout) {
            this.rowContainerHeightService.setModelHeight(null);
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

        this.rowContainerHeightService.setModelHeight(containerHeight);
    }

    private getLockOnRefresh(): void {
        if (this.refreshInProgress) {
            throw new Error(
                "AG Grid: cannot get grid to draw rows when it is in the middle of drawing rows. " +
                "Your code probably called a grid API method while the grid was in the render stage. To overcome " +
                "this, put the API call into a timeout, e.g. instead of api.refreshView(), " +
                "call setTimeout(function() { api.refreshView(); }, 0). To see what part of your code " +
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
    private restoreFocusedCell(cellPosition: CellPosition | null): void {
        if (cellPosition) {
            this.focusService.setFocusedCell(cellPosition.rowIndex, cellPosition.column, cellPosition.rowPinned, true);
        }
    }

    public stopEditing(cancel: boolean = false) {
        this.forEachRowComp((key: string, rowComp: RowCtrl) => {
            rowComp.stopEditing(cancel);
        });
    }

    private onNewColumnsLoaded(): void {
        // we don't want each cellComp to register for events, as would increase rendering time.
        // so for newColumnsLoaded, we register once here (in rowRenderer) and then inform
        // each cell if / when event was fired.
        this.forEachCellComp(cellComp => cellComp.onNewColumnsLoaded());
    }

    public forEachCellComp(callback: (cellComp: CellComp) => void): void {
        this.forEachRowComp((key: string, rowComp: RowCtrl) => rowComp.forEachCellComp(callback));
    }

    private forEachRowComp(callback: (key: string, rowComp: RowCtrl) => void): void {
        iterateObject(this.rowConsByRowIndex, callback);
        iterateObject(this.topRowCons, callback);
        iterateObject(this.bottomRowCons, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void {
        const rowComp = this.rowConsByRowIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    }

    public flashCells(params: FlashCellsParams = {}): void {
        const { flashDelay, fadeDelay } = params;
        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => cellComp.flashCell({ flashDelay, fadeDelay }));
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        const refreshCellParams = {
            forceRefresh: params.force,
            newData: false,
            suppressFlash: params.suppressFlash
        };
        this.forEachCellCompFiltered(params.rowNodes, params.columns, cellComp => {
            if (cellComp.refreshShouldDestroy()) {
                const rowComp = cellComp.getRenderedRow();
                if (rowComp) {
                    rowComp.refreshCell(cellComp);
                }
            } else {
                cellComp.refreshCell(refreshCellParams);
            }
        });
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
    private forEachCellCompFiltered(rowNodes?: RowNode[] | null, columns?: (string | Column)[], callback?: (cellComp: CellComp) => void): void {
        let rowIdsMap: any;

        if (exists(rowNodes)) {
            rowIdsMap = {
                top: {},
                bottom: {},
                normal: {}
            };

            rowNodes.forEach(rowNode => {
                const id = rowNode.id!;
                if (rowNode.rowPinned === Constants.PINNED_TOP) {
                    rowIdsMap.top[id] = true;
                } else if (rowNode.rowPinned === Constants.PINNED_BOTTOM) {
                    rowIdsMap.bottom[id] = true;
                } else {
                    rowIdsMap.normal[id] = true;
                }
            });
        }

        let colIdsMap: any;

        if (exists(columns)) {
            colIdsMap = {};
            columns.forEach((colKey: string | Column) => {
                const column: Column | null = this.columnModel.getGridColumn(colKey);
                if (exists(column)) {
                    colIdsMap[column.getId()] = true;
                }
            });
        }

        const processRow = (rowComp: RowCtrl) => {
            const rowNode: RowNode = rowComp.getRowNode();
            const id = rowNode.id!;
            const floating = rowNode.rowPinned;

            // skip this row if it is missing from the provided list
            if (exists(rowIdsMap)) {
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

                if (excludeColFromRefresh) { return; }
                if (callback) { callback(cellComp); }
            });
        };

        iterateObject(this.rowConsByRowIndex, (index: string, rowComp: RowCtrl) => {
            processRow(rowComp);
        });

        if (this.topRowCons) {
            this.topRowCons.forEach(processRow);
        }

        if (this.bottomRowCons) {
            this.bottomRowCons.forEach(processRow);
        }
    }

    protected destroy(): void {
        this.removeAllRowComps();
        super.destroy();
    }

    private removeAllRowComps(): void {
        const rowIndexesToRemove = Object.keys(this.rowConsByRowIndex);
        this.removeRowComps(rowIndexesToRemove);
    }

    private recycleRows(): RowMap {
        // remove all stub nodes, they can't be reused, as no rowNode id
        const stubNodeIndexes: string[] = [];
        iterateObject(this.rowConsByRowIndex, (index: string, rowComp: RowCtrl) => {
            const stubNode = rowComp.getRowNode().id == null;
            if (stubNode) {
                stubNodeIndexes.push(index);
            }
        });
        this.removeRowComps(stubNodeIndexes);

        // then clear out rowCompsByIndex, but before that take a copy, but index by id, not rowIndex
        const nodesByIdMap: RowMap = {};
        iterateObject(this.rowConsByRowIndex, (index: string, rowComp: RowCtrl) => {
            const rowNode = rowComp.getRowNode();
            nodesByIdMap[rowNode.id!] = rowComp;
        });
        this.rowConsByRowIndex = {};

        return nodesByIdMap;
    }

    // takes array of row indexes
    private removeRowComps(rowsToRemove: any[]) {
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;
        rowsToRemove.forEach(indexToRemove => {
            const rowComp = this.rowConsByRowIndex[indexToRemove];
            if (rowComp) {
                rowComp.destroyFirstPass();
                rowComp.destroySecondPass();
            }
            delete this.rowConsByRowIndex[indexToRemove];
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
        this.dispatchDisplayedRowsChanged();
    }

    private removeRowCompsNotToDraw(indexesToDraw: number[]): void {
        // for speedy lookup, dump into map
        const indexesToDrawMap: { [index: string]: boolean; } = {};
        indexesToDraw.forEach(index => (indexesToDrawMap[index] = true));

        const existingIndexes = Object.keys(this.rowConsByRowIndex);
        const indexesNotToDraw: string[] = existingIndexes.filter(index => !indexesToDrawMap[index]);

        this.removeRowComps(indexesNotToDraw);
    }

    private calculateIndexesToDraw(rowsToRecycle?: { [key: string]: RowCtrl; } | null): number[] {
        // all in all indexes in the viewport
        const indexesToDraw = createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);

        const checkRowToDraw = (indexStr: string, rowComp: RowCtrl) => {
            const index = rowComp.getRowNode().rowIndex;
            if (index == null) { return; }
            if (index < this.firstRenderedRow || index > this.lastRenderedRow) {
                if (this.doNotUnVirtualiseRow(rowComp)) {
                    indexesToDraw.push(index);
                }
            }
        };

        // if we are redrawing due to scrolling change, then old rows are in this.rowCompsByIndex
        iterateObject(this.rowConsByRowIndex, checkRowToDraw);

        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        iterateObject(rowsToRecycle, checkRowToDraw);

        indexesToDraw.sort((a: number, b: number) => a - b);

        return indexesToDraw;
    }

    private redraw(rowsToRecycle?: { [key: string]: RowCtrl; } | null, animate = false, afterScroll = false) {
        this.rowContainerHeightService.updateOffset();
        this.workOutFirstAndLastRowsToRender();

        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport

        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        const indexesToDraw = this.calculateIndexesToDraw(rowsToRecycle);

        this.removeRowCompsNotToDraw(indexesToDraw);

        // never animate when doing print layout - as we want to get things ready to print as quickly as possible,
        // otherwise we risk the printer printing a row that's half faded (half way through fading in)
        if (this.printLayout) {
            animate = false;
        }

        // add in new rows
        const rowComps: RowCtrl[] = [];

        indexesToDraw.forEach(rowIndex => {
            const rowComp = this.createOrUpdateRowCon(rowIndex, rowsToRecycle, animate, afterScroll);
            if (exists(rowComp)) {
                rowComps.push(rowComp);
            }
        });

        if (rowsToRecycle) {
            const useAnimationFrame = afterScroll && !this.gridOptionsWrapper.isSuppressAnimationFrame() && !this.printLayout;
            if (useAnimationFrame) {
                this.beans.taskQueue.addDestroyTask(() => {
                    this.destroyRowCons(rowsToRecycle, animate);
                    this.updateAllRowCons();
                    this.dispatchDisplayedRowsChanged();
                });
            } else {
                this.destroyRowCons(rowsToRecycle, animate);
            }
        }

        this.updateAllRowCons();
        this.checkAngularCompile();
        this.gridBodyCon.updateRowCount();
    }

    private dispatchDisplayedRowsChanged(): void {
        const event: DisplayedRowsChangedEvent = {type: Events.EVENT_DISPLAYED_ROWS_CHANGED};
        this.eventService.dispatchEvent(event);
    }

    private onDisplayedColumnsChanged(): void {
        const pinningLeft = this.columnModel.isPinningLeft();
        const pinningRight = this.columnModel.isPinningRight();
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

        iterateObject(this.rowConsByRowIndex, (id: string, rowComp: RowCtrl) => {
            if (rowComp.isFullWidth()) {
                const rowIndex = rowComp.getRowNode().rowIndex;

                rowsToRemove.push(rowIndex!.toString());
            }
        });

        this.refreshFloatingRowComps();
        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    }

    public refreshFullWidthRows(rowNodesToRefresh?: RowNode[]): void {
        const rowsToRemove: string[] = [];

        const selectivelyRefreshing = !!rowNodesToRefresh;
        const idsToRefresh: { [id: string]: boolean; } | undefined = selectivelyRefreshing ? {} : undefined;

        if (selectivelyRefreshing && idsToRefresh) {
            rowNodesToRefresh!.forEach(r => idsToRefresh[r.id!] = true);
        }

        iterateObject(this.rowConsByRowIndex, (id: string, rowComp: RowCtrl) => {
            if (!rowComp.isFullWidth()) { return; }

            const rowNode = rowComp.getRowNode();

            if (selectivelyRefreshing && idsToRefresh) {
                // we refresh if a) this node is present or b) this parents nodes is present. checking parent
                // node is important for master/detail, as we want detail to refresh on changes to parent node.
                // it's also possible, if user is provider their own fullWidth, that details panels contain
                // some info on the parent, eg if in tree data and child row shows some data from parent row also.
                const parentId = (rowNode.level > 0 && rowNode.parent) ? rowNode.parent.id : undefined;
                const skipThisNode = !idsToRefresh[rowNode.id!] && !idsToRefresh[parentId!];
                if (skipThisNode) { return; }
            }

            const fullWidthRowsRefreshed = rowComp.refreshFullWidth();
            if (!fullWidthRowsRefreshed) {
                const rowIndex = rowComp.getRowNode().rowIndex;

                rowsToRemove.push(rowIndex!.toString());
            }
        });

        this.removeRowComps(rowsToRemove);
        this.redrawAfterScroll();
    }

    private createOrUpdateRowCon(
        rowIndex: number,
        rowsToRecycle: { [key: string]: RowCtrl | null; } | null | undefined,
        animate: boolean,
        afterScroll: boolean
    ): RowCtrl | null | undefined {
        let rowNode: RowNode | null = null;
        let rowCon: RowCtrl | null = this.rowConsByRowIndex[rowIndex];

        // if no row comp, see if we can get it from the previous rowComps
        if (!rowCon) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (exists(rowNode) && exists(rowsToRecycle) && rowsToRecycle[rowNode.id!] && rowNode.alreadyRendered) {
                rowCon = rowsToRecycle[rowNode.id!];
                rowsToRecycle[rowNode.id!] = null;
            }
        }

        const creatingNewRowCon = !rowCon;

        if (creatingNewRowCon) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }

            if (exists(rowNode)) {
                rowCon = this.createRowCon(rowNode, animate, afterScroll);
            } else {
                // this should never happen - if somehow we are trying to create
                // a row for a rowNode that does not exist.
                return;
            }
        }

        if (rowNode) {
            // set node as 'alreadyRendered' to ensure we only recycle rowComps that have been rendered, this ensures
            // we don't reuse rowComps that have been removed and then re-added in the same batch transaction.
            rowNode.alreadyRendered = true;
        }

        this.rowConsByRowIndex[rowIndex] = rowCon!;

        return rowCon;
    }

    private destroyRowCons(rowConsMap: { [key: string]: RowCtrl; } | null | undefined, animate: boolean): void {
        const executeInAWhileFuncs: (() => void)[] = [];
        iterateObject(rowConsMap, (nodeId: string, rowCon: RowCtrl) => {
            // if row was used, then it's null
            if (!rowCon) { return; }

            rowCon.destroyFirstPass();
            if (animate) {
                this.zombieRowCons[rowCon.getInstanceId()] = rowCon;
                executeInAWhileFuncs.push(() => {
                    rowCon.destroySecondPass();
                    delete this.zombieRowCons[rowCon.getInstanceId()];
                });
            } else {
                rowCon.destroySecondPass();
            }
        });
        if (animate) {
            // this ensures we fire displayedRowsChanged AFTER all the 'executeInAWhileFuncs' get
            // executed, as we added it to the end of the list.
            executeInAWhileFuncs.push(() => {
                this.updateAllRowCons();
                this.dispatchDisplayedRowsChanged();
            });
            executeInAWhile(executeInAWhileFuncs);
        }
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
            const bufferPixels = this.gridOptionsWrapper.getRowBufferInPixels();
            const gridBodyCon = this.controllersService.getGridBodyController();

            let rowHeightsChanged = false;
            let firstPixel: number;
            let lastPixel: number;
            do {
                const paginationOffset = this.paginationProxy.getPixelOffset();
                const {pageFirstPixel, pageLastPixel} = this.paginationProxy.getCurrentPagePixelRange();
                const divStretchOffset = this.rowContainerHeightService.getDivStretchOffset();

                const bodyVRange = gridBodyCon.getScrollFeature().getVScrollPosition();
                const bodyTopPixel = bodyVRange.top;
                const bodyBottomPixel = bodyVRange.bottom;

                firstPixel = Math.max(bodyTopPixel + paginationOffset - bufferPixels, pageFirstPixel) + divStretchOffset;
                lastPixel = Math.min(bodyBottomPixel + paginationOffset + bufferPixels, pageLastPixel) + divStretchOffset;

                // if the rows we are about to display get their heights changed, then that upsets the calcs from above.
                rowHeightsChanged = this.ensureAllRowsInRangeHaveHeightsCalculated(firstPixel, lastPixel);

            } while (rowHeightsChanged);

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

        // only dispatch firstDataRendered if we have actually rendered some data
        if (this.paginationProxy.isRowsToRender()) {
            const event: FirstDataRenderedEvent = {
                type: Events.EVENT_FIRST_DATA_RENDERED,
                firstRow: newFirst,
                lastRow: newLast,
                api: this.gridApi,
                columnApi: this.columnApi
            };

            // added a small delay here because in some scenarios this can be fired
            // before the grid is actually rendered, causing component creation
            // on EVENT_FIRST_DATA_RENDERED to fail.
            window.setTimeout(() => this.eventService.dispatchEventOnce(event), 50);
        }
    }

    private ensureAllRowsInRangeHaveHeightsCalculated(topPixel: number, bottomPixel: number): boolean {
        // ensureRowHeightsVisible only works with CSRM, as it's the only row model that allows lazy row height calcs.
        // all the other row models just hard code so the method just returns back false
        const res = this.paginationProxy.ensureRowHeightsValid(topPixel, bottomPixel, -1, -1);

        if (res) {
            this.updateContainerHeights();
        }

        return res;
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
    private doNotUnVirtualiseRow(rowComp: RowCtrl): boolean {
        const REMOVE_ROW: boolean = false;
        const KEEP_ROW: boolean = true;
        const rowNode = rowComp.getRowNode();

        const rowHasFocus = this.focusService.isRowNodeFocused(rowNode);
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

    private createRowCon(rowNode: RowNode, animate: boolean, afterScroll: boolean): RowCtrl {
        const suppressAnimationFrame = this.gridOptionsWrapper.isSuppressAnimationFrame();

        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.

        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.
        const useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame && !this.printLayout;

        const res = new RowCtrl(
            this.$scope,
            rowNode,
            this.beans,
            animate,
            useAnimationFrameForCreate,
            this.printLayout
        );

        return res;
    }

    public getRenderedNodes() {
        const renderedRows = this.rowConsByRowIndex;

        return Object.keys(renderedRows).map(key => renderedRows[key]!.getRowNode());
    }

    // we use index for rows, but column object for columns, as the next column (by index) might not
    // be visible (header grouping) so it's not reliable, so using the column object instead.
    public navigateToNextCell(event: KeyboardEvent | null, key: number, currentCell: CellPosition, allowUserOverride: boolean) {
        // we keep searching for a next cell until we find one. this is how the group rows get skipped
        let nextCell: CellPosition | null = currentCell;
        let hitEdgeOfGrid = false;

        while (nextCell && (nextCell === currentCell || !this.isValidNavigateCell(nextCell))) {
            // if the current cell is spanning across multiple columns, we need to move
            // our current position to be the last cell on the right before finding the
            // the next target.
            if (this.gridOptionsWrapper.isEnableRtl()) {
                if (key === KeyCode.LEFT) {
                    nextCell = this.getLastCellOfColSpan(nextCell);
                }
            } else if (key === KeyCode.RIGHT) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }

            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);

            // eg if going down, and nextCell=undefined, means we are gone past the last row
            hitEdgeOfGrid = missing(nextCell);
        }

        if (hitEdgeOfGrid && event && event.keyCode === KeyCode.UP) {
            nextCell = {
                rowIndex: -1,
                rowPinned: null,
                column: currentCell.column
            };
        }

        // allow user to override what cell to go to next. when doing normal cell navigation (with keys)
        // we allow this, however if processing 'enter after edit' we don't allow override
        if (allowUserOverride) {
            const userFunc = this.gridOptionsWrapper.getNavigateToNextCellFunc();
            if (exists(userFunc)) {
                const params: NavigateToNextCellParams = {
                    key: key,
                    previousCellPosition: currentCell,
                    nextCellPosition: nextCell ? nextCell : null,
                    event: event
                };
                const userCell = userFunc(params);
                if (exists(userCell)) {
                    if ((userCell as any).floating) {
                        doOnce(() => { console.warn(`AG Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`); }, 'no floating in userCell');
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
        if (!nextCell) { return; }

        if (nextCell.rowIndex < 0) {
            const headerLen = this.beans.headerNavigationService.getHeaderRowCount();

            this.focusService.focusHeaderPosition(
                { headerRowIndex: headerLen + (nextCell.rowIndex), column: currentCell.column }
            );

            return;
        }

        // in case we have col spanning we get the cellComp and use it to get the
        // position. This was we always focus the first cell inside the spanning.
        const normalisedPosition = this.getNormalisedPosition(nextCell);
        if (normalisedPosition) {
            this.focusPosition(normalisedPosition);
        } else {
            this.tryToFocusFullWidthRow(nextCell);
        }
    }

    private getNormalisedPosition(cellPosition: CellPosition): CellPosition | null {
        // ensureCellVisible first, to make sure cell at position is rendered.
        this.ensureCellVisible(cellPosition);
        const cellComp = this.getComponentForCell(cellPosition);

        // not guaranteed to have a cellComp when using the SSRM as blocks are loading.
        if (!cellComp) { return null; }

        cellPosition = cellComp.getCellPosition();
        // we call this again, as nextCell can be different to it's previous value due to Column Spanning
        // (ie if cursor moving from right to left, and cell is spanning columns, then nextCell was the
        // last column in the group, however now it's the first column in the group). if we didn't do
        // ensureCellVisible again, then we could only be showing the last portion (last column) of the
        // merged cells.
        this.ensureCellVisible(cellPosition);

        return cellPosition;
    }

    private tryToFocusFullWidthRow(position: CellPosition | RowPosition, backwards: boolean = false): boolean {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const rowComp = this.getRowConByPosition(position);
        if (!rowComp || !rowComp.isFullWidth()) { return false; }

        const cellPosition: CellPosition = {
            rowIndex: position.rowIndex,
            rowPinned: position.rowPinned,
            column: (position as CellPosition).column || (backwards ? last(displayedColumns) : displayedColumns[0])
        };

        this.focusPosition(cellPosition);

        return true;
    }

    private focusPosition(cellPosition: CellPosition) {
        this.focusService.setFocusedCell(cellPosition.rowIndex, cellPosition.column, cellPosition.rowPinned, true);

        if (this.rangeService) {
            this.rangeService.setRangeToCell(cellPosition);
        }
    }

    private isValidNavigateCell(cell: CellPosition): boolean {
        const rowNode = this.rowPositionUtils.getRowNode(cell);

        // we do not allow focusing on detail rows and full width rows
        return !!rowNode;
    }

    private getLastCellOfColSpan(cell: CellPosition): CellPosition {
        const cellComp = this.getComponentForCell(cell);

        if (!cellComp) { return cell; }

        const colSpanningList = cellComp.getColSpanningList();

        if (colSpanningList.length === 1) { return cell; }

        return {
            rowIndex: cell.rowIndex,
            column: last(colSpanningList),
            rowPinned: cell.rowPinned
        };
    }

    public ensureCellVisible(gridCell: CellPosition): void {
        // this scrolls the row into view
        if (missing(gridCell.rowPinned)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(gridCell.rowIndex);
        }

        if (!gridCell.column.isPinned()) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(gridCell.column);
        }

        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridBodyCon.getScrollFeature().horizontallyScrollHeaderCenterAndFloatingCenter();

        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    }

    public startEditingCell(gridCell: CellPosition, keyPress?: number | null, charPress?: string | null): void {
        const cell = this.getComponentForCell(gridCell);
        if (cell) {
            cell.startRowOrCellEdit(keyPress, charPress);
        }
    }

    public getRowConByPosition(rowPosition: RowPosition): RowCtrl | null {
        let rowComponent: RowCtrl | null;
        switch (rowPosition.rowPinned) {
            case Constants.PINNED_TOP:
                rowComponent = this.topRowCons[rowPosition.rowIndex];
                break;
            case Constants.PINNED_BOTTOM:
                rowComponent = this.bottomRowCons[rowPosition.rowIndex];
                break;
            default:
                rowComponent = this.rowConsByRowIndex[rowPosition.rowIndex];
                break;
        }

        return rowComponent;
    }

    public getComponentForCell(cellPosition: CellPosition): CellComp | null {
        const rowComp = this.getRowConByPosition(cellPosition);

        if (!rowComp) {
            return null;
        }

        const cellComponent =  rowComp.getRenderedCellForColumn(cellPosition.column);

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

    // result of keyboard event
    public onTabKeyDown(previousRenderedCell: CellComp | RowCtrl, keyboardEvent: KeyboardEvent): void {
        const backwards = keyboardEvent.shiftKey;
        const movedToNextCell = this.tabToNextCellCommon(previousRenderedCell, backwards);

        if (movedToNextCell) {
            // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
            // to the normal tabbing so user can exit the grid.
            keyboardEvent.preventDefault();
            return;
        }

        // if we didn't move to next cell, then need to tab out of the cells, ie to the header (if going
        // backwards)
        if (backwards) {
            const { rowIndex, rowPinned } = previousRenderedCell.getRowPosition();
            const firstRow = rowPinned ? rowIndex === 0 : rowIndex === this.paginationProxy.getPageFirstRow();
            if (firstRow) {
                keyboardEvent.preventDefault();

                const headerRowIndex = this.beans.headerNavigationService.getHeaderRowCount() - 1;
                const column = last(this.columnModel.getAllDisplayedColumns());

                this.focusService.focusHeaderPosition({ headerRowIndex, column });
            }
        } else {
            // if the case it's a popup editor, the focus is on the editor and not the previous cell.
            // in order for the tab navigation to work, we need to focus the browser back onto the
            // previous cell.
            if (previousRenderedCell instanceof CellComp) {
                previousRenderedCell.focusCell(true);
            }

            if (this.focusService.focusNextGridCoreContainer(false)) {
                keyboardEvent.preventDefault();
            }
        }
    }

    // comes from API
    public tabToNextCell(backwards: boolean): boolean {
        const focusedCell = this.focusService.getFocusedCell();
        // if no focus, then cannot navigate
        if (!focusedCell) { return false; }

        let cellOrRowComp: CellComp | RowCtrl | null = this.getComponentForCell(focusedCell);

        // if cell is not rendered, means user has scrolled away from the cell
        // or that the focusedCell is a Full Width Row
        if (!cellOrRowComp) {
            cellOrRowComp = this.getRowConByPosition(focusedCell);
            if (!cellOrRowComp || !cellOrRowComp.isFullWidth()) {
                return false;
            }
        }

        return this.tabToNextCellCommon(cellOrRowComp, backwards);
    }

    private tabToNextCellCommon(previousCellOrRow: CellComp | RowCtrl, backwards: boolean): boolean {
        let editing = previousCellOrRow.isEditing();

        // if cell is not editing, there is still chance row is editing if it's Full Row Editing
        if (!editing && previousCellOrRow instanceof CellComp) {
            const cellComp = previousCellOrRow as CellComp;
            const rowCon = cellComp.getRenderedRow();
            if (rowCon) {
                editing = rowCon.isEditing();
            }
        }

        let res: boolean;

        if (editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            if (this.gridOptionsWrapper.isFullRowEdit()) {
                res = this.moveToNextEditingRow(previousCellOrRow as CellComp, backwards);
            } else {
                res = this.moveToNextEditingCell(previousCellOrRow as CellComp, backwards);
            }
        } else {
            res = this.moveToNextCellNotEditing(previousCellOrRow, backwards);
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        return res || !!this.focusService.getFocusedHeader();
    }

    private moveToNextEditingCell(previousRenderedCell: CellComp, backwards: boolean): boolean {
        const gridCell = previousRenderedCell.getCellPosition();

        // need to do this before getting next cell to edit, in case the next cell
        // has editable function (eg colDef.editable=func() ) and it depends on the
        // result of this cell, so need to save updates from the first edit, in case
        // the value is referenced in the function.
        previousRenderedCell.stopEditing();

        // find the next cell to start editing
        const nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, true) as CellComp;
        const foundCell = nextRenderedCell != null;

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (foundCell) {
            nextRenderedCell.startEditingIfEnabled(null, null, true);
            nextRenderedCell.focusCell(false);
        }

        return foundCell;
    }

    private moveToNextEditingRow(previousCellComp: CellComp, backwards: boolean): boolean {
        const cellPos = previousCellComp.getCellPosition();
        // find the next cell to start editing
        const nextCellComp = this.findNextCellToFocusOn(cellPos, backwards, true) as CellComp;

        if (nextCellComp == null) { return false; }

        const previousPos = previousCellComp.getCellPosition();
        const nextPos = nextCellComp.getCellPosition();

        const previousEditable = this.isCellEditable(previousPos);
        const nextEditable = this.isCellEditable(nextPos);

        const rowsMatch = nextPos && previousPos.rowIndex === nextPos.rowIndex && previousPos.rowPinned === nextPos.rowPinned;

        if (previousEditable) {
            previousCellComp.setFocusOutOnEditor();
        }

        if (!rowsMatch) {
            const pRow = previousCellComp.getRenderedRow();
            pRow!.stopEditing();

            const nRow = nextCellComp.getRenderedRow();
            nRow!.startRowEditing();
        }

        if (nextEditable) {
            nextCellComp.setFocusInOnEditor();
            nextCellComp.focusCell();
        } else {
            nextCellComp.focusCell(true);
        }

        return true;
    }

    private moveToNextCellNotEditing(previousRenderedCell: CellComp | RowCtrl, backwards: boolean): boolean {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        let gridCell: CellPosition;

        if (previousRenderedCell instanceof RowCtrl) {
            gridCell = {
                ...previousRenderedCell.getRowPosition(),
                column: backwards ? displayedColumns[0] : last(displayedColumns)
            };
        } else {
            gridCell = previousRenderedCell.getCellPosition();
        }
        // find the next cell to start editing
        const nextRenderedCell = this.findNextCellToFocusOn(gridCell, backwards, false);

        // only prevent default if we found a cell. so if user is on last cell and hits tab, then we default
        // to the normal tabbing so user can exit the grid.
        if (nextRenderedCell instanceof CellComp) {
            nextRenderedCell.focusCell(true);
        } else if (nextRenderedCell) {
            return this.tryToFocusFullWidthRow(nextRenderedCell.getRowPosition(), backwards);
        }

        return exists(nextRenderedCell);
    }

    // called by the cell, when tab is pressed while editing.
    // @return: RenderedCell when navigation successful, otherwise null
    private findNextCellToFocusOn(gridCell: CellPosition, backwards: boolean, startEditing: boolean): CellComp | RowCtrl | null {
        let nextCell: CellPosition | null = gridCell;

        while (true) {
            if (!backwards) {
                nextCell = this.getLastCellOfColSpan(nextCell);
            }
            nextCell = this.cellNavigationService.getNextTabbedCell(nextCell, backwards);

            // allow user to override what cell to go to next
            const userFunc = this.gridOptionsWrapper.getTabToNextCellFunc();

            if (exists(userFunc)) {
                const params = {
                    backwards: backwards,
                    editing: startEditing,
                    previousCellPosition: gridCell,
                    nextCellPosition: nextCell ? nextCell : null
                } as TabToNextCellParams;
                const userCell = userFunc(params);
                if (exists(userCell)) {
                    if ((userCell as any).floating) {
                        doOnce(() => { console.warn(`AG Grid: tabToNextCellFunc return type should have attributes: rowIndex, rowPinned, column. However you had 'floating', maybe you meant 'rowPinned'?`); }, 'no floating in userCell');
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
            if (!nextCell) { return null; }

            if (nextCell.rowIndex < 0) {
                const headerLen = this.beans.headerNavigationService.getHeaderRowCount();

                this.focusService.focusHeaderPosition(
                    { headerRowIndex: headerLen + (nextCell.rowIndex), column: nextCell.column }
                );

                return null;
            }

            // if editing, but cell not editable, skip cell. we do this before we do all of
            // the 'ensure index visible' and 'flush all frames', otherwise if we are skipping
            // a bunch of cells (eg 10 rows) then all the work on ensuring cell visible is useless
            // (except for the last one) which causes grid to stall for a while.
            // note - for full row edit, we do focus non-editable cells, as the row stays in edit mode.
            const fullRowEdit = this.gridOptionsWrapper.isFullRowEdit();
            if (startEditing && !fullRowEdit) {
                const cellIsEditable = this.isCellEditable(nextCell);
                if (!cellIsEditable) { continue; }
            }

            this.ensureCellVisible(nextCell);

            // we have to call this after ensureColumnVisible - otherwise it could be a virtual column
            // or row that is not currently in view, hence the renderedCell would not exist
            const nextCellComp = this.getComponentForCell(nextCell);

            // if next cell is fullWidth row, then no rendered cell,
            // as fullWidth rows have no cells, so we skip it
            if (!nextCellComp) {
                const rowComp = this.getRowConByPosition(nextCell);
                if (!rowComp || !rowComp.isFullWidth()) {
                    continue;
                } else {
                    return rowComp;
                }
            }

            if (nextCellComp.isSuppressNavigable()) { continue; }

            // by default, when we click a cell, it gets selected into a range, so to keep keyboard navigation
            // consistent, we set into range here also.
            if (this.rangeService) {
                this.rangeService.setRangeToCell(nextCell);
            }

            // we successfully tabbed onto a grid cell, so return true
            return nextCellComp;
        }
    }

    private isCellEditable(cell: CellPosition): boolean {
        const rowNode = this.lookupRowNodeForCell(cell);

        if (rowNode) {
            return cell.column.isCellEditable(rowNode);
        }

        return false;
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

    // returns true if any row between startIndex and endIndex is rendered. used by
    // SSRM or IRM, as they don't want to purge visible blocks from cache.
    public isRangeInRenderedViewport(startIndex: number, endIndex: number): boolean {

        // parent closed means the parent node is not expanded, thus these blocks are not visible
        const parentClosed = startIndex == null || endIndex == null;
        if (parentClosed) { return false; }

        const blockAfterViewport = startIndex > this.lastRenderedRow;
        const blockBeforeViewport = endIndex < this.firstRenderedRow;
        const blockInsideViewport = !blockBeforeViewport && !blockAfterViewport;

        return blockInsideViewport;
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
