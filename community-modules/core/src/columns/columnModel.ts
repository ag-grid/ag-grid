import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, Context } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { Environment } from '../environment';
import type { ColumnEventType } from '../events';
import type { QuickFilterService } from '../filter/quickFilterService';
import type { PropertyChangedSource } from '../gridOptionsService';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { HeaderRowCtrl } from '../headerRendering/row/headerRowCtrl';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { Column, ColumnPinnedType } from '../interfaces/iColumn';
import type { IShowRowGroupColsService } from '../interfaces/iShowRowGroupColsService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _areEqual, _includes, _insertIntoArray, _moveInArray } from '../utils/array';
import { _warnOnce } from '../utils/function';
import { _missingOrEmpty } from '../utils/generic';
import type { ValueCache } from '../valueService/valueCache';
import type { ColumnApplyStateService, ColumnState } from './columnApplyStateService';
import type { ColumnAutosizeService } from './columnAutosizeService';
import type { ColumnDefFactory } from './columnDefFactory';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import type { ColumnFactory } from './columnFactory';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColumnGroupStateService } from './columnGroupStateService';
import type { ColumnMoveService } from './columnMoveService';
import type { ColumnSizeService } from './columnSizeService';
import { GROUP_AUTO_COLUMN_ID } from './columnUtils';
import { destroyColumnTree, getColumnsFromTree, isColumnGroupAutoCol } from './columnUtils';
import type { ColumnViewportService } from './columnViewportService';
import type { IControlColService } from './controlColService';
import type { FuncColsService } from './funcColsService';
import type { PivotResultColsService } from './pivotResultColsService';
import type { VisibleColsService } from './visibleColsService';

export type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export type Maybe<T> = T | null | undefined;

export interface ColumnCollections {
    // columns in a tree, leaf levels are columns, everything above is group column
    tree: (AgColumn | AgProvidedColumnGroup)[];
    treeDepth: number; // depth of the tree above
    // leaf level cols of the tree
    list: AgColumn[];
    // cols by id, for quick lookup
    map: { [id: string]: AgColumn };
}

