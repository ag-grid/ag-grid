import { RowCtrl, RowCtrlInstanceId } from "./row/rowCtrl";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import {
    AgEventListener,
    BodyScrollEvent,
    CellFocusedEvent,
    DisplayedRowsChangedEvent,
    Events,
    FirstDataRenderedEvent,
    ModelUpdatedEvent,
    ViewportChangedEvent
} from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { CellPosition } from "../entities/cellPositionUtils";
import { BeanStub } from "../context/beanStub";
import { PaginationProxy } from "../pagination/paginationProxy";
import { Beans } from "./beans";
import { RowContainerHeightService } from "./rowContainerHeightService";
import { ICellEditor } from "../interfaces/iCellEditor";
import { IRowModel } from "../interfaces/iRowModel";
import { RowPosition } from "../entities/rowPositionUtils";
import { exists } from "../utils/generic";
import { getAllValuesInObject, iterateObject } from "../utils/object";
import { createArrayOfNumbers } from "../utils/number";
import { executeInAWhile } from "../utils/function";
import { CtrlsService } from "../ctrlsService";
import { GridBodyCtrl } from "../gridBodyComp/gridBodyCtrl";
import { CellCtrl } from "./cell/cellCtrl";
import { removeFromArray } from "../utils/array";
import { AnimationFrameService } from "../misc/animationFrameService";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { IRowNode } from "../interfaces/iRowNode";

type RowCtrlIdMap = Record<RowCtrlInstanceId, RowCtrl>;
type RowCtrlByRowIndex = Record<number, RowCtrl>;
export type RowCtrlByRowNodeIdMap = Record<string, RowCtrl>;

interface RowNodeMap {
    [id: string]: IRowNode;
}

export interface GetCellsParams<TData = any> {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: IRowNode<TData>[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}

export interface RefreshCellsParams<TData = any> extends GetCellsParams<TData> {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}

export interface FlashCellsParams<TData = any> extends GetCellsParams<TData> {
    /** @deprecated v31.1 Use `flashDuration` instead. */
    flashDelay?: number;
    /** @deprecated v31.1 Use `fadeDuration` instead. */
    fadeDelay?: number;

    /** The duration in milliseconds of how long a cell should remain in its "flashed" state. */
    flashDuration?: number;
    /** The duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `flashDuration` has completed. */
    fadeDuration?: number;
}

export interface GetCellRendererInstancesParams<TData = any> extends GetCellsParams<TData> { }

export interface GetCellEditorInstancesParams<TData = any> extends GetCellsParams<TData> { }

export interface RedrawRowsParams<TData = any> {
    /** Row nodes to redraw */
    rowNodes?: IRowNode<TData>[];
}

@Bean("rowRenderer")
export class RowRenderer extends BeanStub {

    @Autowired("animationFrameService") private animationFrameService: AnimationFrameService;
    @Autowired("paginationProxy") private paginationProxy: PaginationProxy;
    @Autowired("columnModel") private columnModel: ColumnModel;
    @Autowired("rowModel") private rowModel: IRowModel;
    @Autowired("beans") private beans: Beans;
    @Autowired("rowContainerHeightService") private rowContainerHeightService: RowContainerHeightService;
    @Autowired("ctrlsService") private ctrlsService: CtrlsService;

    private gridBodyCtrl: GridBodyCtrl;

    private destroyFuncsForColumnListeners: (() => void)[] = [];

    private firstRenderedRow: number;
    private lastRenderedRow: number;

    // map of row ids to row objects. keeps track of which elements
    // are rendered for which rows in the dom.
    private rowCtrlsByRowIndex: RowCtrlByRowIndex = {};
    private zombieRowCtrls: RowCtrlIdMap = {};
    private cachedRowCtrls: RowCtrlCache;
    private allRowCtrls: RowCtrl[] = [];

    private topRowCtrls: RowCtrl[] = [];
    private bottomRowCtrls: RowCtrl[] = [];

    private pinningLeft: boolean;
    private pinningRight: boolean;

    private firstVisibleVPixel: number;
    private lastVisibleVPixel: number;

    // we only allow one refresh at a time, otherwise the internal memory structure here
    // will get messed up. this can happen if the user has a cellRenderer, and inside the
    // renderer they call an API method that results in another pass of the refresh,
    // then it will be trying to draw rows in the middle of a refresh.
    private refreshInProgress = false;

    private dataFirstRenderedFired = false;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady((p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
            this.initialise();
        });
    }

    private initialise(): void {
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.onBodyScroll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.redraw.bind(this));

