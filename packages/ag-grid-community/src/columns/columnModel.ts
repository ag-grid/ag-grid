import type { ColumnAutosizeService } from '../columnAutosize/columnAutosizeService';
import { doesMovePassMarryChildren, placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, Context } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { Environment } from '../environment';
import type { ColumnEventType } from '../events';
import type { QuickFilterService } from '../filter/quickFilterService';
import type { PropertyChangedSource } from '../gridOptionsService';
import {
    _getCheckboxes,
    _getHeaderCheckbox,
    _isDomLayout,
    _isGroupUseEntireRow,
    _shouldMaintainColumnOrder,
} from '../gridOptionsUtils';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { HeaderRowCtrl } from '../headerRendering/row/headerRowCtrl';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { IColsService } from '../interfaces/iColsService';
import type { Column, ColumnPinnedType } from '../interfaces/iColumn';
import type { IPivotResultColsService } from '../interfaces/iPivotResultColsService';
import type { IShowRowGroupColsService } from '../interfaces/iShowRowGroupColsService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _areEqual, _includes, _insertIntoArray, _moveInArray } from '../utils/array';
import { _missingOrEmpty } from '../utils/generic';
import { _warn } from '../validation/logging';
import type { ValueCache } from '../valueService/valueCache';
import type { ColumnDefFactory } from './columnDefFactory';
import { dispatchColumnPinnedEvent } from './columnEventUtils';
import type { ColumnFactory } from './columnFactory';
import { depthFirstOriginalTreeSearch } from './columnFactory';
import type { ColumnState, ColumnStateService } from './columnStateService';
import { GROUP_AUTO_COLUMN_ID, _destroyColumnTree, _getColumnsFromTree, isColumnGroupAutoCol } from './columnUtils';
import type { ColumnViewportService } from './columnViewportService';
import type { ControlsColService } from './controlsColService';
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
    private visibleColsService: VisibleColsService;
    private columnViewportService: ColumnViewportService;
    private pivotResultColsService?: IPivotResultColsService;
    private columnAnimationService?: ColumnAnimationService;
    private autoColService?: IAutoColService;
    private controlsColService?: ControlsColService;
    private valueCache?: ValueCache;
    private columnDefFactory?: ColumnDefFactory;
    private columnStateService: ColumnStateService;
    private columnAutosizeService?: ColumnAutosizeService;
    private valueColsService?: IColsService;
    private rowGroupColsService?: IColsService;
    private pivotColsService?: IColsService;
    private quickFilterService?: QuickFilterService;
    private showRowGroupColsService?: IShowRowGroupColsService;
    private environment: Environment;

    public wireBeans(beans: BeanCollection): void {
        this.context = beans.context;
        this.ctrlsService = beans.ctrlsService;
        this.columnFactory = beans.columnFactory;
        this.visibleColsService = beans.visibleColsService;
        this.columnViewportService = beans.columnViewportService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.columnAnimationService = beans.columnAnimationService;
        this.autoColService = beans.autoColService;
        this.controlsColService = beans.controlsColService;
        this.valueCache = beans.valueCache;
        this.columnDefFactory = beans.columnDefFactory;
        this.columnStateService = beans.columnStateService;
        this.columnAutosizeService = beans.columnAutosizeService;
        this.valueColsService = beans.valueColsService;
        this.rowGroupColsService = beans.rowGroupColsService;
        this.pivotColsService = beans.pivotColsService;
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

    // control element columns
    private controlsCols: ColumnCollections | null;

    // [providedCols OR pivotResultCols] PLUS autoGroupCols PLUS controlsCols
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
        this.pivotMode = this.gos.get('pivotMode');

        this.addManagedPropertyListeners(
            ['groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'],
            (event) => this.refreshAll(convertSourceType(event.source))
        );
        this.addManagedPropertyListener('rowSelection', (event) => {
            this.onSelectionOptionsChanged(event.currentValue, event.previousValue, convertSourceType(event.source));
        });
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
    }

    // called from SyncService, when grid has finished initialising
    private createColsFromColDefs(source: ColumnEventType): void {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = this.colDefs
            ? this.columnStateService.compareColumnStatesAndDispatchEvents(source)
            : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache?.expire();

        const oldCols = this.colDefCols?.list;
        const oldTree = this.colDefCols?.tree;
        const newTree = this.columnFactory.createColumnTree(this.colDefs, true, oldTree, source);

        _destroyColumnTree(this.context, this.colDefCols?.tree, newTree.columnTree);

        const tree = newTree.columnTree;
        const treeDepth = newTree.treeDept;
        const list = _getColumnsFromTree(tree);
        const map: { [id: string]: AgColumn } = {};

        list.forEach((col) => (map[col.getId()] = col));

        this.colDefCols = { tree, treeDepth, list, map };

        this.rowGroupColsService?.extractCols(source, oldCols);
        this.pivotColsService?.extractCols(source, oldCols);
        this.valueColsService?.extractCols(source, oldCols);

        this.ready = true;

        this.refreshCols(true);

        this.visibleColsService.refresh(source);
        this.columnViewportService.checkViewportColumns();

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.eventService.dispatchEvent({
            type: 'columnEverythingChanged',
            source,
        });

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            dispatchEventsFunc();
            this.changeEventsDispatching = false;
        }

        this.eventService.dispatchEvent({
            type: 'newColumnsLoaded',
            source,
        });

        if (source === 'gridInitializing') {
            this.columnAutosizeService?.applyAutosizeStrategy();
        }
    }

    // called from: buildAutoGroupColumns (events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents')
    // createColsFromColDefs (recreateColumnDefs, setColumnsDefs),
    // setPivotMode, applyColumnState,
    // functionColsService.setPrimaryColList, functionColsService.updatePrimaryColList,
    // pivotResultColsService.setPivotResultCols
    public refreshCols(newColDefs: boolean): void {
        if (!this.colDefCols) {
            return;
        }

        const prevColTree = this.cols?.tree;

        this.saveColOrder();

        this.selectCols();

        this.createAutoCols();
        this.addAutoCols();

        this.createControlsCols();
        this.addControlsCols();

        const shouldSortNewColDefs = _shouldMaintainColumnOrder(this.gos, this.showingPivotResult);
        if (!newColDefs || shouldSortNewColDefs) {
            this.restoreColOrder();
        }

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
            this.eventService.dispatchEvent({
                type: 'gridColumnsChanged',
            });
        }
    }

    private selectCols(): void {
        const pivotResultCols = this.pivotResultColsService?.getPivotResultCols() ?? null;
        this.showingPivotResult = pivotResultCols != null;

        const { map, list, tree, treeDepth } = pivotResultCols ?? this.colDefCols;
        this.cols = {
            list: list.slice(),
            map: { ...map },
            tree: tree.slice(),
            treeDepth,
        };

        if (pivotResultCols) {
            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            const hasSameColumns = pivotResultCols.list.some((col) => this.cols?.map[col.getColId()] !== undefined);
            if (!hasSameColumns) {
                this.lastPivotOrder = null;
            }
        }
    }

    public getColsToShow(): AgColumn[] {
        // pivot mode is on, but we are not pivoting, so we only
        // show columns we are aggregating on

        const showAutoGroupAndValuesOnly = this.isPivotMode() && !this.isShowingPivotResult();
        const valueColumns = this.valueColsService?.columns ?? [];

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
        const groupFullWidthRow = _isGroupUseEntireRow(this.gos, this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ? this.gos.get('pivotSuppressAutoColumn') : this.isSuppressAutoCol();

        const rowGroupCols = this.rowGroupColsService?.columns ?? [];

        const groupingActive = rowGroupCols.length > 0 || this.gos.get('treeData');

        const noAutoCols = !groupingActive || suppressAutoColumn || groupFullWidthRow;

        const destroyPrevious = () => {
            if (this.autoCols) {
                _destroyColumnTree(this.context, this.autoCols.tree);
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
        const [tree, treeDepth] = this.columnFactory.balanceTreeForAutoCols(list, this.cols.tree);
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

    private createControlsCols(): void {
        const destroyCollection = () => {
            _destroyColumnTree(this.context, this.controlsCols?.tree);
            this.controlsCols = null;
        };

        if (!this.controlsColService) {
            destroyCollection();
        }

        // the new tree dept will equal the current tree dept of cols
        const newTreeDepth = this.cols.treeDepth;
        const oldTreeDepth = this.controlsCols?.treeDepth ?? -1;
        const treeDeptSame = oldTreeDepth == newTreeDepth;

        const list = this.controlsColService?.createControlsCols() ?? [];
        const areSame = areColIdsEqual(list, this.controlsCols?.list ?? []);

        if (areSame && treeDeptSame) {
            return;
        }

        destroyCollection();
        const [tree, treeDepth] = this.columnFactory.balanceTreeForAutoCols(list, this.cols.tree);
        this.controlsCols = {
            list,
            tree,
            treeDepth,
            map: {},
        };

        this.lastOrder = this.controlsColService?.putControlColsFirstInList(list, this.lastOrder) ?? null;
        this.lastPivotOrder = this.controlsColService?.putControlColsFirstInList(list, this.lastPivotOrder) ?? null;
    }

    private addControlsCols(): void {
        if (this.controlsCols == null) {
            return;
        }
        this.cols.list = this.controlsCols.list.concat(this.cols.list);
        this.cols.tree = this.controlsCols.tree.concat(this.cols.tree);
        updateColsMap(this.cols);
    }

    // on events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'
    private refreshAll(source: ColumnEventType) {
        if (!this.isReady()) {
            return;
        }
        this.refreshCols(false);
        this.visibleColsService.refresh(source);
    }

    public setColsVisible(keys: (string | AgColumn)[], visible = false, source: ColumnEventType): void {
        this.columnStateService.applyColumnState(
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

        if (_isDomLayout(this.gos, 'print')) {
            _warn(37);
            return;
        }

        this.columnAnimationService?.start();

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
            dispatchColumnPinnedEvent(this.eventService, updatedCols, source);
        }

        this.columnAnimationService?.finish();
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
        this.columnStateService.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
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

        const rowGroupCols = this.rowGroupColsService?.columns ?? [];
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
        newOrder = placeLockedColumns(newOrder, this.gos);

        if (!doesMovePassMarryChildren(newOrder, this.getColTree())) {
            _warn(39);
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

        const notAllColsPresent = cols.filter((c) => this.cols.list.indexOf(c) < 0).length > 0;
        if (notAllColsPresent) {
            return;
        }

        cols.sort((a, b) => {
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
        this.cols.list = placeLockedColumns(this.cols.list, this.gos);
    }

    private saveColOrder(): void {
        if (this.showingPivotResult) {
            this.lastPivotOrder = this.cols?.list;
        } else {
            this.lastOrder = this.cols?.list;
        }
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        return this.colDefCols
            ? this.columnDefFactory?.getColumnDefs(
                  this.colDefCols.list,
                  this.showingPivotResult,
                  this.lastOrder,
                  this.cols.list
              )
            : undefined;
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
        if (pivotMode === this.pivotMode) {
            return;
        }

        this.pivotMode = pivotMode;

        if (!this.ready) {
            return;
        }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateCols() to check it autoGroupCol needs to be added / removed
        this.refreshCols(false);
        this.visibleColsService.refresh(source);

        this.eventService.dispatchEvent({
            type: 'columnPivotModeChanged',
        });
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.pivotColsService?.columns ?? [];
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
        this.createColsFromColDefs(source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        this.colDefs = columnDefs;
        this.createColsFromColDefs(source);
    }

    public override destroy(): void {
        _destroyColumnTree(this.context, this.colDefCols?.tree);
        _destroyColumnTree(this.context, this.autoCols?.tree);
        _destroyColumnTree(this.context, this.controlsCols?.tree);
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
        const pivotResultColsList = this.pivotResultColsService?.getPivotResultCols()?.list;
        return [
            this.colDefCols?.list ?? [],
            this.autoCols?.list ?? [],
            this.controlsCols?.list ?? [],
            pivotResultColsList ?? [],
        ].flat();
    }

    public getColsForKeys(keys: ColKey[]): AgColumn[] {
        if (!keys) {
            return [];
        }
        return keys.map((key) => this.getCol(key)).filter((col): col is AgColumn => col != null);
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
        return this.autoCols?.list.find((groupCol) => columnsMatch(groupCol, key)) ?? null;
    }

    public getAutoCols(): AgColumn[] | null {
        return this.autoCols?.list ?? null;
    }

    public setColHeaderHeight(col: AgColumn | AgColumnGroup, height: number): void {
        const changed = col.setAutoHeaderHeight(height);

        if (changed) {
            if (col.isColumn) {
                this.eventService.dispatchEvent({
                    type: 'columnHeaderHeightChanged',
                    column: col,
                    columns: [col],
                    source: 'autosizeColumnHeaderHeight',
                });
            } else {
                this.eventService.dispatchEvent({
                    type: 'columnGroupHeaderHeightChanged',
                    columnGroup: col,
                    source: 'autosizeColumnGroupHeaderHeight',
                });
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

        const allDisplayedCols = this.visibleColsService.allCols;

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

    private onAutoGroupColumnDefChanged(source: ColumnEventType) {
        if (this.autoCols) {
            this.autoColService!.updateAutoCols(this.autoCols.list, source);
        }
    }

    private onSelectionOptionsChanged(
        current: GridOptions['rowSelection'],
        prev: GridOptions['rowSelection'],
        source: ColumnEventType
    ) {
        const prevCheckbox = prev && typeof prev !== 'string' ? _getCheckboxes(prev) : undefined;
        const currCheckbox = current && typeof current !== 'string' ? _getCheckboxes(current) : undefined;
        const checkboxHasChanged = prevCheckbox !== currCheckbox;

        const prevHeaderCheckbox = prev && typeof prev !== 'string' ? _getHeaderCheckbox(prev) : undefined;
        const currHeaderCheckbox = current && typeof current !== 'string' ? _getHeaderCheckbox(current) : undefined;
        const headerCheckboxHasChanged = prevHeaderCheckbox !== currHeaderCheckbox;

        if (checkboxHasChanged || headerCheckboxHasChanged) {
            this.refreshAll(source);
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
