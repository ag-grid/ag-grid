import type { AgEvent } from 'ag-stack';
import { _areEqual, _pushToMapArray } from 'ag-stack';

import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEvent, ColumnEventType, ColumnStateUpdatedEvent } from '../events';
import { _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import type { ColumnChangedEventType } from '../interfaces/iColsService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { RowModelChange } from '../interfaces/iRowModel';
import { _mergedEqual } from '../utils/mergeDeep';
import { _createUserColumn } from './colDefUtils';
import { applyPrevColumnsOrder } from './colsApplyPrevOrder';
import { ColWrapperCache } from './columnGroups/colWrapperCache';
import type { ColumnStateChanges } from './columnStateUtils';
import {
    applyColDefStateToCols,
    captureColumnStateChanges,
    dispatchColStateChanges,
    dispatchColumnMoved,
} from './columnStateUtils';
import type { ColumnTreeBuild } from './columnTree/columnTreeBuilder';
import { _buildColumnTree, _finalizeColumnTree } from './columnTree/columnTreeBuilder';
import { GROUP_HIERARCHY_COLUMN_ID_PREFIX, _convertColumnEventSourceType, _destroyColumnTreeAll } from './columnUtils';
import { _finishColumnWidthAnimation, _setColumnWidthAnimation } from './columnWidthAnimation';

// Two parallel col representations:
//   colDefList / colDefTree  — PRIMARY cols (user-defined leaves + hierarchy virtuals).
//   colsList   / colsTree    — DISPLAY cols: [serviceCols, ...colDefList] (or pivot result).

/** A column or provided column group whose events a column update queues. */
export interface QueuedEventOwner {
    /** Its last entry in the queue, or a stale index into an emptied one; never negative, to read in bounds. */
    lastQueuedEventAt: number;
    raiseQueuedEvent(event: AgEvent<string>): void;
}
type QueuedColEvents = (QueuedEventOwner | AgEvent<string> | number)[];

/** A build asked for during another, run by the outermost {@link ColumnModel.endColUpdate}. */
interface PendingColBuild {
    source: ColumnEventType;
    newColDefs: boolean;
    defaultsChanged: boolean;
    resetOrder: boolean;
}

/** The options {@link ColumnModel.onColumnOptionsChanged} applies. */
const COLUMN_OPTIONS: (keyof GridOptions)[] = [
    'columnDefs',
    'pivotMode',
    'groupDisplayType',
    'treeData',
    'treeDataDisplayType',
    'groupHideOpenParents',
    'groupHideColumnsUntilExpanded',
    'hidePaddedHeaderRows',
    'dataTypeDefinitions',
    'defaultColDef',
    'defaultColGroupDef',
    'columnTypes',
    'suppressFieldDotNotation',
    'autoGroupColumnDef',
    'selectionColumnDef',
    'rowSelection',
    'rowNumbers',
    'cellSelection',
    'calculatedColumns',
];
const COLUMN_OPTION_SET: ReadonlySet<keyof GridOptions> = new Set(COLUMN_OPTIONS);

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    public pivotMode = false;
    public ready = false;
    public showingPivotResult = false;

    /** Set when a staged change needs a display rebuild; consumed (cleared) once by {@link performRefresh}. */
    private pendingRefresh = false;
    /** The source of the legacy `columnEverythingChanged` an update owes, raised once with its layout events. */
    private pendingEverythingSource: ColumnEventType | null = null;
    /** The source of the first change staged in an update, which its flush reports. */
    private pendingChangesSource: ColumnEventType | null = null;
    /** True while {@link buildFromColDefs} builds the tree and refreshes from it: a build asked for then is staged. */
    private buildingCols = false;
    /** Requests merged while a build runs, flags OR-ed, first source kept; never silent, as its caller raised early. */
    private pendingBuild: PendingColBuild | null = null;
    public colsList: AgColumn[] = [];
    public colsTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colsTreeDepth = 0;
    public colDefList: AgColumn[] = [];
    /** Invalidation key for anything memoised off the colDefs. Mutating a live colDef in place doesn't register. */
    public colDefsVersion = 0;
    /** Bumped when `colsList` is reordered outside a refresh (a move, a state order). */
    public colsMovedVersion = 0;
    /** Bumped when the `accentedSort` grid option changes to an unequal value, so columns rebuild their string comparator. */
    public accentedSortVersion = 0;
    /** >0 between {@link beginColUpdate} and {@link endColUpdate}, queueing the column events raised and deferring the
     *  role changes staged. */
    public colUpdateDepth = 0;
    /** Whether the open update holds the column move animation window ({@link animateColUpdate}). */
    private animatingColUpdate = false;
    /** Whether the open update holds the column width animation window ({@link animateColWidths}). */
    private animatingColWidths = false;
    /** The displayed order as the width window opened, when a reorder must drop its transition. */
    private orderBeforeWidthAnimation: AgColumn[] | null = null;
    /** The earliest state snapshot of the open update's column state applies, compared once the rows refreshed. */
    private columnsMovedCheck: { source: ColumnEventType; changes: ColumnStateChanges } | null = null;
    /** What the rows have not refreshed for; each refresh takes it, so a change the refresh raises joins the next. */
    public rowsChange: RowModelChange = newRowModelChange();
    /** Each queued column or group, its event and the index of its previous entry (`-1` for none): nothing allocated
     *  per event. */
    private readonly queuedColEvents: QueuedColEvents = [];
    /** While raising, the index past the event being raised: a change to an already notified owner queues anew. */
    private colEventsRaisingAt = 0;
    public colDefTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colDefTreeDepth = 0;
    public hasMarryChildren = false;

    /** Single source of truth for `getCol`. Pivot result colIds are namespaced (`pivot_…`). */
    public colsById: { [id: string]: AgColumn } = Object.create(null);

    public colDefGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** The last build of the colDefs, set before `ready`: the next build's reuse input and its sweep's. */
    private colDefBuild: ColumnTreeBuild | null = null;

    /** Non-padding displayed groups by `groupId`. Pivot mode = pivot's groups; else = colDefGroupsById. */
    public colsGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** Every displayed group — padding groups carry `displayInstances` */
    public colsAllGroups: AgProvidedColumnGroup[] = [];

    /**
     * User-edited group header names keyed by `groupId` — the single source of truth shared by every
     * provided-group instance (header, columns tool panel, column chooser). Persisted in grid state.
     */
    public groupHeaderNameOverrides: Map<string, string> = new Map();

    /** Lazy fallback for ColDef-shaped keys not in `colsById`: by-ref (merged + user colDef) plus
     *  `field` when distinct from colId (first-write-wins). */
    private cachedColsByDef: Map<ColKey, AgColumn> | null = null;

    private cachedAllCols: AgColumn[] | null = null;

    /** Cache for getColsInStateOrder (pivot only). Invalidated on `colsList` mutation — ref equality
     *  can't substitute, as `moveColumns` reorders in place. */
    private cachedColsInStateOrder: AgColumn[] | null = null;

    /** Prior display order per mode, as the columns shown, so the next refresh can restore user moves. */
    private lastOrder: AgColumn[] | null = null;
    private lastPivotOrder: AgColumn[] | null = null;
    /** True when `lastPivotOrder` came from a strictly-ordered (comparator/pivotSort) refresh, so it must not
     *  be treated as a user order to restore. */
    private prevPivotStrict = false;
    /** Set when colsList order changes; {@link ensureColsListIndex} re-stamps `colsListIndex` lazily. */
    private colsListIndexDirty = true;

    /** User provided column definitions */
    public colDefs: (ColDef | ColGroupDef)[] | undefined = undefined;

    private buildTokenCounter = 0;
    /** `buildTokenCounter` before the latest column definitions build: each column it made has a later token. */
    private tokenBeforeColDefsBuild = 0;

    /** Persistent padding-group cache for hierarchy virtual cols, handed to each column-tree build
     *  so `(col, depth)`-stable wrappers survive rebuilds. Owns the padding-group bean lifecycle. */
    private hierarchyWrapperCache: ColWrapperCache;

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');
        this.hierarchyWrapperCache = new ColWrapperCache(this.beans);

        // once per options change, so the column changes it asks for are one column update
        this.addManagedPropertyListeners(COLUMN_OPTIONS, (event) => {
            const properties = event.changeSet?.properties;
            if (properties) {
                this.beginColUpdate();
                try {
                    this.onColumnOptionsChanged(properties, _convertColumnEventSourceType(event.source));
                } finally {
                    this.endColUpdate();
                }
            }
        });
        // the grid options compare by identity, so a framework re-creating them with an equal value keeps the comparators
        this.addManagedPropertyListener('accentedSort', ({ currentValue, previousValue }) => {
            if (!_mergedEqual(currentValue, previousValue)) {
                ++this.accentedSortVersion;
            }
        });
    }

    /** One structural step for the call's column options (a rebuild, else a refresh), then the passes reading its
     *  result. */
    private onColumnOptionsChanged(properties: readonly (keyof GridOptions)[], source: ColumnEventType): void {
        const { autoColSvc, selectionColSvc, rowNumbersSvc, dataTypeSvc, rowModel, syncSvc, valueSvc } = this.beans;
        let columnDefs = false;
        let refresh = false;
        let rebuild = false;
        let autoGroupColumnDef = false;
        let selectionColumnDef = false;
        let rowNumbers = false;
        let calculatedColumns = false;
        let groupColumnVisibility = false;
        for (let i = 0, len = properties.length; i < len; ++i) {
            switch (properties[i]) {
                case 'pivotMode':
                    // first in every call, refreshed and told at once, as the other options read the mode
                    this.setPivotMode(this.gos.get('pivotMode'), source);
                    break;
                case 'columnDefs':
                    columnDefs = true;
                    break;
                case 'treeData':
                    valueSvc.setIsTreeData(this.gos.get('treeData'));
                    this.rowsChange.groupSortCoupling = true;
                    refresh = true;
                    break;
                case 'groupDisplayType':
                case 'groupHideOpenParents':
                case 'treeDataDisplayType':
                case 'hidePaddedHeaderRows':
                    refresh = true;
                    break;
                case 'groupHideColumnsUntilExpanded':
                    groupColumnVisibility = true;
                    break;
                case 'dataTypeDefinitions':
                    dataTypeSvc?.processDataTypeDefinitions();
                    rebuild = true;
                    break;
                case 'defaultColDef':
                case 'defaultColGroupDef':
                case 'columnTypes':
                case 'suppressFieldDotNotation':
                    rebuild = true;
                    break;
                case 'rowSelection':
                    refresh = !!selectionColSvc?.applyRowSelection() || refresh;
                    break;
                case 'calculatedColumns':
                    calculatedColumns = true;
                    break;
                case 'autoGroupColumnDef':
                    this.rowsChange.groupSortCoupling = true;
                    autoGroupColumnDef = true;
                    break;
                case 'selectionColumnDef':
                    selectionColumnDef = true;
                    break;
                case 'rowNumbers':
                case 'cellSelection':
                    rowNumbers = true;
                    break;
            }
        }
        // before the definitions' build: its calculated column events compare with the definitions before the call
        if (calculatedColumns && this.beans.calculatedColsSvc?.applyCalculatedColumnsOption() && !rebuild) {
            refresh = false; // their own build reassembles the columns, as a refresh would
        }
        const colDefs = columnDefs ? this.gos.get('columnDefs') : undefined;
        // a grid created without columns starts its rows with them, once they hold this call's options and rowData
        const rowsStarted = !!colDefs && syncSvc.waitingForColumns;
        try {
            if (rowsStarted) {
                rowModel.onPropChange?.(properties);
                syncSvc.startWithColumns(colDefs);
            } else if (colDefs) {
                // with new defaults too, one build redefines every column from both
                this.setColumnDefs(colDefs, source, rebuild);
            }
            if (rowNumbers) {
                rowNumbersSvc?.applyRowNumbersOptions(source);
            }
            if (rebuild && !colDefs && this.ready) {
                // the build reassembles the service columns and refreshes the visible ones, as a refresh would
                this.pendingRefresh = false;
                // a strict pivot order is reset by a configuration change; any other order the user made is kept
                const resetOrder = this.showingPivotResult && !!this.gos.get('enableStrictPivotColumnOrder');
                this.buildFromColDefs(source, true, true, resetOrder, false);
            } else if (refresh || this.pendingRefresh) {
                this.performRefresh(source);
            }
        } finally {
            if (!rowsStarted) {
                // after the build, so a row refreshed on its new data reads the new columns, even one that threw;
                // the rows refresh once, at the end
                rowModel.onPropChange?.(properties);
            }
        }
        // after the columns are final: their state pass slides them, which must not hold the refresh above
        if (autoGroupColumnDef && !rebuild) {
            autoColSvc?.applyAutoGroupColumnDef(source);
        }
        if (selectionColumnDef) {
            selectionColSvc?.refreshColDef(source);
        }
        if (groupColumnVisibility) {
            autoColSvc?.updateColumnVisibility();
        }
    }

    /** Whether an options change holds an option {@link onColumnOptionsChanged} applies, with its row options. */
    public isColumnOptionsChange(properties: readonly (keyof GridOptions)[]): boolean {
        return properties.some((property) => COLUMN_OPTION_SET.has(property));
    }

    public override destroy(): void {
        _destroyColumnTreeAll(this.colDefList, this.colDefBuild?.allGroups ?? null);
        this.hierarchyWrapperCache.destroy();
        this.lastOrder = null;
        this.lastPivotOrder = null;
        super.destroy();
    }

    public nextBuildToken(): number {
        return ++this.buildTokenCounter;
    }

    /** Whether `col` was created since the latest column definitions build began. */
    public isColNew(col: AgColumn): boolean {
        return col.createdBuildToken > this.tokenBeforeColDefsBuild;
    }

    public isPivotActive(): boolean {
        return this.pivotMode && !!this.beans.pivotColsSvc?.columns?.length;
    }

    public getCols(): AgColumn[] {
        return this.colsList;
    }

    /** Every column known to the grid (user, hierarchy, service, pivot result) in display (`colsList`)
     *  order, with parked pivot primaries appended. Lazily computed on first read after invalidation. */
    public getAllCols(): AgColumn[] {
        let allCols = this.cachedAllCols;
        if (!allCols) {
            // While pivoting, pivot result cols are the full set (primaries are parked); `??` keeps an empty result.
            const pivotAllCols = this.showingPivotResult ? this.beans.pivotResultCols?.buildAllCols() : undefined;
            allCols = pivotAllCols ?? this.colsList;
            this.cachedAllCols = allCols;
        }
        return allCols;
    }

    /** Resolve a provided group by id, falling back to parked primaries while pivoting (mirrors `getCol`). */
    public getColGroup(groupId: string): AgProvidedColumnGroup | undefined {
        return (
            this.colsGroupsById.get(groupId) ??
            (this.showingPivotResult ? this.colDefGroupsById.get(groupId) : undefined)
        );
    }

    /** Columns in column-state order: hidden pivot primaries first, then `colsList`. Must not be mutated. */
    public getColsInStateOrder(): AgColumn[] {
        // Only pivot has hidden primaries (built enterprise-side); cached on colsList.
        if (!this.showingPivotResult) {
            return this.colsList;
        }
        let ordered = this.cachedColsInStateOrder;
        if (ordered) {
            return ordered;
        }
        ordered = this.beans.pivotResultCols?.buildColsInStateOrder() ?? this.colsList;
        this.cachedColsInStateOrder = ordered;
        return ordered;
    }

    /** `newColDefs` re-derives each column from its definition; `resetOrder` (set definitions) restores their order;
     *  `silent`: the calculated columns raise no events for it, as its caller raises them. */
    private buildFromColDefs(
        source: ColumnEventType,
        newColDefs: boolean,
        defaultsChanged: boolean,
        resetOrder: boolean,
        silent: boolean
    ): void {
        if (this.buildingCols) {
            // asked by a callback the build runs (a `dataTypeMatcher`): runs after it, reading `colDefs` then
            const pending = this.pendingBuild;
            if (pending === null) {
                this.pendingBuild = { source, newColDefs, defaultsChanged, resetOrder };
            } else {
                pending.newColDefs ||= newColDefs;
                pending.defaultsChanged ||= defaultsChanged;
                pending.resetOrder ||= resetOrder;
            }
            return;
        }
        const beans = this.beans;
        const { valueCache, colAutosize, visibleCols, eventSvc } = beans;

        // only dispatch before/after events when updating an existing column model, not on first set.
        const stateChanges = this.ready ? captureColumnStateChanges(beans) : undefined;
        valueCache?.expire(); // new ids may collide with old ids, so cached values would be wrong for new cols

        this.beginColUpdate();
        if (stateChanges) {
            this.animateColWidths();
        }
        this.buildingCols = true;
        this.tokenBeforeColDefsBuild = this.buildTokenCounter;
        try {
            const { rowGroupColsSvc, pivotColsSvc, valueColsSvc, groupHierarchyColSvc, calculatedColsSvc } = beans;
            const previous = this.colDefBuild;
            const builder = _buildColumnTree(
                beans,
                /* defs */ this.colDefs!, // set by setColumnDefs before any build: the other callers wait for `ready`
                /* primaryColumns */ true,
                /* previous */ previous,
                /* source */ source,
                /* newColDefs */ newColDefs,
                /* wrapperCache */ this.hierarchyWrapperCache
            );
            groupHierarchyColSvc?.contributeTo(builder);
            calculatedColsSvc?.contributeTo(builder);
            _finalizeColumnTree(builder, previous);

            const cols = builder.columns;
            this.colDefTree = builder.columnTree;
            this.colDefTreeDepth = builder.treeDepth;
            this.colDefList = cols;
            ++this.colDefsVersion;
            this.colDefGroupsById = builder.groupsById;
            this.colDefBuild = builder;

            // Single shared scan: each service classifies independently, bucketing lazily until commit.
            const tokenBeforeBuild = this.tokenBeforeColDefsBuild;
            for (let i = 0, len = cols.length; i < len; ++i) {
                const col = cols[i];
                const colIsNew = col.createdBuildToken > tokenBeforeBuild;
                rowGroupColsSvc?.extractCol(col, colIsNew, source, newColDefs);
                pivotColsSvc?.extractCol(col, colIsNew, source, newColDefs);
                valueColsSvc?.extractCol(col, colIsNew, source, newColDefs);
            }
            rowGroupColsSvc?.commitExtract(source, false, newColDefs);
            pivotColsSvc?.commitExtract(source, false, newColDefs);
            valueColsSvc?.commitExtract(source, false, newColDefs);

            this.ready = true;
            this.refreshCols(resetOrder, source);
            const autoCols = defaultsChanged ? beans.autoColSvc?.columns : undefined;
            if (autoCols) {
                // the refresh re-derived their colDefs; raised with the other columns' events below
                applyColDefStateToCols(beans, autoCols, source);
            }
            visibleCols.refresh(source, false);
            // the model is whole again: a listener notified below may rebuild at once
            this.buildingCols = false;

            this.stageEverythingChanged(source);

            if (stateChanges) {
                dispatchColStateChanges(beans, source, stateChanges);
            }

            const change = this.rowsChange;
            change.columns = true;
            change.columnsLoaded = true;
            eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });
            calculatedColsSvc?.onColumnsLoaded(source, silent);

            if (source === 'gridInitializing') {
                colAutosize?.applyAutosizeStrategy();
            }
        } finally {
            this.buildingCols = false; // after a throw too
            this.endColUpdate();
        }
    }

    /** Queues the column events raised, and defers the role changes staged, until the matching {@link endColUpdate},
     *  so an update's listeners see every column it changes final. Nests: the outermost end runs them all. */
    public beginColUpdate(): void {
        ++this.colUpdateDepth;
    }

    /** Call from a `finally`. The outermost end runs the staged changes, then raises the queued column events, a
     *  change a listener makes (joining this update) running before the next; then layout events. Rethrows after. */
    public endColUpdate(): void {
        const depth = this.colUpdateDepth;
        if (depth > 1) {
            this.colUpdateDepth = depth - 1;
            return;
        }
        // held at 1 while it ends, so what a listener changes joins this update; an unmatched close still runs it
        this.colUpdateDepth = 1;
        let threw = false;
        let error: unknown;
        const queue = this.queuedColEvents;
        let raised = 0;
        // the definitions the last whole pass settled; none before the first
        let settledColDefsVersion = -1;
        for (;;) {
            try {
                const colDefsVersion = this.colDefsVersion;
                if (
                    colDefsVersion !== settledColDefsVersion ||
                    this.hasColChangesStaged() ||
                    isRowsRefreshOwed(this.rowsChange)
                ) {
                    this.settleColChanges();
                    // last: a pass that threw runs again, each step having taken what it ran
                    settledColDefsVersion = colDefsVersion;
                } else if (raised < queue.length) {
                    const at = raised;
                    raised += 3;
                    this.colEventsRaisingAt = raised;
                    (queue[at] as QueuedEventOwner).raiseQueuedEvent(queue[at + 1] as AgEvent<string>);
                } else {
                    break;
                }
            } catch (e) {
                error = threw ? error : e;
                threw = true;
            }
        }
        this.colEventsRaisingAt = 0;
        queue.length = 0;
        this.colUpdateDepth = 0;
        // owed by changes no pass settled: a reset's formula cells, a listener's hide's legacy and layout events
        try {
            this.beans.formula?.refreshCellsForColChanges();
        } catch (e) {
            error = threw ? error : e;
            threw = true;
        }
        try {
            this.raiseEverythingChanged();
            this.beans.visibleCols.raiseDeferredLayoutEvents();
        } catch (e) {
            error = threw ? error : e;
            threw = true;
        }
        if (this.animatingColWidths) {
            // last, so every layout the update made, its rows' refresh included, animates
            this.animatingColWidths = false;
            const orderBefore = this.orderBeforeWidthAnimation;
            this.orderBeforeWidthAnimation = null;
            try {
                _finishColumnWidthAnimation(this.beans, orderBefore);
            } catch (e) {
                error = threw ? error : e;
                threw = true;
            }
        }
        if (this.animatingColUpdate) {
            this.animatingColUpdate = false;
            try {
                this.beans.colAnimation?.finish();
            } catch (e) {
                error = threw ? error : e;
                threw = true;
            }
        }
        if (threw) {
            throw error;
        }
    }

    /** Call inside a column update: its layouts' width changes animate, in one window its outermost end closes. */
    public animateColWidths(): void {
        if (this.animatingColWidths) {
            return;
        }
        this.animatingColWidths = true;
        const { gos, visibleCols } = this.beans;
        // the transition slides cells too, so a reorder drops the window when column moves do not animate
        this.orderBeforeWidthAnimation =
            gos.get('animateColumnResizing') && gos.get('suppressColumnMoveAnimation') ? visibleCols.allCols : null;
        _setColumnWidthAnimation(this.beans, true);
    }

    /** Call inside a column update: the columns its layouts move slide, in one window its outermost end closes. */
    public animateColUpdate(): void {
        if (this.animatingColUpdate) {
            return;
        }
        this.animatingColUpdate = true;
        this.beans.colAnimation?.start();
    }

    /** Before an event ending a step of the update, the rows' refresh and `columnMoved` a state change owes them. */
    private refreshRowsForColumnsMovedCheck(): void {
        if (this.columnsMovedCheck === null) {
            return;
        }
        this.refreshRowsForChange();
    }

    /** Compares the column order with the update's earliest state snapshot once the rows have refreshed. */
    public checkColumnsMovedAfterRowsRefresh(source: ColumnEventType, changes: ColumnStateChanges): void {
        this.columnsMovedCheck ??= { source, changes };
    }

    /** Refreshes the rows for a filter change: at once, or as the open column update ends. */
    public refreshRowsForFilter(modelChanged: boolean, primary: boolean): void {
        const change = this.rowsChange;
        change.filter = true;
        change.filterModel ||= modelChanged;
        change.primaryFilter ||= primary;
        if (this.colUpdateDepth === 0) {
            this.refreshRowsForChange();
        }
    }

    /** Records a sort change, raised only inside a column update: the rows refresh for it as the update ends. */
    public refreshRowsForSort(): void {
        this.rowsChange.sort = true;
    }

    /** The one row refresh the changes so far owe, its readers, then the moves it made to the pivot result columns;
     *  called inside an update by a step reading the rows it leaves. */
    public refreshRowsForChange(): void {
        const change = this.rowsChange;
        const columnsMovedCheck = this.columnsMovedCheck;
        this.columnsMovedCheck = null;
        try {
            if (!isRowsRefreshOwed(change)) {
                return;
            }
            this.rowsChange = newRowModelChange();
            const beans = this.beans;
            // the filters and the sort follow the mode and options they are refreshed for, before the rows are
            if (change.pivotMode) {
                beans.colFilter?.onPivotModeChanged();
            }
            // a first build's pivot columns are told by no change of their own
            if (change.pivotMode || change.pivot || change.groupSortCoupling || change.columnsLoaded) {
                beans.rowNodeSorter?.refreshOptions();
            }
            beans.rowModel.refreshAfterChange?.(change);
            if (change.columnsLoaded || change.rowGroups || change.pivotMode || change.filter || change.sort) {
                beans.rowDragSvc?.refreshVisibility();
            }
            if (change.rowGroups) {
                beans.rowRenderer.refreshShowRowGroupCells();
            }
            if (change.rowGroups || change.columnsLoaded) {
                // new group nodes are opened silently by the regroup
                beans.stateSvc?.onRowGroupsChanged();
            }
        } finally {
            if (columnsMovedCheck) {
                dispatchColumnMoved(this.beans, columnsMovedCheck.source, columnsMovedCheck.changes);
            }
        }
    }

    /** Raises the row group, value or pivot event for `columns`; the rows refresh for it as the column update ends. */
    public dispatchColumnChangedEvent(
        type: ColumnChangedEventType,
        columns: AgColumn[],
        source: ColumnEventType
    ): void {
        const change = this.rowsChange;
        change.columns = true;
        if (type === 'columnRowGroupChanged') {
            change.rowGroups = true;
        } else if (type === 'columnValueChanged') {
            change.values = true;
        } else {
            change.pivot = true;
            change.pivotSource = source;
        }
        this.eventSvc.dispatchEvent({
            type,
            columns,
            column: columns.length === 1 ? columns[0] : null,
            source,
        } as WithoutGridCommon<ColumnEvent>);
    }

    /** Queues `event`, replacing its owner's queued one of that type and state key: notified once, with the latest. */
    public queueColEvent(owner: QueuedEventOwner, event: AgEvent<string>): void {
        const queue = this.queuedColEvents;
        let prev = owner.lastQueuedEventAt;
        // a stale index from an emptied queue never lands on this owner: queuing it here would have moved the index
        if (prev < queue.length && queue[prev] === owner) {
            const type = event.type;
            for (let i = prev, told = this.colEventsRaisingAt; i >= told; i = queue[i + 2] as number) {
                const queued = queue[i + 1] as AgEvent<string>;
                if (
                    queued.type === type &&
                    (type !== 'columnStateUpdated' ||
                        (queued as ColumnStateUpdatedEvent).key === (event as ColumnStateUpdatedEvent).key)
                ) {
                    queue[i + 1] = event;
                    return;
                }
            }
        } else {
            prev = -1;
        }
        owner.lastQueuedEventAt = queue.length;
        queue.push(owner, event, prev);
    }

    /** Call inside a column update: the role services dispatch their staged changes as the update ends. */
    public stageColDispatch(source: ColumnEventType): void {
        this.pendingChangesSource ??= source;
    }

    /** Call inside a column update: a role change moving columns refreshes, animates and dispatches as it ends. */
    public stageColRefresh(source: ColumnEventType): void {
        this.pendingRefresh = true;
        this.pendingChangesSource ??= source;
    }

    /** Call inside a column update: owes the deprecated `columnEverythingChanged`, raised once with the
     *  `displayedColumnsChanged` of the changes owing it, as its docs say (a listener's change raises its own). */
    public stageEverythingChanged(source: ColumnEventType): void {
        this.pendingEverythingSource ??= source;
    }

    private raiseEverythingChanged(): void {
        const source = this.pendingEverythingSource;
        if (source !== null) {
            this.pendingEverythingSource = null;
            this.eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
        }
    }

    private hasColChangesStaged(): boolean {
        return this.pendingBuild !== null || this.pendingRefresh || this.pendingChangesSource !== null;
    }

    /** One pass of the outer update's end, each step taking what it runs: a staged build, its column refresh and
     *  dispatches, the rows' refresh, the redefined cells, then the grid events, before any column event. */
    private settleColChanges(): void {
        const pending = this.pendingBuild;
        if (pending !== null) {
            try {
                this.buildFromColDefs(
                    pending.source,
                    pending.newColDefs,
                    pending.defaultsChanged,
                    pending.resetOrder,
                    false
                );
            } finally {
                // a request a callback makes in the staged build is dropped: one asking in every build would never end
                this.pendingBuild = null;
            }
        }
        if (this.hasColChangesStaged()) {
            const { rowGroupColsSvc, pivotColsSvc, valueColsSvc } = this.beans;
            const source = this.pendingChangesSource ?? 'api';
            const pendingRefresh = this.pendingRefresh;
            this.pendingChangesSource = null;
            try {
                if (pendingRefresh) {
                    // a rebuild slides its reflow from the columns' old spots; inert when nothing moves
                    this.animateColUpdate();
                    this.performRefresh(source); // clears pendingRefresh
                }
                rowGroupColsSvc?.dispatchColChange(source);
                pivotColsSvc?.dispatchColChange(source);
                valueColsSvc?.dispatchColChange(source);
            } catch (e) {
                this.pendingChangesSource ??= source; // the dispatches a throw skipped run in the next pass
                throw e;
            }
        }
        const beans = this.beans;
        const formula = beans.formula;
        // before the rows re-filter, so they read the params of the filters this pass redefined
        beans.colFilter?.refreshRedefinedFilters();
        formula?.refreshForColChanges();
        this.refreshRowsForChange();
        beans.rowRenderer.refreshRedefinedCells(); // the columns the pass redefined, before their colDefChanged
        formula?.refreshCellsForColChanges();
        this.raiseEverythingChanged();
        beans.visibleCols.raiseDeferredGridLayoutEvents();
    }

    /** Assembles the displayed columns from the services' and the source build's. */
    public refreshCols(resetOrder: boolean, source: ColumnEventType): void {
        const colDefBuild = this.colDefBuild;
        if (!this.ready || colDefBuild === null) {
            return;
        }
        const beans = this.beans;
        const gos = this.gos;
        const formula = beans.formula;
        const pivotColsSvc = beans.pivotColsSvc;
        // A pivot sort, or a strict pivot-sort order being cleared, reorders existing columns: slide them as a move.
        if (pivotColsSvc?.hasInteractivePivotSort() || this.prevPivotStrict) {
            this.animateColUpdate();
        }
        const colDefList = this.colDefList;
        const prevColTree = this.colsTree;
        const prevWasPivot = this.showingPivotResult;
        const resultColsSvc = this.pivotMode ? beans.pivotResultCols : null;
        // `pivotCols` is null while the pivot result columns are cleared, their build kept for reuse.
        const pivotBuild = resultColsSvc?.pivotCols != null ? resultColsSvc.pivotBuild : null;
        const showingPivotResult = pivotBuild !== null;
        // `colDefList` rather than its build's columns: `replaceColDefList` may have reordered it.
        const sourceList = pivotBuild ? pivotBuild.columns : colDefList;
        const sourceBuild = pivotBuild ?? colDefBuild;
        const sourceTree = sourceBuild.columnTree;
        const sourceTreeDepth = sourceBuild.treeDepth;
        // Service refresh runs in dependency order; formulas operate on the primary cols (colDefList).
        formula?.setFormulasActive(colDefList);
        const autoCols = beans.autoColSvc?.refreshCols(source);
        const selectionCol = beans.selectionColSvc?.refreshCols();
        const rowNumberCol = beans.rowNumbersSvc?.refreshCols();
        const oldColsList = this.colsList;
        // Emit in display order: rowNumbers → selection → autoGroup → user/pivot body cols.
        const autoColsLen = autoCols?.length ?? 0;
        const sourceListLen = sourceList.length;
        const sourceTreeLen = sourceTree.length;
        const serviceColsLen = (rowNumberCol ? 1 : 0) + (selectionCol ? 1 : 0) + autoColsLen;
        // Pre-allocated at final size — the assemble loops below fill by index, not push.
        const colsList = new Array<AgColumn>(serviceColsLen + sourceListLen);
        const colsTree = new Array<AgColumn | AgProvidedColumnGroup>(serviceColsLen + sourceTreeLen);
        const colsById: { [id: string]: AgColumn } = Object.create(null);
        let colsIdx = 0;
        if (rowNumberCol) {
            colsList[colsIdx++] = rowNumberCol;
        }
        if (selectionCol) {
            colsList[colsIdx++] = selectionCol;
        }
        for (let i = 0; i < autoColsLen; ++i) {
            colsList[colsIdx++] = autoCols![i];
        }
        // At depth 0 the wrapper IS the col, so skip the wrap loop; still drop cached wrappers from
        // a prior depth>0 build so service cols don't point at a stale wrapper.
        const serviceWrapperCache = beans.colGroupSvc.wrapperCache;
        if (sourceTreeDepth > 0) {
            const buildToken = this.nextBuildToken();
            for (let i = 0; i < serviceColsLen; ++i) {
                const col = colsList[i];
                col.inColsList = true;
                colsTree[i] = serviceWrapperCache.wrap(col, sourceTreeDepth, buildToken);
            }
            serviceWrapperCache.evict(buildToken);
        } else {
            serviceWrapperCache.destroy();
            for (let i = 0; i < serviceColsLen; ++i) {
                const col = colsList[i];
                col.inColsList = true;
                col.originalParent = null;
                colsTree[i] = col;
            }
        }

        // In pivot mode, sourceList = pivotCols; primaries (colDefList) need colsById entries for lookups
        // but are parked out of colsList (`inColsList = false`). Non-pivot covers them via the next loop.
        if (showingPivotResult) {
            // Entering pivot: freeze the current display order so `getColumnDefs` keeps reporting it.
            if (!prevWasPivot) {
                this.ensureColsListIndex();
            }
            // A col added while pivoting has no frozen index (-1); seat it after its left colDef neighbour so
            // `getColumnDefs` reports it in colDef order (stable sort breaks the tie) without disturbing others.
            let lastIndex = -1;
            for (let i = 0, len = colDefList.length; i < len; ++i) {
                const col = colDefList[i];
                colsById[col.colId] = col;
                col.inColsList = false;
                if (col.colsListIndex < 0) {
                    col.colsListIndex = lastIndex;
                } else {
                    lastIndex = col.colsListIndex;
                }
            }
        }
        for (let i = 0; i < sourceListLen; ++i) {
            const col = sourceList[i];
            colsList[colsIdx++] = col;
            colsById[col.colId] = col;
            col.inColsList = true;
        }
        for (let i = 0; i < sourceTreeLen; ++i) {
            colsTree[serviceColsLen + i] = sourceTree[i];
        }
        let takers: AgColumn[] | null = null;
        for (let i = 0; i < serviceColsLen; ++i) {
            const col = colsList[i];
            const colId = col.colId;
            const taker = colsById[colId];
            colsById[colId] = col;
            if (!taker?.primary) {
                continue;
            }
            takers ??= [];
            takers.push(taker);
        }
        const yielded = takers === null ? 0 : this.yieldIdsToServiceCols(takers, colsById, colDefBuild, source);
        if ((yielded & YIELD_MOVED) !== 0) {
            // what the rows and their values hold by column id reads the new ids, as after a build
            beans.valueCache?.expire();
            const change = this.rowsChange;
            change.columns = true;
            change.columnsLoaded = true;
            this.refreshCols(resetOrder, source); // with the ids now free: the group columns follow their sources' ids
            if ((yielded & (YIELD_REPLACED_SOURCE | YIELD_LEVEL_TAKER)) === YIELD_REPLACED_SOURCE) {
                // its hierarchy columns read it: a build makes them for the column in its place
                this.buildFromColDefs(source, false, false, resetOrder, false);
            } else if ((yielded & YIELD_REPLACED) !== 0 && !this.buildingCols) {
                // the primary columns lost one and gained one: their listeners read them again
                this.eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });
            }
            return;
        }
        this.showingPivotResult = showingPivotResult;
        this.colsTreeDepth = sourceTreeDepth;
        this.hasMarryChildren = sourceBuild.marryChildren;
        this.colsGroupsById = sourceBuild.groupsById;
        this.colsAllGroups = sourceBuild.allGroups;
        // Snapshot prior colsList into the mode's lastOrder so the next refresh restores user moves.
        if (hasSourceCol(oldColsList)) {
            if (prevWasPivot) {
                // A strict pivot order (comparator/pivotSort) isn't a user arrangement to preserve - skip it so
                // clearing pivotSort restores the prior non-strict order rather than the transient asc/desc one.
                if (!this.prevPivotStrict) {
                    this.lastPivotOrder = snapshotCols(oldColsList, this.lastPivotOrder);
                }
            } else {
                this.lastOrder = snapshotCols(oldColsList, this.lastOrder);
            }
        }
        this.prevPivotStrict = showingPivotResult && (pivotColsSvc?.isStrictColumnOrder() ?? false);
        // An active interactive pivotSort forces strict pivot column order, overriding sticky-order preservation.
        const restoreOrder = !resetOrder || _shouldMaintainColumnOrder(gos, showingPivotResult);
        const lastOrder = showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        let prevOrder = restoreOrder ? lastOrder : null;
        // pivotSort reorders the groups but keeps the user's within-group order and widths: re-rank the
        // preserved order by the freshly-sorted group order rather than discarding it.
        if (prevOrder != null && showingPivotResult && !!pivotColsSvc?.hasInteractivePivotSort()) {
            prevOrder = pivotColsSvc.reRankByPivotGroupOrder(colsList, prevOrder, colsById);
        }
        const calculatedColsSvc = beans.calculatedColsSvc;
        const ordered =
            prevOrder == null
                ? (calculatedColsSvc?.seatCalculatedCols(colsList, colsById, null) ?? colsList)
                : applyPrevColumnsOrder(colsList, colsById, prevOrder, calculatedColsSvc);
        const finalColsList = placeLockedColumns(ordered, gos);
        const colsListChanged = !_areEqual(finalColsList, oldColsList);
        if (colsListChanged) {
            this.colsListIndexDirty = true;
        }
        this.colsList = colsListChanged ? finalColsList : oldColsList;
        this.colsTree = _areEqual(colsTree, prevColTree) ? prevColTree : colsTree;
        this.colsById = colsById;
        this.invalidateColsDerivedState();
        this.refreshColsDerivedState();
        if (colsListChanged) {
            beans.rowSpanSvc?.refreshCols();
            // Last: the purge dispatches synchronously, so a listener must not see a half-rebuilt model.
            beans.editSvc?.releaseColumnsLeaving(finalColsList);
        }
        if (this.colsTree !== prevColTree || colsListChanged) {
            this.eventSvc.dispatchEvent({ type: 'gridColumnsChanged' });
        }
        if ((yielded & YIELD_LEVEL_TAKER) !== 0) {
            // a hierarchy column holds a service id: the build, seeing the service column, gives it another
            this.buildFromColDefs(source, false, false, resetOrder, false);
        }
    }

    /** Moves each column holding a service id (all in `colsById`) to a free one: renamed when this build made it,
     *  else replaced by a new column with its roles; a hierarchy column an earlier build made is left to a build. */
    private yieldIdsToServiceCols(
        takers: AgColumn[],
        colsById: { [id: string]: AgColumn },
        build: ColumnTreeBuild,
        source: ColumnEventType
    ): number {
        const groupHierarchyColSvc = this.beans.groupHierarchyColSvc;
        let yielded = 0;
        for (let i = 0, len = takers.length; i < len; ++i) {
            const taker = takers[i];
            const colId = taker.colId;
            const isNew = this.buildingCols && this.isColNew(taker);
            if (!isNew && taker.userProvidedColDef === null) {
                yielded |= YIELD_LEVEL_TAKER; // its allocator gives it a free id
                continue;
            }
            let suffix = 1;
            let id = `${colId}_1`;
            while (colsById[id] !== undefined || build.groupsById.has(id)) {
                id = `${colId}_${++suffix}`;
            }
            this.beans.dataTypeSvc?.onColIdChanged(colId, id);
            if (isNew) {
                // drawn by no view yet: renamed, with the levels whose ids a build derives from its own
                taker.renameId(id);
                taker.markIdGenerated();
                const ownLevels = groupHierarchyColSvc?.getVirtualCols(taker);
                const levelPrefix = `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${colId}-`;
                for (let j = 0, levelsLen = ownLevels?.length ?? 0; j < levelsLen; ++j) {
                    const level = ownLevels![j];
                    const levelId = level.colId;
                    if (!levelId.startsWith(levelPrefix)) {
                        continue; // a configured part's own colId
                    }
                    level.renameId(`${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${id}-${levelId.slice(levelPrefix.length)}`);
                }
                colsById[id] = taker;
                this.rekeyBuildCol(build, taker, colId, taker, id);
                yielded |= YIELD_MOVED;
                if (taker.userProvidedColDef === null) {
                    this.beans.log.warn(273, { providedId: colId, usedId: id }); // a hierarchy part's own colId
                }
                continue;
            }
            const levels = groupHierarchyColSvc?.getVirtualCols(taker);
            const col = this.replaceUserCol(taker, id, build, source);
            colsById[id] = col;
            this.rekeyBuildCol(build, taker, colId, col, id);
            yielded |= YIELD_MOVED | YIELD_REPLACED | (levels === undefined ? 0 : YIELD_REPLACED_SOURCE);
        }
        return yielded;
    }

    /** A new column for the definition of `old`, a drawn column, at `id` in its place; `old` is destroyed. */
    private replaceUserCol(old: AgColumn, id: string, build: ColumnTreeBuild, source: ColumnEventType): AgColumn {
        const beans = this.beans;
        const col = _createUserColumn(beans, old.userProvidedColDef!, id, true, build.buildToken);
        col.markIdGenerated();
        const colDefList = this.colDefList;
        colDefList[colDefList.indexOf(old)] = col;
        const buildCols = build.columns;
        if (buildCols !== colDefList) {
            buildCols[buildCols.indexOf(old)] = col;
        }
        const parent = old.originalParent;
        col.originalParent = parent;
        if (parent !== null) {
            const children = parent.children;
            children[children.indexOf(old)] = col;
        }
        const { rowGroupColsSvc, pivotColsSvc, valueColsSvc } = beans;
        rowGroupColsSvc?.replaceCol(old, col, source);
        pivotColsSvc?.replaceCol(old, col, source);
        valueColsSvc?.replaceCol(old, col, source);
        col.aggFunc = old.aggFunc;
        const def = col.userProvidedColDef!;
        if (build.colsByDef.get(def) === old) {
            build.colsByDef.set(def, col);
        } else {
            const later = build.laterColsByDef?.get(def);
            later?.splice(later.indexOf(old), 1, col);
        }
        old.destroy();
        return col;
    }

    /** `build`'s maps hold `col` at `id` where they held `old` at `oldId`, as a build giving it `id` would. */
    private rekeyBuildCol(build: ColumnTreeBuild, old: AgColumn, oldId: string, col: AgColumn, id: string): void {
        if (build.colsById.get(oldId) === old) {
            // rekeyed in place: the next build pairs the columns in this order
            const byId = new Map<string, AgColumn>();
            for (const [key, value] of build.colsById) {
                byId.set(key === oldId ? id : key, value === old ? col : value);
            }
            build.colsById = byId;
        }
        const declared = col.userProvidedColDef?.colId;
        if (declared != null) {
            this.beans.log.warn(273, { providedId: declared, usedId: id });
            const laterColsByColId = build.laterColsByColId ?? new Map<string, AgColumn[]>();
            build.laterColsByColId = laterColsByColId;
            _pushToMapArray(laterColsByColId, declared, col);
        }
    }

    /** Refreshes the state derived from `colsList` (group and quick-filter cols), clears the displayed cols and marks
     *  the header rows for a rebuild, ahead of `visibleCols.refresh`; also run by a visibility-only change. */
    public refreshColsDerivedState(): void {
        const beans = this.beans;
        beans.showRowGroupCols?.refresh();
        beans.quickFilter?.refreshCols();
        beans.visibleCols.clear();
        beans.colViewport.invalidateHeaderRows();
    }

    /** Full refresh (rebuild cols + recompute visible); immediate, or deferred to the outermost {@link endColUpdate}. */
    public refreshAll(source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }
        if (this.colUpdateDepth > 0) {
            this.stageColRefresh(source);
            return;
        }
        // one update, so the auto columns it redefines raise their events once laid out
        this.beginColUpdate();
        try {
            this.performRefresh(source);
        } finally {
            this.endColUpdate();
        }
    }

    /** Call inside a column update. */
    private performRefresh(source: ColumnEventType): void {
        this.pendingRefresh = false; // consumed: this refresh satisfies the pending request
        if (!this.ready) {
            return;
        }
        this.refreshCols(false, source);
        this.beans.visibleCols.refresh(source, false);
    }

    /** Reorder `colDefList` only — `newList` MUST be a permutation of the existing col instances
     *  (caller owns the invariant). A full refresh should follow to propagate to display cols.
     *  `colsById` unchanged; `getAllCols` is order-agnostic. */
    public replaceColDefList(newList: AgColumn[]): void {
        if (this.ready) {
            this.colDefList = newList;
        }
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode) {
            return;
        }
        try {
            this.refreshRowsForColumnsMovedCheck(); // in the mode the moves were made in
        } finally {
            this.pivotMode = pivotMode;
            if (this.ready) {
                // Refresh in case the auto-group col must be added/removed: with `groupDisplayType: 'custom'`
                // it's only used in pivot mode (where it's mandatory).
                const pivotResultCols = this.beans.pivotResultCols;
                if (!pivotMode && pivotResultCols?.pivotCols && !pivotResultCols.suppliedColDefs) {
                    // the grid's own result columns go in this refresh, which the rows' refresh would drop in a second
                    pivotResultCols.setPivotResultCols(null, source);
                } else {
                    this.refreshCols(false, source);
                    this.beans.visibleCols.refresh(source, false);
                }
                const change = this.rowsChange;
                change.columns = true;
                change.pivotMode = true;
                this.eventSvc.dispatchEvent({ type: 'columnPivotModeChanged' });
            }
        }
    }

    /** `defaultsChanged`: the defaults and column types changed too, so the build re-derives the generated columns. */
    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType, defaultsChanged: boolean) {
        const beans = this.beans;
        // Declaring the column set afresh reclaims the columns from the user: the layer goes with it, and
        // is cleared here rather than by an owning service so it also clears with no owner registered.
        beans.userColumnSvc?.clear();
        beans.calculatedColsSvc?.resetDynamicColumnDefs();
        this.colDefs = columnDefs;
        this.buildFromColDefs(source, true, defaultsChanged, true, false);
    }

    /** Rebuilds from `colDefs` and every contributor for a contributor's change (calc-col edit, state restore),
     *  silently: the caller raises the calculated column events it owes. */
    public rebuildCols(source: ColumnEventType): void {
        if (this.ready) {
            this.buildFromColDefs(source, false, false, false, true);
        }
    }

    /** Mark `AgColumn.colsListIndex` stale — called when `colsList`'s order changes outside a refresh
     *  (`moveColumns`, `applyColumnState` with `applyOrder`); next `ensureColsListIndex` re-stamps. */
    public markColsListIndexDirty(): void {
        this.colsListIndexDirty = true;
        ++this.colsMovedVersion;
        // Both order-derived views snapshot `colsList` order while pivoting (parked-primary concat) — drop both.
        this.cachedColsInStateOrder = null;
        this.cachedAllCols = null;
    }

    /** Drop all col-set/order-derived state after a structural (`colsList`) rebuild — this model's caches plus
     *  the sort service's column-derived cache. (An order-only move uses {@link markColsListIndexDirty} instead.) */
    private invalidateColsDerivedState(): void {
        this.cachedColsByDef = null;
        this.cachedAllCols = null;
        this.cachedColsInStateOrder = null;
        this.beans.sortSvc?.invalidate();
    }

    /** Lazily stamp each col's index in `colsList` onto `AgColumn.colsListIndex`, once per order change.
     *  Readers (e.g. `getColumnDefs`) call this before reading `col.colsListIndex`, so a burst of moves
     *  costs one O(N) pass on the next read, not one per move. */
    public ensureColsListIndex(): void {
        if (this.colsListIndexDirty) {
            const colsList = this.colsList;
            for (let i = 0, len = colsList.length; i < len; ++i) {
                colsList[i].colsListIndex = i;
            }
            this.colsListIndexDirty = false;
        }
    }

    /** Resolve any key (colId string, AgColumn, or ColDef) to its current AgColumn. Fast path inline:
     *  string colId, or object whose `colId` hits `colsById` (O(1)); misses delegate to `getColFallback`. */
    public getCol(key: ColKey | null | undefined): AgColumn | undefined {
        if (typeof key === 'string') {
            return this.colsById[key] ?? this.getColFallback(key);
        }
        // `?.colId` collapses the null/undefined + non-object checks into one access: both yield
        // `undefined`, falling through to the slow path.
        const id = (key as { colId?: unknown } | null | undefined)?.colId;
        if (typeof id === 'string') {
            const col = this.colsById[id];
            if (col !== undefined) {
                return col;
            }
        }
        return key == null ? undefined : this.getColFallback(key);
    }

    /** Slow-path fallback for `getCol`: ColDef/ColGroupDef ref lookup + `field`-string fallback, building
     *  the lazy `colsByDef` map on first use. Stale AgColumn refs return `undefined` (unregistered, no `field`). */
    private getColFallback(key: ColKey): AgColumn | undefined {
        const map = this.cachedColsByDef ?? this.loadColsByDef();
        const byRef = map.get(key);
        if (byRef !== undefined) {
            return byRef;
        }
        if (typeof key !== 'object') {
            return undefined;
        }
        const field = (key as { field?: string }).field;
        return typeof field === 'string' ? map.get(field) : undefined;
    }

    /** Find a column excluding pivot result cols. `pivotKeys` (grid-set) is an O(1) discriminator
     *  standing in for a `pivotCols`-membership test, so `getColumnDefs()` doesn't round-trip them. */
    public getNonPivotCol(key: ColKey): AgColumn | undefined {
        const col = this.getCol(key);
        return col !== undefined && col.colDef.pivotKeys == null ? col : undefined;
    }

    /** Like `getNonPivotCol` for hot paths where the key is a known colId string — skips the type-check + field-fallback. */
    public getNonPivotColById(key: string): AgColumn | undefined {
        const col = this.colsById[key];
        return col !== undefined && col.colDef.pivotKeys == null ? col : undefined;
    }

    private loadColsByDef(): Map<ColKey, AgColumn> {
        const map = new Map<ColKey, AgColumn>();
        addColsToDefMap(map, this.colsList);
        // In pivot mode colDefList cols are in colsById but not colsList — include them too
        if (this.showingPivotResult) {
            addColsToDefMap(map, this.colDefList);
        }
        this.cachedColsByDef = map;
        return map;
    }
}