        this.addManagedPropertyListeners(['domLayout', 'embedFullWidthRows'], () => this.onDomLayoutChanged());
        this.addManagedPropertyListeners(['suppressMaxRenderedRowRestriction', 'rowBuffer'], () => this.redraw());
        this.addManagedPropertyListeners([
            'suppressCellFocus', 'getBusinessKeyForNode',
            'fullWidthCellRenderer', 'fullWidthCellRendererParams',
            'rowStyle', 'getRowStyle',
            'rowClass', 'getRowClass', 'rowClassRules',

            'suppressStickyTotalRow',

            'groupRowRenderer', 'groupRowRendererParams', // maybe only needs to refresh FW rows...
            'loadingCellRenderer', 'loadingCellRendererParams',
            'detailCellRenderer', 'detailCellRendererParams',
            'enableRangeSelection', 'enableCellTextSelection',
        ], () => this.redrawRows());


        this.registerCellEventListeners();

        this.initialiseCache();

        this.redrawAfterModelUpdate();
    }

    private initialiseCache(): void {
        if (this.gos.get('keepDetailRows')) {
            const countProp = this.getKeepDetailRowsCount();
            const count = countProp != null ? countProp : 3;
            this.cachedRowCtrls = new RowCtrlCache(count);
        }
    }

    private getKeepDetailRowsCount(): number {
        return this.gos.get('keepDetailRowsCount');
    }

    public getStickyTopRowCtrls(): RowCtrl[] {
        return [];
    }

    public getStickyBottomRowCtrls(): RowCtrl[] {
       return [];
    }

    private updateAllRowCtrls(): void {
        const liveList = getAllValuesInObject(this.rowCtrlsByRowIndex);
        const zombieList = getAllValuesInObject(this.zombieRowCtrls);
        const cachedList = this.cachedRowCtrls ? this.cachedRowCtrls.getEntries() : [];

        if (zombieList.length > 0 || cachedList.length > 0) {
            // Only spread if we need to.
            this.allRowCtrls = [...liveList, ...zombieList, ...cachedList];
        } else {
            this.allRowCtrls = liveList;
        }
    }

    // in a clean design, each cell would register for each of these events. however when scrolling, all the cells
    // registering and de-registering for events is a performance bottleneck. so we register here once and inform
    // all active cells.
    private registerCellEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onColumnHover());
        });

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onDisplayedColumnsChanged());
        });


        this.setupRangeSelectionListeners();

        // add listeners to the grid columns
        this.refreshListenersToColumnsForCellComps();
        // if the grid columns change, then refresh the listeners again
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshListenersToColumnsForCellComps.bind(this));

        this.addDestroyFunc(this.removeGridColumnListeners.bind(this));
    }

    private setupRangeSelectionListeners = () => {
        const onRangeSelectionChanged = () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.onRangeSelectionChanged());
        };

        const onColumnMovedPinnedVisible = () => {
            this.getAllCellCtrls().forEach(cellCtrl => cellCtrl.updateRangeBordersIfRangeCount());
        };

        const addRangeSelectionListeners = () => {
            this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, onRangeSelectionChanged);
            this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, onColumnMovedPinnedVisible);
            this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, onColumnMovedPinnedVisible);
            this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, onColumnMovedPinnedVisible);
        };

        const removeRangeSelectionListeners = () => {
            this.eventService.removeEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, onRangeSelectionChanged);
            this.eventService.removeEventListener(Events.EVENT_COLUMN_MOVED, onColumnMovedPinnedVisible);
            this.eventService.removeEventListener(Events.EVENT_COLUMN_PINNED, onColumnMovedPinnedVisible);
            this.eventService.removeEventListener(Events.EVENT_COLUMN_VISIBLE, onColumnMovedPinnedVisible);
        };
        this.addDestroyFunc(() => removeRangeSelectionListeners());
        this.addManagedPropertyListener('enableRangeSelection', (params) => {
            const isEnabled = params.currentValue;
            if (isEnabled) {
                addRangeSelectionListeners();
            } else {
                removeRangeSelectionListeners();
            }
        });
        const rangeSelectionEnabled = this.gos.get('enableRangeSelection');
        if (rangeSelectionEnabled) {
            addRangeSelectionListeners();
        }
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

        cols.forEach(col => {
            const forEachCellWithThisCol = (callback: (cellCtrl: CellCtrl) => void) => {
                this.getAllCellCtrls().forEach(cellCtrl => {
                    if (cellCtrl.getColumn() === col) {
                        callback(cellCtrl);
                    }
                });
            };

            const leftChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onLeftChanged());
            };
            const widthChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onWidthChanged());
            };
            const firstRightPinnedChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onFirstRightPinnedChanged());
            };
            const lastLeftPinnedChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onLastLeftPinnedChanged());
            };
            const colDefChangedListener = () => {
                forEachCellWithThisCol(cellCtrl => cellCtrl.onColDefChanged());
            };

            col.addEventListener('leftChanged', leftChangedListener);
            col.addEventListener('widthChanged', widthChangedListener);
            col.addEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
            col.addEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
            col.addEventListener('colDefChanged', colDefChangedListener);

            this.destroyFuncsForColumnListeners.push(() => {
                col.removeEventListener('leftChanged', leftChangedListener);
                col.removeEventListener('widthChanged', widthChangedListener);
                col.removeEventListener('firstRightPinnedChanged', firstRightPinnedChangedListener);
                col.removeEventListener('lastLeftPinnedChanged', lastLeftPinnedChangedListener);
                col.removeEventListener('colDefChanged', colDefChangedListener);
            });
        });
    }

    private onDomLayoutChanged(): void {
    }

    // for row models that have datasources, when we update the datasource, we need to force the rowRenderer
    // to redraw all rows. otherwise the old rows from the old datasource will stay displayed.
    public datasourceChanged(): void {
        this.firstRenderedRow = 0;
        this.lastRenderedRow = -1;
        const rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
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
        const res: HTMLElement[] = [];

        this.getAllRowCtrls().forEach(rowCtrl => {
            const eCell = rowCtrl.getCellElement(column);
            if (eCell) { res.push(eCell); }
        });

        return res;
    }

    public refreshFloatingRowComps(): void {
    }

    public getTopRowCtrls(): RowCtrl[] {
        return this.topRowCtrls;
    }

    public getCentreRowCtrls(): RowCtrl[] {
        return this.allRowCtrls;
    }

    public getBottomRowCtrls(): RowCtrl[] {
        return this.bottomRowCtrls;
    }

    private onPinnedRowDataChanged(): void {
        
    }

    public redrawRow(rowNode: RowNode, suppressEvent = false) {
        if (this.cachedRowCtrls?.has(rowNode)) {
            // delete row from cache if it needs redrawn
            // if it's in the cache no updates need fired, as nothing
            // has been rendered
            this.cachedRowCtrls.removeRow(rowNode);
            return;
        } else {
            const destroyAndRecreateCtrl = (dataStruct: RowCtrl[] | { [idx: number]: RowCtrl }) => {
                const ctrl = dataStruct[rowNode.rowIndex!];
                if (!ctrl) {
                    return;
                }
                if (ctrl.getRowNode() !== rowNode) {
                    // if the node is in the wrong place, then the row model is responsible for triggering a full refresh.
                    return;
                }
                ctrl.destroyFirstPass();
                ctrl.destroySecondPass();
                dataStruct[rowNode.rowIndex!] = this.createRowCon(rowNode, false, false);
            }

            switch (rowNode.rowPinned) {
                case 'top':
                    destroyAndRecreateCtrl(this.topRowCtrls);
                    break;
                case 'bottom':
                    destroyAndRecreateCtrl(this.bottomRowCtrls);
                    break;
                default:
                    destroyAndRecreateCtrl(this.rowCtrlsByRowIndex);
                    this.updateAllRowCtrls();
            }
        }

        if (!suppressEvent) {
            this.dispatchDisplayedRowsChanged(false);
        }
    }

    public redrawRows(rowNodes?: IRowNode[]): void {
        // if no row nodes provided, then refresh everything
        const partialRefresh = rowNodes != null;

        if (partialRefresh) {
            rowNodes?.forEach(node => this.redrawRow(node as RowNode, true));
            this.dispatchDisplayedRowsChanged(false);
            return;
        }

        this.redrawAfterModelUpdate();
    }


    // gets called from:
    // +) initialisation (in registerGridComp) params = null
    // +) onDomLayoutChanged, params = null
    // +) onPageLoaded, recycleRows, animate, newData, newPage from event, onlyBody=true
    // +) onPinnedRowDataChanged, recycleRows = true
    // +) redrawRows (from Grid API), recycleRows = true/false
    private redrawAfterModelUpdate(params: RefreshViewParams = {}): void {
        this.getLockOnRefresh();

        this.updateContainerHeights();
        this.scrollToTopIfNewData(params);

        // never recycle rows on layout change as rows could change from normal DOM layout
        // back to the grid's row positioning.
        const recycleRows: boolean = !params.domLayoutChanged && !!params.recycleRows;
        const animate = params.animate && this.gos.isAnimateRows();

        // after modelUpdate, row indexes can change, so we clear out the rowsByIndex map,
        // however we can reuse the rows, so we keep them but index by rowNode.id
        const rowsToRecycle = recycleRows ? this.getRowsToRecycle() : null;
        if (!recycleRows) {
            this.removeAllRowComps();
        }

        this.workOutFirstAndLastRowsToRender();

        this.recycleRows(rowsToRecycle, animate);

        this.gridBodyCtrl.updateRowCount();

        if (!params.onlyBody) {
            this.refreshFloatingRowComps();
        }

        this.dispatchDisplayedRowsChanged();

        this.releaseLockOnRefresh();
    }

    private scrollToTopIfNewData(params: RefreshViewParams): void {
        const scrollToTop = params.newData || params.newPage;
        const suppressScrollToTop = this.gos.get('suppressScrollOnNewData');

        if (scrollToTop && !suppressScrollToTop) {
            this.gridBodyCtrl.getScrollFeature().scrollToTop();
        }
    }

    private updateContainerHeights(): void {

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
                "this, put the API call into a timeout, e.g. instead of api.redrawRows(), " +
                "call setTimeout(function() { api.redrawRows(); }, 0). To see what part of your code " +
                "that caused the refresh check this stacktrace."
            );
        }

        this.refreshInProgress = true;
    }

    private releaseLockOnRefresh(): void {
        this.refreshInProgress = false;
    }

    public isRefreshInProgress(): boolean {
        return this.refreshInProgress;
    }


    public getAllCellCtrls(): CellCtrl[] {
        const res: CellCtrl[] = [];
        const rowCtrls = this.getAllRowCtrls();
        const rowCtrlsLength = rowCtrls.length;

        for (let i = 0; i < rowCtrlsLength; i++) {
            const cellCtrls = rowCtrls[i].getAllCellCtrls();
            const cellCtrlsLength = cellCtrls.length;

            for (let j = 0; j < cellCtrlsLength; j++) {
                res.push(cellCtrls[j]);
            }
        }

        return res;
    }

    private getAllRowCtrls(): RowCtrl[] {
        const res = [...this.topRowCtrls, ...this.bottomRowCtrls];

        for (const key in this.rowCtrlsByRowIndex) {
            res.push(this.rowCtrlsByRowIndex[key]);
        }
        return res;
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: AgEventListener): void {
        const rowComp = this.rowCtrlsByRowIndex[rowIndex];
        if (rowComp) {
            rowComp.addEventListener(eventName, callback);
        }
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        const refreshCellParams = {
            forceRefresh: params.force,
            newData: false,
            suppressFlash: params.suppressFlash
        };
        this.getCellCtrls(params.rowNodes, params.columns)
            .forEach(cellCtrl => cellCtrl.refreshOrDestroyCell(refreshCellParams));

        if (params.rowNodes) {
           
            this.dispatchDisplayedRowsChanged(false);
        }
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams): any[] {
       return [];
    }

    public getCellEditorInstances(params: GetCellRendererInstancesParams): ICellEditor[] {

        const res: ICellEditor[] = [];

        this.getCellCtrls(params.rowNodes, params.columns).forEach(cellCtrl => {
            const cellEditor = cellCtrl.getCellEditor() as ICellEditor;

            if (cellEditor) {
                res.push(cellEditor);
            }
        });

        return res;
    }

    public getEditingCells(): CellPosition[] {
        const res: CellPosition[] = [];
        return res;
    }

    private mapRowNodes(rowNodes?: IRowNode[] | null): { top: RowNodeMap, bottom: RowNodeMap, normal: RowNodeMap } | undefined {
        if (!rowNodes) { return; }

        const res: {top: RowNodeMap, bottom: RowNodeMap, normal: RowNodeMap} = {
            top: {},
            bottom: {},
            normal: {}
        };

        rowNodes.forEach(rowNode => {
            const id = rowNode.id!;
            switch (rowNode.rowPinned) {
                case 'top': res.top[id] = rowNode; break;
                case 'bottom': res.bottom[id] = rowNode; break;
                default: res.normal[id] = rowNode; break;
            }
        });

        return res;
    }

    private isRowInMap(rowNode: RowNode, rowIdsMap: {top: RowNodeMap, bottom: RowNodeMap, normal: RowNodeMap}): boolean {
        // skip this row if it is missing from the provided list
        const id = rowNode.id!;
        const floating = rowNode.rowPinned;

        switch (floating) {
            case 'top': return rowIdsMap.top[id] != null;
            case 'bottom': return rowIdsMap.bottom[id] != null;
            default: return rowIdsMap.normal[id] != null;
        }
    }

    /**
     * @param rowNodes if provided, returns the RowCtrls for the provided rowNodes. otherwise returns all RowCtrls.
     */
    public getRowCtrls(rowNodes?: IRowNode[] | null): RowCtrl[] {
        const rowIdsMap = this.mapRowNodes(rowNodes);
        const allRowCtrls = this.getAllRowCtrls();
        if (!rowNodes || !rowIdsMap) {
            return allRowCtrls;
        }

        return allRowCtrls.filter(rowCtrl => {
            const rowNode = rowCtrl.getRowNode();
            return this.isRowInMap(rowNode, rowIdsMap);
        });
    }

    // returns CellCtrl's that match the provided rowNodes and columns. eg if one row node
    // and two columns provided, that identifies 4 cells, so 4 CellCtrl's returned.
    private getCellCtrls(rowNodes?: IRowNode[] | null, columns?: (string | Column)[]): CellCtrl[] {
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

        const res: CellCtrl[] = [];
        this.getRowCtrls(rowNodes).forEach(rowCtrl => {
            rowCtrl.getAllCellCtrls().forEach(cellCtrl => {
                const colId: string = cellCtrl.getColumn().getId();
                const excludeColFromRefresh = colIdsMap && !colIdsMap[colId];

                if (excludeColFromRefresh) { return; }

                res.push(cellCtrl);
            });
        });
        return res;
    }

    protected destroy(): void {
        this.removeAllRowComps();
        super.destroy();
    }

    private removeAllRowComps(): void {
        const rowIndexesToRemove = Object.keys(this.rowCtrlsByRowIndex);
        this.removeRowCtrls(rowIndexesToRemove);
    }

    private getRowsToRecycle(): RowCtrlByRowNodeIdMap {
        // remove all stub nodes, they can't be reused, as no rowNode id
        const stubNodeIndexes: string[] = [];
        iterateObject(this.rowCtrlsByRowIndex, (index: string, rowCtrl: RowCtrl) => {
            const stubNode = rowCtrl.getRowNode().id == null;
            if (stubNode) {
                stubNodeIndexes.push(index);
            }
        });
        this.removeRowCtrls(stubNodeIndexes);

        // then clear out rowCompsByIndex, but before that take a copy, but index by id, not rowIndex
        const ctrlsByIdMap: RowCtrlByRowNodeIdMap = {};
        iterateObject(this.rowCtrlsByRowIndex, (index: string, rowCtrl: RowCtrl) => {
            const rowNode = rowCtrl.getRowNode();
            ctrlsByIdMap[rowNode.id!] = rowCtrl;
        });
        this.rowCtrlsByRowIndex = {};

        return ctrlsByIdMap;
    }

    // takes array of row indexes
    private removeRowCtrls(rowsToRemove: any[], suppressAnimation: boolean = false) {
        // if no fromIndex then set to -1, which will refresh everything
        // let realFromIndex = -1;

        rowsToRemove.forEach((indexToRemove) => {
            const rowCtrl = this.rowCtrlsByRowIndex[indexToRemove];
            if (rowCtrl) {
                rowCtrl.destroyFirstPass(suppressAnimation);
                rowCtrl.destroySecondPass();
            }
            delete this.rowCtrlsByRowIndex[indexToRemove];
        });
    }

    private onBodyScroll(e: BodyScrollEvent) {
        if (e.direction !== 'vertical') { return; }
        this.redraw({ afterScroll: true });
    }

    // gets called when rows don't change, but viewport does, so after:
    // 1) height of grid body changes, ie number of displayed rows has changed
    // 2) grid scrolled to new position
    // 3) ensure index visible (which is a scroll)
    public redraw(params: { afterScroll?: boolean } = {}) {
        const { afterScroll } = params;
        let cellFocused: CellPosition | undefined;


        const oldFirstRow = this.firstRenderedRow;
        const oldLastRow = this.lastRenderedRow;
        this.workOutFirstAndLastRowsToRender();

        let hasStickyRowChanges = false;

        const rangeChanged = this.firstRenderedRow !== oldFirstRow || this.lastRenderedRow !== oldLastRow;

        if (afterScroll && !hasStickyRowChanges && !rangeChanged) { return; }

        this.getLockOnRefresh();
        this.recycleRows(null, false, afterScroll);
        this.releaseLockOnRefresh();
        // AfterScroll results in flushSync in React but we need to disable flushSync for sticky row group changes to avoid flashing
        this.dispatchDisplayedRowsChanged(afterScroll && !hasStickyRowChanges);
    }

    private removeRowCompsNotToDraw(indexesToDraw: number[], suppressAnimation: boolean): void {
        // for speedy lookup, dump into map
        const indexesToDrawMap: { [index: string]: boolean; } = {};
        indexesToDraw.forEach(index => (indexesToDrawMap[index] = true));

        const existingIndexes = Object.keys(this.rowCtrlsByRowIndex);
        const indexesNotToDraw: string[] = existingIndexes.filter(index => !indexesToDrawMap[index]);

        this.removeRowCtrls(indexesNotToDraw, suppressAnimation);
    }

    private calculateIndexesToDraw(rowsToRecycle?: { [key: string]: RowCtrl; } | null): number[] {
        // all in all indexes in the viewport
        let indexesToDraw = createArrayOfNumbers(this.firstRenderedRow, this.lastRenderedRow);

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
        iterateObject(this.rowCtrlsByRowIndex, checkRowToDraw);

        // if we are redrawing due to model update, then old rows are in rowsToRecycle
        iterateObject(rowsToRecycle, checkRowToDraw);

        indexesToDraw.sort((a: number, b: number) => a - b);

        const ret: number[] = [];

        for (let i = 0; i < indexesToDraw.length; i++) {
            const currRow = indexesToDraw[i];
            const rowNode = this.paginationProxy.getRow(currRow);
            if (rowNode && !rowNode.sticky) {
                ret.push(currRow);
            }
        }

        return ret;
    }

    private recycleRows(rowsToRecycle?: { [key: string]: RowCtrl; } | null, animate = false, afterScroll = false) {
        // the row can already exist and be in the following:
        // rowsToRecycle -> if model change, then the index may be different, however row may
        //                         exist here from previous time (mapped by id).
        // this.rowCompsByIndex -> if just a scroll, then this will contain what is currently in the viewport

        // this is all the indexes we want, including those that already exist, so this method
        // will end up going through each index and drawing only if the row doesn't already exist
        const indexesToDraw = this.calculateIndexesToDraw(rowsToRecycle);
        
        // never animate when doing print layout - as we want to get things ready to print as quickly as possible,
        // otherwise we risk the printer printing a row that's half faded (half way through fading in)
        // Don't animate rows that have been added or removed as part of scrolling
        if ( afterScroll) {
            animate = false;
        }
        
        this.removeRowCompsNotToDraw(indexesToDraw, !animate);

        // add in new rows
        const rowCtrls: RowCtrl[] = [];

        indexesToDraw.forEach(rowIndex => {
            const rowCtrl = this.createOrUpdateRowCtrl(rowIndex, rowsToRecycle, animate, afterScroll);
            if (exists(rowCtrl)) {
                rowCtrls.push(rowCtrl);
            }
        });

        if (rowsToRecycle) {
            const useAnimationFrame = afterScroll && !this.gos.get('suppressAnimationFrame');
            if (useAnimationFrame) {
                this.beans.animationFrameService.addDestroyTask(() => {
                    this.destroyRowCtrls(rowsToRecycle, animate);
                    this.updateAllRowCtrls();
                    this.dispatchDisplayedRowsChanged();
                });
            } else {
                this.destroyRowCtrls(rowsToRecycle, animate);
            }
        }

        this.updateAllRowCtrls();
    }

    private dispatchDisplayedRowsChanged(afterScroll: boolean = false): void {
        const event: WithoutGridCommon<DisplayedRowsChangedEvent> = { type: Events.EVENT_DISPLAYED_ROWS_CHANGED, afterScroll };
        this.eventService.dispatchEvent(event);
    }

    private onDisplayedColumnsChanged(): void {
        const pinningLeft = this.columnModel.isPinningLeft();
        const pinningRight = this.columnModel.isPinningRight();
        const atLeastOneChanged = this.pinningLeft !== pinningLeft || pinningRight !== this.pinningRight;

        if (atLeastOneChanged) {
            this.pinningLeft = pinningLeft;
            this.pinningRight = pinningRight;
        }
    }


    private createOrUpdateRowCtrl(
        rowIndex: number,
        rowsToRecycle: { [key: string]: RowCtrl | null; } | null | undefined,
        animate: boolean,
        afterScroll: boolean
    ): RowCtrl | null | undefined {
        let rowNode: RowNode | undefined;
        let rowCtrl: RowCtrl | null = this.rowCtrlsByRowIndex[rowIndex];

        // if no row comp, see if we can get it from the previous rowComps
        if (!rowCtrl) {
            rowNode = this.paginationProxy.getRow(rowIndex);
            if (exists(rowNode) && exists(rowsToRecycle) && rowsToRecycle[rowNode.id!] && rowNode.alreadyRendered) {
                rowCtrl = rowsToRecycle[rowNode.id!];
                rowsToRecycle[rowNode.id!] = null;
            }
        }

        const creatingNewRowCtrl = !rowCtrl;

        if (creatingNewRowCtrl) {
            // create a new one
            if (!rowNode) {
                rowNode = this.paginationProxy.getRow(rowIndex);
            }

            if (exists(rowNode)) {
                rowCtrl = this.createRowCon(rowNode, animate, afterScroll);
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

        this.rowCtrlsByRowIndex[rowIndex] = rowCtrl!;

        return rowCtrl;
    }

    private destroyRowCtrls(rowCtrlsMap: RowCtrlIdMap | null | undefined, animate: boolean): void {
        const executeInAWhileFuncs: (() => void)[] = [];
        iterateObject(rowCtrlsMap, (nodeId: string, rowCtrl: RowCtrl) => {
            // if row was used, then it's null
            if (!rowCtrl) { return; }

            if (this.cachedRowCtrls && rowCtrl.isCacheable()) {
                this.cachedRowCtrls.addRow(rowCtrl);
                return;
            }

            rowCtrl.destroyFirstPass(!animate);
            if (animate) {
                this.zombieRowCtrls[rowCtrl.getInstanceId()] = rowCtrl;
                executeInAWhileFuncs.push(() => {
                    rowCtrl.destroySecondPass();
                    delete this.zombieRowCtrls[rowCtrl.getInstanceId()];
                });
            } else {
                rowCtrl.destroySecondPass();
            }
        });
        if (animate) {
            // this ensures we fire displayedRowsChanged AFTER all the 'executeInAWhileFuncs' get
            // executed, as we added it to the end of the list.
            executeInAWhileFuncs.push(() => {
                this.updateAllRowCtrls();
                this.dispatchDisplayedRowsChanged();
            });
            executeInAWhile(executeInAWhileFuncs);
        }
    }

    private getRowBuffer(): number {
        return this.gos.get('rowBuffer');
    }

    private getRowBufferInPixels() {
        const rowsToBuffer = this.getRowBuffer();
        const defaultRowHeight = this.gos.getRowHeightAsNumber();

        return rowsToBuffer * defaultRowHeight;
    }

    private workOutFirstAndLastRowsToRender(): void {
        this.rowContainerHeightService.updateOffset();
        let newFirst: number;
        let newLast: number;

        if (!this.paginationProxy.isRowsToRender()) {
            newFirst = 0;
            newLast = -1; // setting to -1 means nothing in range
        } else {
            const bufferPixels = this.getRowBufferInPixels();
            const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            const suppressRowVirtualisation = this.gos.get('suppressRowVirtualisation');

            let rowHeightsChanged = false;
            let firstPixel: number;
            let lastPixel: number;
            do {
                const paginationOffset = this.paginationProxy.getPixelOffset();
                const {pageFirstPixel, pageLastPixel} = this.paginationProxy.getCurrentPagePixelRange();
                const divStretchOffset = this.rowContainerHeightService.getDivStretchOffset();

                const bodyVRange = gridBodyCtrl.getScrollFeature().getVScrollPosition();
                const bodyTopPixel = bodyVRange.top;
                const bodyBottomPixel = bodyVRange.bottom;

                if (suppressRowVirtualisation) {
                    firstPixel = pageFirstPixel + divStretchOffset;
                    lastPixel = pageLastPixel + divStretchOffset;
                } else {
                    firstPixel = Math.max(bodyTopPixel + paginationOffset - bufferPixels, pageFirstPixel) + divStretchOffset;
                    lastPixel = Math.min(bodyBottomPixel + paginationOffset + bufferPixels, pageLastPixel) + divStretchOffset;
                }

                this.firstVisibleVPixel = Math.max(bodyTopPixel + paginationOffset, pageFirstPixel) + divStretchOffset;
                this.lastVisibleVPixel = Math.min(bodyBottomPixel + paginationOffset, pageLastPixel) + divStretchOffset;

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
        const rowLayoutNormal = this.gos.isDomLayout('normal');
        const suppressRowCountRestriction = this.gos.get('suppressMaxRenderedRowRestriction');
        const rowBufferMaxSize = Math.max(this.getRowBuffer(), 500);

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

            const event: WithoutGridCommon<ViewportChangedEvent> = {
                type: Events.EVENT_VIEWPORT_CHANGED,
                firstRow: newFirst,
                lastRow: newLast
            };

            this.eventService.dispatchEvent(event);
        }
    }

    /**
     * This event will only be fired once, and is queued until after the browser next renders.
     * This allows us to fire an event during the start of the render cycle, when we first see data being rendered
     * but not execute the event until all of the data has finished being rendered to the dom.
     */
    public dispatchFirstDataRenderedEvent() {
        if (this.dataFirstRenderedFired) { return; }
        this.dataFirstRenderedFired = true;

        const event: WithoutGridCommon<FirstDataRenderedEvent> = {
            type: Events.EVENT_FIRST_DATA_RENDERED,
            firstRow: this.firstRenderedRow,
            lastRow: this.lastRenderedRow,
        };

        // See AG-7018
        window.requestAnimationFrame(() => {
            this.beans.eventService.dispatchEvent(event);
        });
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

    public getFirstVisibleVerticalPixel(): number {
        return this.firstVisibleVPixel;
    }

    public getLastVisibleVerticalPixel(): number {
        return this.lastVisibleVPixel;
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
            return REMOVE_ROW;
    }

    private createRowCon(rowNode: RowNode, animate: boolean, afterScroll: boolean): RowCtrl {

        const rowCtrlFromCache = this.cachedRowCtrls ? this.cachedRowCtrls.getRow(rowNode) : null;
        if (rowCtrlFromCache) { return rowCtrlFromCache; }

        // we don't use animations frames for printing, so the user can put the grid into print mode
        // and immediately print - otherwise the user would have to wait for the rows to draw in the background
        // (via the animation frames) which is awkward to do from code.

        // we only do the animation frames after scrolling, as this is where we want the smooth user experience.
        // having animation frames for other times makes the grid look 'jumpy'.

        const suppressAnimationFrame = this.gos.get('suppressAnimationFrame');
        const useAnimationFrameForCreate = afterScroll && !suppressAnimationFrame;

        const res = new RowCtrl(
            rowNode,
            this.beans,
            animate,
            useAnimationFrameForCreate,
            false
        );

        return res;
    }

    public getRenderedNodes() {
        const renderedRows = this.rowCtrlsByRowIndex;
        return Object.values(renderedRows).map(rowCtrl => rowCtrl.getRowNode());
    }

    public getRowByPosition(rowPosition: RowPosition): RowCtrl | null {
        let rowCtrl: RowCtrl | null;
        const {rowIndex} = rowPosition;
        switch (rowPosition.rowPinned) {
            case 'top':
                rowCtrl = this.topRowCtrls[rowIndex];
                break;
            case 'bottom':
                rowCtrl = this.bottomRowCtrls[rowIndex];
                break;
            default:
                rowCtrl = this.rowCtrlsByRowIndex[rowIndex];
                if (!rowCtrl) {
                    rowCtrl = this.getStickyTopRowCtrls().find(ctrl => ctrl.getRowNode().rowIndex === rowIndex) || null;

                    if (!rowCtrl) {
                        rowCtrl = this.getStickyBottomRowCtrls().find(ctrl => ctrl.getRowNode().rowIndex === rowIndex) || null;
                    }
                }
                break;
        }

        return rowCtrl;
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

class RowCtrlCache {

    // map for fast access
    private entriesMap: RowCtrlByRowNodeIdMap = {};

    // list for keeping order
    private entriesList: RowCtrl[] = [];

    private readonly maxCount: number;

    constructor(maxCount: number) {
        this.maxCount = maxCount;
    }

    public addRow(rowCtrl: RowCtrl): void {
        this.entriesMap[rowCtrl.getRowNode().id!] = rowCtrl;
        this.entriesList.push(rowCtrl);
        rowCtrl.setCached(true);

        if (this.entriesList.length > this.maxCount) {
            const rowCtrlToDestroy = this.entriesList[0];
            rowCtrlToDestroy.destroyFirstPass();
            rowCtrlToDestroy.destroySecondPass();
            this.removeFromCache(rowCtrlToDestroy);
        }
    }

    public getRow(rowNode: RowNode): RowCtrl | null {
        if (rowNode == null || rowNode.id == null) { return null; }

        const res = this.entriesMap[rowNode.id];

        if (!res) { return null; }

        this.removeFromCache(res);
        res.setCached(false);

        // this can happen if user reloads data, and a new RowNode is reusing
        // the same ID as the old one
        const rowNodeMismatch = res.getRowNode() != rowNode;

        return rowNodeMismatch ? null : res;
    }

    public has(rowNode: RowNode): boolean {
        return this.entriesMap[rowNode.id!] != null;
    }

    public removeRow(rowNode: RowNode): void {
        const rowNodeId = rowNode.id!;
        const ctrl = this.entriesMap[rowNodeId];
        delete this.entriesMap[rowNodeId];
        removeFromArray(this.entriesList, ctrl);
    }

    public removeFromCache(rowCtrl: RowCtrl): void {
        const rowNodeId = rowCtrl.getRowNode().id!;
        delete this.entriesMap[rowNodeId];
        removeFromArray(this.entriesList, rowCtrl);
    }

    public getEntries(): RowCtrl[] {
        return this.entriesList;
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
    domLayoutChanged?: boolean;
}