export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'columnModel' as const;

    private context: Context;
    private ctrlsService: CtrlsService;
    private columnFactory: ColumnFactory;
    private columnSizeService: ColumnSizeService;
    private visibleColsService: VisibleColsService;
    private columnViewportService: ColumnViewportService;
    private pivotResultColsService: PivotResultColsService;
    private columnAnimationService: ColumnAnimationService;
    private autoColService?: IAutoColService;
    private controlColService?: IControlColService;
    private valueCache: ValueCache;
    private columnDefFactory: ColumnDefFactory;
    private columnApplyStateService: ColumnApplyStateService;
    private columnGroupStateService: ColumnGroupStateService;
    private eventDispatcher: ColumnEventDispatcher;
    private columnMoveService: ColumnMoveService;
    private columnAutosizeService: ColumnAutosizeService;
    private funcColsService: FuncColsService;
    private quickFilterService?: QuickFilterService;
    private showRowGroupColsService?: IShowRowGroupColsService;
    private environment: Environment;

    public wireBeans(beans: BeanCollection): void {
        this.context = beans.context;
        this.ctrlsService = beans.ctrlsService;
        this.columnFactory = beans.columnFactory;
        this.columnSizeService = beans.columnSizeService;
        this.visibleColsService = beans.visibleColsService;
        this.columnViewportService = beans.columnViewportService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.columnAnimationService = beans.columnAnimationService;
        this.autoColService = beans.autoColService;
        this.controlColService = beans.controlColService;
        this.valueCache = beans.valueCache;
        this.columnDefFactory = beans.columnDefFactory;
        this.columnApplyStateService = beans.columnApplyStateService;
        this.columnGroupStateService = beans.columnGroupStateService;
        this.eventDispatcher = beans.columnEventDispatcher;
        this.columnMoveService = beans.columnMoveService;
        this.columnAutosizeService = beans.columnAutosizeService;
        this.funcColsService = beans.funcColsService;
        this.quickFilterService = beans.quickFilterService;
        this.showRowGroupColsService = beans.showRowGroupColsService;
        this.environment = beans.environment;
    }

    // as provided by gridProp columnsDefs
    private colDefs: (ColDef | ColGroupDef)[];

    // columns generated from columnDefs
    // this doesn't change (including order) unless columnDefs prop changses.
    private colDefCols: ColumnCollections;

    // group auto columns
    private autoCols: ColumnCollections | null;

    private controlCols: ColumnCollections | null;

    // [providedCols OR pivotResultCols] PLUS autoGroupCols.
    // this cols.list maintains column order.
    private cols: ColumnCollections;

    // if pivotMode is on, however pivot results are NOT shown if no pivot columns are set
    private pivotMode = false;

    // true when pivotResultCols are in cols
    private showingPivotResult: boolean;

    private lastOrder: AgColumn[] | null;
    private lastPivotOrder: AgColumn[] | null;

    // true if we are doing column spanning
    private colSpanActive: boolean;

    // grid columns that have colDef.autoHeight set
    private autoHeightActive: boolean;
    private autoHeightActiveAtLeastOnce = false;

    private ready = false;
    private changeEventsDispatching = false;

    // when we're waiting for cell data types to be inferred, we need to defer column resizing
    private shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

    public postConstruct(): void {
        const pivotMode = this.gos.get('pivotMode');

        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }

        this.addManagedPropertyListeners(
            ['groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'],
            (event) => this.refreshAll(convertSourceType(event.source))
        );
        this.addManagedPropertyListener('autoGroupColumnDef', (event) =>
            this.onAutoGroupColumnDefChanged(convertSourceType(event.source))
        );
        this.addManagedPropertyListeners(
            ['defaultColDef', 'defaultColGroupDef', 'columnTypes', 'suppressFieldDotNotation'],
            (event) => this.recreateColumnDefs(convertSourceType(event.source))
        );
        this.addManagedPropertyListener('pivotMode', (event) =>
            this.setPivotMode(this.gos.get('pivotMode'), convertSourceType(event.source))
        );
        this.addManagedEventListeners({ firstDataRendered: () => this.onFirstDataRendered() });
    }

    // called from SyncService, when grid has finished initialising
    private createColsFromColDefs(colsPreviouslyExisted: boolean, source: ColumnEventType): void {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = colsPreviouslyExisted
            ? this.columnApplyStateService.compareColumnStatesAndDispatchEvents(source)
            : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();

        const oldCols = this.colDefCols?.list;
        const oldTree = this.colDefCols?.tree;
        const newTree = this.columnFactory.createColumnTree(this.colDefs, true, oldTree, source);

        destroyColumnTree(this.context, this.colDefCols?.tree, newTree.columnTree);

        const tree = newTree.columnTree;
        const treeDepth = newTree.treeDept;
        const list = getColumnsFromTree(tree);
        const map: { [id: string]: AgColumn } = {};

        list.forEach((col) => (map[col.getId()] = col));

        this.colDefCols = { tree, treeDepth, list, map };

        this.funcColsService.extractCols(source, oldCols);

        this.ready = true;

        this.refreshCols();

        const maintainColOrder =
            colsPreviouslyExisted && !this.showingPivotResult && !this.gos.get('maintainColumnOrder');
        if (maintainColOrder) {
            this.orderColsLikeColDefCols();
        }

        this.visibleColsService.refresh(source);
        this.columnViewportService.checkViewportColumns();

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.eventDispatcher.everythingChanged(source);

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            dispatchEventsFunc();
            this.changeEventsDispatching = false;
        }

        this.eventDispatcher.newColumnsLoaded(source);
        if (source === 'gridInitializing') {
            this.columnSizeService.applyAutosizeStrategy();
        }
    }

    // called from: buildAutoGroupColumns (events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents')
    // createColsFromColDefs (recreateColumnDefs, setColumnsDefs),
    // setPivotMode, applyColumnState,
    // functionColsService.setPrimaryColList, functionColsService.updatePrimaryColList,
    // pivotResultColsService.setPivotResultCols
    public refreshCols(): void {
        if (!this.colDefCols) {
            return;
        }

        const prevColTree = this.cols?.tree;

        this.saveColOrder();

        this.selectCols();

        this.createAutoCols();
        this.addAutoCols();

        this.createControlCols();
        this.addControlCols();

        this.restoreColOrder();

        this.positionLockedCols();
        this.showRowGroupColsService?.refresh();
        this.quickFilterService?.refreshQuickFilterCols();

        this.setColSpanActive();
        this.setAutoHeightActive();

        // make sure any part of the gui that tries to draw, eg the header,
        // will get empty lists of columns rather than stale columns.
        // for example, the header will received gridColumnsChanged event, so will try and draw,
        // but it will draw successfully when it acts on the virtualColumnsChanged event
        this.visibleColsService.clear();
        this.columnViewportService.clear();

        const dispatchChangedEvent = !_areEqual(prevColTree, this.cols.tree);
        if (dispatchChangedEvent) {
            this.eventDispatcher.gridColumns();
        }
    }

    private selectCols(): void {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        this.showingPivotResult = pivotResultCols != null;

        if (pivotResultCols) {
            const { map, list, tree, treeDepth } = pivotResultCols;
            this.cols = {
                list: list.slice(),
                map: { ...map },
                tree: tree.slice(),
                treeDepth: treeDepth,
            };

            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            const hasSameColumns = pivotResultCols.list.some((col) => this.cols?.map[col.getColId()] !== undefined);
            if (!hasSameColumns) {
                this.lastPivotOrder = null;
            }
        } else {
            const { map, list, tree, treeDepth } = this.colDefCols;
            this.cols = {
                list: list.slice(),
                map: { ...map },
                tree: tree.slice(),
                treeDepth: treeDepth,
            };
        }
    }

    public getColsToShow(): AgColumn[] {
        // pivot mode is on, but we are not pivoting, so we only
        // show columns we are aggregating on

        const showAutoGroupAndValuesOnly = this.isPivotMode() && !this.isShowingPivotResult();
        const valueColumns = this.funcColsService.getValueColumns();

        const res = this.cols.list.filter((col) => {
            const isAutoGroupCol = isColumnGroupAutoCol(col);
            if (showAutoGroupAndValuesOnly) {
                const isValueCol = valueColumns && _includes(valueColumns, col);
                return isAutoGroupCol || isValueCol;
            } else {
                // keep col if a) it's auto-group or b) it's visible
                return isAutoGroupCol || col.isVisible();
            }
        });

        return res;
    }

    private addAutoCols(): void {
        if (this.autoCols == null) {
            return;
        }
        this.cols.list = this.autoCols.list.concat(this.cols.list);
        this.cols.tree = this.autoCols.tree.concat(this.cols.tree);
        updateColsMap(this.cols);
    }

    private createAutoCols(): void {
        const groupFullWidthRow = this.gos.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ? this.gos.get('pivotSuppressAutoColumn') : this.isSuppressAutoCol();

        const rowGroupCols = this.funcColsService.getRowGroupColumns();

        const groupingActive = rowGroupCols.length > 0 || this.gos.get('treeData');

        const noAutoCols = !groupingActive || suppressAutoColumn || groupFullWidthRow;

        const destroyPrevious = () => {
            if (this.autoCols) {
                destroyColumnTree(this.context, this.autoCols.tree);
                this.autoCols = null;
            }
        };

        // function
        if (noAutoCols || !this.autoColService) {
            destroyPrevious();
            return;
        }

        const list = this.autoColService.createAutoCols(rowGroupCols) ?? [];
        const autoColsSame = areColIdsEqual(list, this.autoCols?.list || null);

        // the new tree dept will equal the current tree dept of cols
        const newTreeDepth = this.cols.treeDepth;
        const oldTreeDepth = this.autoCols ? this.autoCols.treeDepth : -1;
        const treeDeptSame = oldTreeDepth == newTreeDepth;

        if (autoColsSame && treeDeptSame) {
            return;
        }

        destroyPrevious();
        const [tree, treeDepth] = this.columnFactory.createForAutoGroups(list, this.cols?.tree);
        this.autoCols = {
            list,
            tree,
            treeDepth,
            map: {},
        };

        const putAutocolsFirstInList = (cols: AgColumn[] | null): AgColumn[] | null => {
            if (!cols) {
                return null;
            }
            // we use colId, and not instance, to remove old autoGroupCols
            const colsFiltered = cols.filter((col) => !isColumnGroupAutoCol(col));
            return [...list, ...colsFiltered];
        };

        this.lastOrder = putAutocolsFirstInList(this.lastOrder);
        this.lastPivotOrder = putAutocolsFirstInList(this.lastPivotOrder);
    }

    private createControlCols(): void {
        const cols = this.controlColService?.createControlCols();
        if (cols) {
            this.controlCols = {
                list: cols,
                tree: cols,
                treeDepth: 1,
                map: Object.fromEntries(cols.map((c) => [c.getColId(), c])),
            };
        }
    }

    private addControlCols(): void {
        if (this.controlCols == null) {
            return;
        }
        this.cols.list = this.controlCols.list.concat(this.cols.list);
        this.cols.tree = this.controlCols.tree.concat(this.cols.tree);
        updateColsMap(this.cols);
    }

    // on events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'
    private refreshAll(source: ColumnEventType) {
        if (!this.isReady()) {
            return;
        }
        this.refreshCols();
        this.visibleColsService.refresh(source);
    }

    public setColsVisible(keys: (string | AgColumn)[], visible = false, source: ColumnEventType): void {
        this.columnApplyStateService.applyColumnState(
            {
                state: keys.map<ColumnState>((key) => ({
                    colId: typeof key === 'string' ? key : key.getColId(),
                    hide: !visible,
                })),
            },
            source
        );
    }

    public setColsPinned(keys: Maybe<ColKey>[], pinned: ColumnPinnedType, source: ColumnEventType): void {
        if (!this.cols) {
            return;
        }
        if (_missingOrEmpty(keys)) {
            return;
        }

        if (this.gos.isDomLayout('print')) {
            _warnOnce(`Changing the column pinning status is not allowed with domLayout='print'`);
            return;
        }

        this.columnAnimationService.start();

        let actualPinned: ColumnPinnedType;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        } else if (pinned === 'right') {
            actualPinned = 'right';
        } else {
            actualPinned = null;
        }

        const updatedCols: AgColumn[] = [];

        keys.forEach((key) => {
            if (!key) {
                return;
            }
            const column = this.getCol(key);
            if (!column) {
                return;
            }

            if (column.getPinned() !== actualPinned) {
                column.setPinned(actualPinned);
                updatedCols.push(column);
            }
        });

        if (updatedCols.length) {
            this.visibleColsService.refresh(source);
            this.eventDispatcher.columnPinned(updatedCols, source);
        }

        this.columnAnimationService.finish();
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(
        key: AgProvidedColumnGroup | string | null,
        newValue: boolean,
        source: ColumnEventType
    ): void {
        let keyAsString: string;

        if (isProvidedColumnGroup(key)) {
            keyAsString = key.getId();
        } else {
            keyAsString = key || '';
        }
        this.columnGroupStateService.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    }

    public getProvidedColGroup(key: string): AgProvidedColumnGroup | null {
        let res: AgProvidedColumnGroup | null = null;

        depthFirstOriginalTreeSearch(null, this.cols?.tree, (node) => {
            if (isProvidedColumnGroup(node)) {
                if (node.getId() === key) {
                    res = node;
                }
            }
        });

        return res;
    }

    public isColGroupLocked(column: AgColumn): boolean {
        const groupLockGroupColumns = this.gos.get('groupLockGroupColumns');
        if (!column.isRowGroupActive() || groupLockGroupColumns === 0) {
            return false;
        }

        if (groupLockGroupColumns === -1) {
            return true;
        }

        const rowGroupCols = this.funcColsService.getRowGroupColumns();
        const colIndex = rowGroupCols.findIndex((groupCol) => groupCol.getColId() === column.getColId());
        return groupLockGroupColumns > colIndex;
    }

    public isSuppressAutoCol() {
        const groupDisplayType = this.gos.get('groupDisplayType');
        const isCustomRowGroups = groupDisplayType === 'custom';
        if (isCustomRowGroups) {
            return true;
        }

        const treeDataDisplayType = this.gos.get('treeDataDisplayType');
        return treeDataDisplayType === 'custom';
    }

    private setAutoHeightActive(): void {
        this.autoHeightActive = this.cols.list.some((col) => col.isVisible() && col.isAutoHeight());

        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;

            const supportedRowModel = this.gos.isRowModelType('clientSide') || this.gos.isRowModelType('serverSide');
            if (!supportedRowModel) {
                _warnOnce('autoHeight columns only work with Client Side Row Model and Server Side Row Model.');
            }
        }
    }

    private restoreColOrder(): void {
        const lastOrder = this.showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        if (!lastOrder) {
            return;
        }

        const lastOrderMapped = new Map<AgColumn, number>(lastOrder.map((col, index) => [col, index]));

        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from pivot result cols to provided columns
        const noColsFound = !this.cols.list.some((col) => lastOrderMapped.has(col));
        if (noColsFound) {
            return;
        }

        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        const colsMap = new Map<AgColumn, boolean>(this.cols.list.map((col) => [col, true]));
        const lastOrderFiltered = lastOrder.filter((col) => colsMap.has(col));
        const lastOrderFilteredMap = new Map<AgColumn, boolean>(lastOrderFiltered.map((col) => [col, true]));
        const missingFromLastOrder = this.cols.list.filter((col) => !lastOrderFilteredMap.has(col));

        // add in the new columns, at the end (if no group), or at the end of the group (if a group)
        const res = lastOrderFiltered.slice();

        missingFromLastOrder.forEach((newCol) => {
            let parent = newCol.getOriginalParent();

            // if no parent, means we are not grouping, so add the column to the end
            if (!parent) {
                res.push(newCol);
                return;
            }

            // find the group the column belongs to. if no siblings at the current level (eg col in group on it's
            // own) then go up one level and look for siblings there.
            const siblings: AgColumn[] = [];
            while (!siblings.length && parent) {
                const leafCols = parent.getLeafColumns();
                leafCols.forEach((leafCol) => {
                    const presentInNewCols = res.indexOf(leafCol) >= 0;
                    const notYetInSiblings = siblings.indexOf(leafCol) < 0;
                    if (presentInNewCols && notYetInSiblings) {
                        siblings.push(leafCol);
                    }
                });
                parent = parent.getOriginalParent();
            }

            // if no siblings exist at any level, this means the col is in a group (or parent groups) on it's own
            if (!siblings.length) {
                res.push(newCol);
                return;
            }

            // find index of last column in the group
            const indexes = siblings.map((col) => res.indexOf(col));
            const lastIndex = Math.max(...indexes);

            _insertIntoArray(res, newCol, lastIndex + 1);
        });

        this.cols.list = res;
    }

    private orderColsLikeColDefCols(): void {
        if (!this.colDefCols || !this.cols) {
            return;
        }

        const colsOrdered = this.colDefCols.list.filter((col) => this.cols.list.indexOf(col) >= 0);
        const otherCols = this.cols.list.filter((col) => colsOrdered.indexOf(col) < 0);

        this.cols.list = [...otherCols, ...colsOrdered];
        this.cols.list = this.columnMoveService.placeLockedColumns(this.cols.list);
    }

    public sortColsLikeKeys(colIds: string[]): void {
        if (this.cols == null) {
            return;
        }

        let newOrder: AgColumn[] = [];
        const processedColIds: { [id: string]: boolean } = {};

        colIds.forEach((colId) => {
            if (processedColIds[colId]) {
                return;
            }
            const col = this.cols.map[colId];
            if (col) {
                newOrder.push(col);
                processedColIds[colId] = true;
            }
        });

        // add in all other columns
        let autoGroupInsertIndex = 0;
        this.cols.list.forEach((col) => {
            const colId = col.getColId();
            const alreadyProcessed = processedColIds[colId] != null;
            if (alreadyProcessed) {
                return;
            }

            const isAutoGroupCol = colId.startsWith(GROUP_AUTO_COLUMN_ID);
            if (isAutoGroupCol) {
                // auto group columns, if missing from state list, are added to the start.
                // it's common to have autoGroup missing, as grouping could be on by default
                // on a column, but the user could of since removed the grouping via the UI.
                // if we don't inc the insert index, autoGroups will be inserted in reverse order
                _insertIntoArray(newOrder, col, autoGroupInsertIndex++);
            } else {
                // normal columns, if missing from state list, are added at the end
                newOrder.push(col);
            }
        });

        // this is already done in updateCols, however we changed the order above (to match the order of the state
        // columns) so we need to do it again. we could of put logic into the order above to take into account fixed
        // columns, however if we did then we would have logic for updating fixed columns twice. reusing the logic here
        // is less sexy for the code here, but it keeps consistency.
        newOrder = this.columnMoveService.placeLockedColumns(newOrder);

        if (!this.columnMoveService.doesMovePassMarryChildren(newOrder)) {
            _warnOnce(
                'Applying column order broke a group where columns should be married together. Applying new order has been discarded.'
            );
            return;
        }

        this.cols.list = newOrder;
    }

    // returns the provided cols sorted in same order as they appear in this.cols, eg if this.cols
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    public sortColsLikeCols(cols: AgColumn[]): void {
        if (!cols || cols.length <= 1) {
            return;
        }

        const notAllColsPresent = cols.filter((c: AgColumn) => this.cols.list.indexOf(c) < 0).length > 0;
        if (notAllColsPresent) {
            return;
        }

        cols.sort((a: AgColumn, b: AgColumn) => {
            const indexA = this.cols.list.indexOf(a);
            const indexB = this.cols.list.indexOf(b);
            return indexA - indexB;
        });
    }

    public resetColDefIntoCol(column: AgColumn, source: ColumnEventType): boolean {
        const userColDef = column.getUserProvidedColDef();
        if (!userColDef) {
            return false;
        }
        const newColDef = this.columnFactory.addColumnDefaultAndTypes(userColDef, column.getColId());
        column.setColDef(newColDef, userColDef, source);
        return true;
    }

    public queueResizeOperations(): void {
        this.shouldQueueResizeOperations = true;
    }

    public isShouldQueueResizeOperations(): boolean {
        return this.shouldQueueResizeOperations;
    }

    public processResizeOperations(): void {
        this.shouldQueueResizeOperations = false;
        this.resizeOperationQueue.forEach((resizeOperation) => resizeOperation());
        this.resizeOperationQueue = [];
    }

    public pushResizeOperation(func: () => void): void {
        this.resizeOperationQueue.push(func);
    }

    public moveInCols(movedColumns: AgColumn[], toIndex: number, source: ColumnEventType): void {
        _moveInArray(this.cols?.list, movedColumns, toIndex);
        this.visibleColsService.refresh(source);
    }

    private positionLockedCols(): void {
        this.cols.list = this.columnMoveService.placeLockedColumns(this.cols.list);
    }

    private saveColOrder(): void {
        if (this.showingPivotResult) {
            this.lastPivotOrder = this.cols?.list;
        } else {
            this.lastOrder = this.cols?.list;
        }
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        if (!this.colDefCols) {
            return;
        }

        const cols = this.colDefCols.list.slice();

        if (this.showingPivotResult) {
            cols.sort((a: AgColumn, b: AgColumn) => this.lastOrder!.indexOf(a) - this.lastOrder!.indexOf(b));
        } else if (this.lastOrder) {
            cols.sort((a: AgColumn, b: AgColumn) => this.cols.list.indexOf(a) - this.cols.list.indexOf(b));
        }

        const rowGroupColumns = this.funcColsService.getRowGroupColumns();
        const pivotColumns = this.funcColsService.getPivotColumns();

        return this.columnDefFactory.buildColumnDefs(cols, rowGroupColumns, pivotColumns);
    }

    public isShowingPivotResult(): boolean {
        return this.showingPivotResult;
    }

    // called by clientSideRowModel.refreshModel
    public isChangeEventsDispatching(): boolean {
        return this.changeEventsDispatching;
    }

    public isColSpanActive(): boolean {
        return this.colSpanActive;
    }

    // used by Column Tool Panel
    public isProvidedColGroupsPresent(): boolean {
        return this.colDefCols?.treeDepth > 0;
    }

    private setColSpanActive(): void {
        this.colSpanActive = this.cols.list.some((col) => col.getColDef().colSpan != null);
    }

    public isAutoRowHeightActive(): boolean {
        return this.autoHeightActive;
    }

    public wasAutoRowHeightEverActive(): boolean {
        return this.autoHeightActiveAtLeastOnce;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.cols ? this.cols.treeDepth + 1 : -1;
    }

    public isReady(): boolean {
        return this.ready;
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode || !this.isPivotSettingAllowed(this.pivotMode)) {
            return;
        }

        this.pivotMode = pivotMode;

        if (!this.ready) {
            return;
        }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateCols() to check it autoGroupCol needs to be added / removed
        this.refreshCols();
        this.visibleColsService.refresh(source);

        this.eventDispatcher.pivotModeChanged();
    }

    private isPivotSettingAllowed(pivot: boolean): boolean {
        if (pivot && this.gos.get('treeData')) {
            _warnOnce('Pivot mode not available with treeData.');
            return false;
        }

        return true;
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.funcColsService.getPivotColumns();
        return this.pivotMode && !_missingOrEmpty(pivotColumns);
    }

    // called when dataTypes change
    public recreateColumnDefs(source: ColumnEventType): void {
        if (!this.cols) {
            return;
        }

        // if we aren't going to force, update the auto cols in place
        if (this.autoCols) {
            this.autoColService!.updateAutoCols(this.autoCols.list, source);
        }
        this.createColsFromColDefs(true, source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        const colsPreviouslyExisted = !!this.colDefs;
        this.colDefs = columnDefs;
        this.createColsFromColDefs(colsPreviouslyExisted, source);
    }

    public override destroy(): void {
        destroyColumnTree(this.context, this.colDefCols?.tree);
        destroyColumnTree(this.context, this.autoCols?.tree);
        super.destroy();
    }

    public getColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.cols.tree;
    }

    // + columnSelectPanel
    public getColDefColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.colDefCols.tree;
    }

    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getColDefCols(): AgColumn[] | null {
        return this.colDefCols?.list ? this.colDefCols.list : null;
    }

    // + moveColumnController
    public getCols(): AgColumn[] {
        return this.cols?.list ?? [];
    }

    // returns colDefCols, pivotResultCols and autoCols
    public getAllCols(): AgColumn[] {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        const pivotResultColsList = pivotResultCols?.list;
        return ([] as AgColumn[]).concat(
            ...[this.colDefCols?.list || [], this.autoCols?.list || [], pivotResultColsList || []]
        );
    }

    public getColsForKeys(keys: ColKey[]): AgColumn[] {
        if (!keys) {
            return [];
        }
        const res = keys.map((key) => this.getCol(key)).filter((col) => col != null);
        return res as AgColumn[];
    }

    public getColDefCol(key: ColKey): AgColumn | null {
        if (!this.colDefCols?.list) {
            return null;
        }
        return this.getColFromCollection(key, this.colDefCols);
    }

    public getCol(key: Maybe<ColKey>): AgColumn | null {
        if (key == null) {
            return null;
        }
        return this.getColFromCollection(key, this.cols);
    }

    public getColFromCollection(key: ColKey, cols: ColumnCollections): AgColumn | null {
        if (cols == null) {
            return null;
        }

        const { map, list } = cols;

        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && map[key]) {
            return map[key];
        }

        for (let i = 0; i < list.length; i++) {
            if (columnsMatch(list[i], key)) {
                return list[i];
            }
        }

        return this.getAutoCol(key);
    }

    public getAutoCol(key: ColKey): AgColumn | null {
        if (this.autoCols == null) return null;
        return this.autoCols.list.find((groupCol) => columnsMatch(groupCol, key)) || null;
    }

    public getAutoCols(): AgColumn[] | null {
        return this.autoCols?.list || null;
    }

    public setColHeaderHeight(col: AgColumn | AgColumnGroup, height: number): void {
        const changed = col.setAutoHeaderHeight(height);

        if (changed) {
            if (col.isColumn) {
                this.eventDispatcher.headerHeight(col);
            } else {
                this.eventDispatcher.groupHeaderHeight(col);
            }
        }
    }

    public getGroupRowsHeight(): number[] {
        const heights: number[] = [];
        const headerRowContainerCtrls = this.ctrlsService.getHeaderRowContainerCtrls();

        for (const headerRowContainerCtrl of headerRowContainerCtrls) {
            if (!headerRowContainerCtrl) {
                continue;
            }

            const groupRowCount = headerRowContainerCtrl.getGroupRowCount() || 0;

            for (let i = 0; i < groupRowCount; i++) {
                const headerRowCtrl = headerRowContainerCtrl.getGroupRowCtrlAtIndex(i);

                const currentHeightAtPos = heights[i];
                if (headerRowCtrl) {
                    const newHeight = this.getColumnGroupHeaderRowHeight(headerRowCtrl);
                    if (currentHeightAtPos == null || newHeight > currentHeightAtPos) {
                        heights[i] = newHeight;
                    }
                }
            }
        }

        return heights;
    }

    private getColumnGroupHeaderRowHeight(headerRowCtrl: HeaderRowCtrl): number {
        const defaultHeight: number = (
            this.isPivotMode() ? this.getPivotGroupHeaderHeight() : this.getGroupHeaderHeight()
        ) as number;

        let displayedHeights = 0;
        const headerRowCellCtrls = headerRowCtrl.getHeaderCtrls() as HeaderGroupCellCtrl[];
        for (const headerCellCtrl of headerRowCellCtrls) {
            const column = headerCellCtrl.getColumn();
            if (column.isAutoHeaderHeight()) {
                const height = column.getAutoHeaderHeight();
                if (height != null && height > displayedHeights) {
                    displayedHeights = height;
                }
            }
        }

        return Math.max(defaultHeight, displayedHeights);
    }

    public getColumnHeaderRowHeight(): number {
        const defaultHeight: number = (
            this.isPivotMode() ? this.getPivotHeaderHeight() : this.getHeaderHeight()
        ) as number;

        const allDisplayedCols = this.visibleColsService.getAllCols();

        const displayedHeights = allDisplayedCols
            .filter((col) => col.isAutoHeaderHeight())
            .map((col) => col.getAutoHeaderHeight() || 0);

        return Math.max(defaultHeight, ...displayedHeights);
    }

    public getHeaderHeight(): number {
        return this.gos.get('headerHeight') ?? this.environment.getDefaultHeaderHeight();
    }
    public getFloatingFiltersHeight(): number {
        return this.gos.get('floatingFiltersHeight') ?? this.getHeaderHeight();
    }
    public getGroupHeaderHeight(): number {
        return this.gos.get('groupHeaderHeight') ?? this.getHeaderHeight();
    }
    private getPivotHeaderHeight(): number {
        return this.gos.get('pivotHeaderHeight') ?? this.getHeaderHeight();
    }
    public getPivotGroupHeaderHeight(): number {
        return this.gos.get('pivotGroupHeaderHeight') ?? this.getGroupHeaderHeight();
    }

    private onFirstDataRendered(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (autoSizeStrategy?.type !== 'fitCellContents') {
            return;
        }

        const { colIds: columns, skipHeader } = autoSizeStrategy;
        // ensure render has finished
        setTimeout(() => {
            if (columns) {
                this.columnAutosizeService.autoSizeCols({
                    colKeys: columns,
                    skipHeader,
                    source: 'autosizeColumns',
                });
            } else {
                this.columnAutosizeService.autoSizeAllColumns('autosizeColumns', skipHeader);
            }
        });
    }

    private onAutoGroupColumnDefChanged(source: ColumnEventType) {
        if (this.autoCols) {
            this.autoColService!.updateAutoCols(this.autoCols.list, source);
        }
    }
}

export function convertSourceType(source: PropertyChangedSource): ColumnEventType {
    // unfortunately they do not match so need to perform conversion
    return source === 'gridOptionsUpdated' ? 'gridOptionsChanged' : source;
}

function updateColsMap(cols: ColumnCollections): void {
    cols.map = {};
    cols.list.forEach((col) => (cols.map[col.getId()] = col));
}

function columnsMatch(column: AgColumn, key: ColKey): boolean {
    const columnMatches = column === key;
    const colDefMatches = column.getColDef() === key;
    const idMatches = column.getColId() == key;

    return columnMatches || colDefMatches || idMatches;
}

function areColIdsEqual(colsA: AgColumn[] | null, colsB: AgColumn[] | null): boolean {
    return _areEqual(colsA, colsB, (a, b) => a.getColId() === b.getColId());
}