/** Whether `list` holds a column besides the service ones: only such a list is an order to restore. */
const hasSourceCol = (list: AgColumn[]): boolean => {
    for (let i = 0, len = list.length; i < len; ++i) {
        const colKind = list[i].colKind;
        if (colKind !== 'auto-group' && colKind !== 'selection' && colKind !== 'row-number') {
            return true;
        }
    }
    return false;
};

const snapshotCols = (list: AgColumn[], out: AgColumn[] | null): AgColumn[] => {
    if (out === null) {
        return list.slice();
    }
    const len = list.length;
    out.length = len;
    for (let i = 0; i < len; ++i) {
        out[i] = list[i];
    }
    return out;
};

/** Indexes each col by its colDef, its user-provided colDef and (as a fallback) its field. */
const addColsToDefMap = (map: Map<ColKey, AgColumn>, list: AgColumn[]): void => {
    for (let i = 0, len = list.length; i < len; ++i) {
        const col = list[i];
        const colDef = col.colDef;
        map.set(colDef, col);
        const provided = col.userProvidedColDef;
        if (provided != null) {
            map.set(provided, col);
        }
        const field = colDef.field;
        if (field && field !== col.colId && !map.has(field)) {
            map.set(field, col);
        }
    }
};

/** What {@link ColumnModel.yieldIdsToServiceCols} did: moved a column, replaced one, replaced a hierarchy source, left
 *  a hierarchy column to a build. */
const YIELD_MOVED = 1;
const YIELD_REPLACED = 2;
const YIELD_REPLACED_SOURCE = 4;
const YIELD_LEVEL_TAKER = 8;

/** Whether `change` asks the rows to refresh. */
function isRowsRefreshOwed(change: RowModelChange): boolean {
    return change.columns || change.filter || change.sort || change.rows || change.groupSortCoupling;
}

function newRowModelChange(): RowModelChange {
    return {
        columns: false,
        columnsLoaded: false,
        rowGroups: false,
        values: false,
        pivot: false,
        pivotSource: 'api',
        pivotResultNames: false,
        pivotMode: false,
        filter: false,
        filterModel: false,
        primaryFilter: false,
        sort: false,
        groupSortCoupling: false,
        rows: false,
    };
}
