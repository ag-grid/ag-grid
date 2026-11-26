import type { StringComparator } from 'ag-stack';
import { _areEqual } from 'ag-stack';

import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEvent, ColumnEventType } from '../events';
import { HEADER_OPTIONS } from '../gridChanges';
import { _isClientSideRowModel, _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import type { ColumnChangedEventType } from '../interfaces/iColsService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import { _mergedEqual } from '../utils/mergeDeep';
import { applyPrevColumnsOrder } from './colsApplyPrevOrder';
import { ColWrapperCache } from './columnGroups/colWrapperCache';
import { applyColDefStateToCols, captureColumnStateChanges, dispatchColStateChanges } from './columnStateUtils';
import type { ColumnTreeBuild } from './columnTree/columnTreeBuilder';
import { _buildColumnTree } from './columnTree/columnTreeBuilder';
import { _destroyColumnTreeAll } from './columnUtils';

// Two parallel col representations:
//   colDefList / colDefTree  — PRIMARY cols (user-defined leaves + hierarchy virtuals).
//   colsList   / colsTree    — DISPLAY cols: [serviceCols, ...colDefList] (or pivot result).

/** A build asked for during another, run by the outermost {@link SyncService.endUpdate}. */
interface PendingColBuild {
    source: ColumnEventType;
    newColDefs: boolean;
    defaultsChanged: boolean;
    resetOrder: boolean;
}

/** The option's change redefines every column from its definition. */
const COLUMN_OPTION_FLAG_REBUILD = 0x00000001;
/** The option's change reassembles the columns shown. */
const COLUMN_OPTION_FLAG_REFRESH = 0x00000002;
/** The options {@link ColumnModel.applyOptions} applies, each with what follows it; 0 for one it reads by name. */
const COLUMN_OPTION_FLAGS: { readonly [K in keyof GridOptions]?: number } = {
    columnDefs: 0,
    pivotMode: 0,
    dataTypeDefinitions: COLUMN_OPTION_FLAG_REBUILD,
    defaultColDef: COLUMN_OPTION_FLAG_REBUILD,
    defaultColGroupDef: COLUMN_OPTION_FLAG_REBUILD,
    columnTypes: COLUMN_OPTION_FLAG_REBUILD,
    suppressFieldDotNotation: COLUMN_OPTION_FLAG_REBUILD,
    treeData: COLUMN_OPTION_FLAG_REFRESH,
    groupDisplayType: COLUMN_OPTION_FLAG_REFRESH,
    treeDataDisplayType: COLUMN_OPTION_FLAG_REFRESH,
    groupHideOpenParents: COLUMN_OPTION_FLAG_REFRESH,
    hidePaddedHeaderRows: COLUMN_OPTION_FLAG_REFRESH,
    groupHideColumnsUntilExpanded: 0,
    autoGroupColumnDef: 0,
    selectionColumnDef: 0,
    accentedSort: 0,
};
const COLUMN_OPTIONS = Object.keys(COLUMN_OPTION_FLAGS) as (keyof GridOptions)[];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    public pivotMode = false;
    public ready = false;
    public showingPivotResult = false;

    /** Set when a staged change needs a display rebuild; cleared by the refresh or the rebuild that satisfies it. */
    private pendingRefresh = false;
    /** The source of the legacy `columnEverythingChanged` an update owes, raised once with its layout events. */
    private pendingEverythingSource: ColumnEventType | null = null;
    /** Set by a refresh changing the grid's columns: raised after the call's column events, before `modelUpdated`. */
    private gridColumnsChangedOwed = false;
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
    /** The `accentedSort` the version was last bumped for. */
    private appliedAccentedSort: GridOptions['accentedSort'];
    /** The comparator for the `accentedSort` grid option, shared by the columns without their own. */
    public gridStringComparator: StringComparator | undefined = undefined;
    /** The {@link accentedSortVersion} {@link gridStringComparator} was built for; `-1` until built. */
    public gridStringComparatorVersion = -1;
    public colDefTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colDefTreeDepth = 0;
    public hasMarryChildren = false;

    /** Single source of truth for `getCol`. Pivot result colIds are namespaced (`pivot_…`). */
    public colsById: { [id: string]: AgColumn } = Object.create(null);

    public colDefGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** The last build of the colDefs, set before `ready`: the next build's reuse input and its sweep's. */
    private colDefBuild: ColumnTreeBuild | null = null;
    /** The row group columns the last {@link refreshCols} made the auto columns from: a new array once they change. */
    private assembledRowGroupCols: readonly AgColumn[] | undefined = undefined;

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

    /** Persistent padding-group cache for hierarchy virtual cols, read by each primary column-tree build
     *  so `(col, depth)`-stable wrappers survive rebuilds. Owns the padding-group bean lifecycle. */
    public hierarchyWrapperCache: ColWrapperCache;

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');
        this.hierarchyWrapperCache = new ColWrapperCache(this.beans);

        this.appliedAccentedSort = this.gos.get('accentedSort');
    }

    /** Adds the options one column update applies: its own, the header cells' and each column service's. */
    public addOptionKeysTo(keys: Set<keyof GridOptions>): void {
        const beans = this.beans;
        for (let i = 0, len = COLUMN_OPTIONS.length; i < len; ++i) {
            keys.add(COLUMN_OPTIONS[i]);
        }
        for (let i = 0, len = HEADER_OPTIONS.length; i < len; ++i) {
            keys.add(HEADER_OPTIONS[i]);
        }
        beans.selectionColSvc?.addOptionKeysTo(keys);
        beans.rowNumbersSvc?.addOptionKeysTo(keys);
        beans.calculatedColsSvc?.addOptionKeysTo(keys);
        beans.formula?.addOptionKeysTo(keys);
    }

    /** Applies an options change inside its column update; a grid waiting for columns starts its rows with them. */
    public applyOptions(changedProps: ReadonlySet<keyof GridOptions>, source: ColumnEventType): void {
        const beans = this.beans;
        const { autoColSvc, selectionColSvc, rowNumbersSvc, syncSvc } = beans;
        const gos = this.gos;
        const colDefs = changedProps.has('columnDefs') ? gos.get('columnDefs') : undefined;
        if (changedProps.has('pivotMode')) {
            // first in every call, refreshed and told at once, as the other options read the mode
            this.setPivotMode(gos.get('pivotMode'), source, !colDefs);
        }
        if (changedProps.has('accentedSort')) {
            // before the rows sort; an equal value a framework re-creates keeps the comparators
            const accentedSort = gos.get('accentedSort');
            if (!_mergedEqual(accentedSort, this.appliedAccentedSort)) {
                ++this.accentedSortVersion;
                syncSvc.changes.rowChanges.sortComparators = true;
            }
            this.appliedAccentedSort = accentedSort;
        }
        const autoGroupColumnDef = changedProps.has('autoGroupColumnDef');
        beans.valueSvc.applyOptions(changedProps);
        // before the build: the definitions it makes read whether sorting a grouped column sorts its groups
        beans.rowNodeSorter?.applyOptions(changedProps);
        beans.dataTypeSvc?.applyOptions(changedProps);
        let flags = 0;
        for (const property of changedProps) {
            flags |= COLUMN_OPTION_FLAGS[property] ?? 0;
        }
        const rebuild = (flags & COLUMN_OPTION_FLAG_REBUILD) !== 0;
        // a build of new definitions re-derives the auto columns and applies their state itself
        const autoColDefApplied = autoGroupColumnDef && !rebuild && !colDefs;
        if (autoColDefApplied) {
            // before any step below redefines them: the rows follow what the option changed of their sort and filter
            autoColSvc?.applyAutoGroupColumnDef(source);
        }
        const selectionChanged = !!selectionColSvc?.applyOptions(changedProps);
        // before the definitions' build: its calculated column events compare with the definitions before the call
        const calculatedRebuild = !!beans.calculatedColsSvc?.applyOptions(changedProps);
        // a build of the definitions, or the calculated columns' own, reassembles the columns as a refresh would
        let refresh =
            !colDefs &&
            !(calculatedRebuild && !rebuild) &&
            (selectionChanged ||
                (flags & COLUMN_OPTION_FLAG_REFRESH) !== 0 ||
                !!beans.formula?.applyOptions(changedProps));
        // a grid created without columns starts its rows with them, once they hold this call's options and rowData
        const rowsStarted = !!colDefs && syncSvc.waitingForColumns;
        if (rowsStarted) {
            syncSvc.setColumnsAndData(colDefs);
        } else if (colDefs) {
            // with new defaults too, one build redefines every column from both
            this.setColumnDefs(colDefs, source, rebuild || autoGroupColumnDef);
        }
        refresh = !!rowNumbersSvc?.applyOptions(changedProps, source) || refresh;
        if (rebuild && !colDefs && this.ready) {
            // the build reassembles the service columns and refreshes the visible ones, as a staged refresh would
            this.pendingRefresh = false;
            // a strict pivot order is reset by a configuration change; any other order the user made is kept
            const resetOrder = this.showingPivotResult && !!gos.get('enableStrictPivotColumnOrder');
            this.buildFromColDefs(source, true, true, resetOrder, false);
        } else if (calculatedRebuild && !colDefs) {
            // the option's own build, told as an options change however it was set
            beans.calculatedColsSvc?.rebuildColsAndValidate('gridOptionsChanged');
        } else if (refresh) {
            this.refreshAll(source);
        }
        // after the columns are final: their state pass slides them, which must not hold the refresh above
        if (autoColDefApplied) {
            autoColSvc?.applyColDefState(source);
        }
        if (changedProps.has('selectionColumnDef')) {
            selectionColSvc?.refreshColDef(source);
        }
        if (changedProps.has('groupHideColumnsUntilExpanded')) {
            autoColSvc?.updateColumnVisibility();
        }
    }

    public override destroy(): void {
        _destroyColumnTreeAll(this.colDefBuild);
        this.hierarchyWrapperCache.destroy();
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
     *  `silent`: no calculated column events. */
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
        const {
            valueCache,
            colAutosize,
            rowGroupColsSvc,
            pivotColsSvc,
            valueColsSvc,
            visibleCols,
            eventSvc,
            calculatedColsSvc,
            syncSvc,
        } = beans;

        // only dispatch before/after events when updating an existing column model, not on first set.
        const colDefs = this.colDefs;
        const stateChanges = this.ready ? captureColumnStateChanges(beans) : undefined;
        valueCache?.expire(); // new ids may collide with old ids, so cached values would be wrong for new cols

        syncSvc.beginUpdate();
        try {
            if (stateChanges) {
                beans.colAnimation?.startWidthAnimation();
            }
            this.buildingCols = true;
            this.tokenBeforeColDefsBuild = this.buildTokenCounter;
            const builder = _buildColumnTree(
                beans,
                /* defs */ colDefs!, // set by setColumnDefs before any build: the other callers wait for `ready`
                /* primaryColumns */ true,
                /* previous */ this.colDefBuild,
                /* source */ source,
                /* newColDefs */ newColDefs
            );

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
            // at once: a first build's `newColumnsLoaded` applies the initial state over the flexed widths
            visibleCols.refresh(source, false);
            // the model is whole again: a listener notified below may rebuild at once
            this.buildingCols = false;

            this.stageEverythingChanged(source);

            if (stateChanges) {
                dispatchColStateChanges(beans, source, stateChanges);
            }

            syncSvc.changes.newColumnsLoaded();
            this.raiseGridColumnsChanged();
            if (this.showingPivotResult) {
                // the pivot result columns shown are kept, so no grid columns change drops a removed column's filter
                beans.colFilter?.onColumnsChanged();
            }
            eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });
            calculatedColsSvc?.onColumnsLoaded(source, silent);

            if (source === 'gridInitializing') {
                colAutosize?.applyAutosizeStrategy();
            }
        } finally {
            this.buildingCols = false; // after a throw too
            syncSvc.endUpdate();
        }
    }

    /** Raises the row group, value or pivot event for `columns`; the rows refresh for it as the column update ends. */
    public dispatchColumnChangedEvent(
        type: ColumnChangedEventType,
        columns: AgColumn[],
        source: ColumnEventType
    ): void {
        const change = this.beans.syncSvc.changes;
        if (type === 'columnRowGroupChanged') {
            change.rowGroupsChanged();
        } else if (type === 'columnValueChanged') {
            change.valuesChanged();
        } else {
            change.pivotChanged(source);
        }
        this.eventSvc.dispatchEvent({
            type,
            columns,
            column: columns.length === 1 ? columns[0] : null,
            source,
        } as WithoutGridCommon<ColumnEvent>);
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

    /** Raises the owed `gridColumnsChanged`. */
    public raiseGridColumnsChanged(): void {
        if (!this.gridColumnsChangedOwed) {
            return;
        }
        this.gridColumnsChangedOwed = false;
        this.eventSvc.dispatchEvent({ type: 'gridColumnsChanged' });
        this.beans.colFilter?.onColumnsChanged(); // after the event, so its filterChanged follows gridColumnsChanged
    }

    /** A settle pass's raise before its rows refresh: client-side pivot rows raise it from that refresh instead. */
    public raiseGridColumnsChangedBeforeRows(): void {
        if (this.gridColumnsChangedOwed && this.pivotMode && _isClientSideRowModel(this.gos)) {
            this.beans.colFilter?.onColumnsChanged(); // the filters of removed columns leave before that refresh
        } else {
            this.raiseGridColumnsChanged();
        }
    }

    /** Raises the owed `columnEverythingChanged`; called by a settle pass and as the outermost update ends. */
    public raiseEverythingChanged(): void {
        const source = this.pendingEverythingSource;
        if (source !== null) {
            this.pendingEverythingSource = null;
            this.eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
        }
    }

    /** Whether a settle pass has staged column changes to run or a deferred grid-level column event to raise. */
    public isSettleOwed(): boolean {
        // a staged refresh always has its source staged
        const staged = this.pendingBuild !== null || this.pendingChangesSource !== null;
        return staged || this.gridColumnsChangedOwed || this.pendingEverythingSource !== null;
    }

    /** The columns' part of a settle pass: a staged build, then the staged refresh and the role dispatches. */
    public settleColChanges(): void {
        const beans = this.beans;
        const pending = this.pendingBuild;
        if (pending !== null) {
            try {
                const { source, newColDefs, defaultsChanged, resetOrder } = pending;
                this.buildFromColDefs(source, newColDefs, defaultsChanged, resetOrder, false);
            } finally {
                // a request a callback makes in the staged build is dropped: one asking in every build would never end
                this.pendingBuild = null;
            }
        }
        const source = this.pendingChangesSource;
        if (source !== null) {
            const { rowGroupColsSvc, pivotColsSvc, valueColsSvc } = beans;
            this.pendingChangesSource = null;
            if (this.pendingRefresh) {
                // a rebuild slides its reflow from the columns' old spots; inert when nothing moves
                beans.colAnimation?.start();
                this.refreshAll(source); // clears pendingRefresh
            }
            rowGroupColsSvc?.dispatchColChange(source);
            pivotColsSvc?.dispatchColChange(source);
            valueColsSvc?.dispatchColChange(source);
        }
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
        // Pivot-sort reorders existing columns, so reuse the column-move animation to slide them.
        const animatePivotSort = this.isPivotSortReorder();
        if (animatePivotSort) {
            beans.colAnimation?.start();
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
        this.assembledRowGroupCols = beans.rowGroupColsSvc?.columns;
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
                colsById[col.colId] = col;
                col.inColsList = true;
                colsTree[i] = serviceWrapperCache.wrap(col, sourceTreeDepth, buildToken);
            }
            serviceWrapperCache.evict(buildToken);
        } else {
            serviceWrapperCache.destroy();
            for (let i = 0; i < serviceColsLen; ++i) {
                const col = colsList[i];
                colsById[col.colId] = col;
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
        this.showingPivotResult = showingPivotResult;
        this.colsTreeDepth = sourceTreeDepth;
        this.hasMarryChildren = sourceBuild.marryChildren;
        this.colsGroupsById = sourceBuild.groupsById;
        const allGroups = sourceBuild.allGroups;
        if (allGroups !== this.colsAllGroups) {
            this.colsAllGroups = allGroups;
            beans.syncSvc.changes.columnGroupState = true; // the grid state lists the groups
        }
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
        this.prevPivotStrict = showingPivotResult && (beans.pivotColsSvc?.isStrictColumnOrder() ?? false);
        // An active interactive pivotSort forces strict pivot column order, overriding sticky-order preservation.
        const restoreOrder = !resetOrder || _shouldMaintainColumnOrder(gos, showingPivotResult);
        const lastOrder = showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        let prevOrder = restoreOrder ? lastOrder : null;
        // pivotSort reorders the groups but keeps the user's within-group order and widths: re-rank the
        // preserved order by the freshly-sorted group order rather than discarding it.
        const pivotColsSvc = beans.pivotColsSvc;
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
            beans.syncSvc.changes.columnState = true;
        }
        this.colsList = colsListChanged ? finalColsList : oldColsList;
        this.colsTree = _areEqual(colsTree, prevColTree) ? prevColTree : colsTree;
        this.colsById = colsById;
        this.invalidateColsDerivedState();
        // a visibility change alone reaches it as the changes flush
        beans.quickFilter?.refreshCols();
        this.refreshColsDerivedState();
        if (colsListChanged) {
            beans.rowSpanSvc?.refreshCols();
            // Last: the purge dispatches synchronously, so a listener must not see a half-rebuilt model.
            beans.editSvc?.releaseColumnsLeaving(finalColsList);
        }
        if (this.colsTree !== prevColTree || colsListChanged) {
            this.gridColumnsChangedOwed = true;
        }
    }

    /** True when this refresh reorders pivot columns due to an interactive pivot sort - either a sort is active,
     *  or the prior refresh was a strict pivot-sort order being cleared (desc→null) back to the default order. */
    private isPivotSortReorder(): boolean {
        return !!this.beans.pivotColsSvc?.hasInteractivePivotSort() || this.prevPivotStrict;
    }

    /** A column state apply's refresh: the assembly is skipped only where nothing it re-derives reads column state. */
    public refreshColsForState(source: ColumnEventType): void {
        const { rowGroupColsSvc, autoColSvc, formula } = this.beans;
        if (
            this.pivotMode ||
            this.pendingRefresh ||
            formula !== undefined ||
            this.assembledRowGroupCols !== rowGroupColsSvc?.columns ||
            (autoColSvc !== undefined && autoColSvc.columns.length > 0)
        ) {
            this.refreshCols(false, source);
        } else {
            this.invalidateColsDerivedState();
            this.refreshColsDerivedState();
        }
    }

    /** Refresh state derived from `colsList` (group cols) and
     *  reset displayed-col cache + header rows, ahead of `visibleCols.refresh`. Shared by full refreshCols
     *  and by a visibility-only change (which leaves `colsList` unchanged, so skips the rebuild). */
    public refreshColsDerivedState(): void {
        const beans = this.beans;
        beans.showRowGroupCols?.refresh();
        beans.visibleCols.clear();
        beans.colViewport.invalidateHeaderRows();
    }

    /** Full refresh (rebuild cols + recompute visible), in its own column update. */
    public refreshAll(source: ColumnEventType): void {
        this.pendingRefresh = false; // consumed: this refresh satisfies the pending request
        if (!this.ready) {
            return;
        }
        // one update, so the auto columns it redefines are told once laid out
        const { syncSvc, visibleCols } = this.beans;
        syncSvc.beginUpdate();
        try {
            this.refreshCols(false, source);
            visibleCols.markLayoutOwed(source);
        } finally {
            syncSvc.endUpdate();
        }
    }

    /** Reorder `colDefList` only — `newList` MUST be a permutation of the existing col instances
     *  (caller owns the invariant). A full refresh should follow to propagate to display cols.
     *  `colsById` unchanged; `getAllCols` is order-agnostic. */
    public replaceColDefList(newList: AgColumn[]): void {
        if (this.ready) {
            this.colDefList = newList;
        }
    }

    /** `refresh`: false when a build of new definitions in the same update assembles the columns. */
    private setPivotMode(pivotMode: boolean, source: ColumnEventType, refresh: boolean): void {
        if (pivotMode === this.pivotMode) {
            return;
        }
        const { syncSvc, pivotResultCols, visibleCols } = this.beans;
        try {
            // the changes a deferred `columnMoved` waits for, before the pivot mode it was captured in changes
            if (syncSvc.changes.rowChanges.columnsMoved) {
                syncSvc.flushChanges();
            }
        } finally {
            this.pivotMode = pivotMode;
            if (this.ready) {
                // Refresh in case the auto-group col must be added/removed: with `groupDisplayType: 'custom'`
                // it's only used in pivot mode (where it's mandatory).
                if (!pivotMode && pivotResultCols?.pivotCols && !pivotResultCols.suppliedColDefs) {
                    // the grid's own result columns go in this refresh, which the rows' refresh would drop in a second
                    pivotResultCols.setPivotResultCols(null, source);
                } else if (refresh) {
                    this.refreshCols(false, source);
                    visibleCols.markLayoutOwed(source);
                }
                syncSvc.changes.pivotModeChanged();
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

    /** The id a grid column created now takes: `colId`, or its first free `_1`, `_2`… suffix when a defined or pivot
     *  result column, or one of `claimed`, holds it (warning 273). The column created first keeps its id. */
    public getServiceColId(colId: string, claimed: ReadonlySet<string> | null): string {
        if (!this.isTakenServiceColId(colId, claimed)) {
            return colId;
        }
        let suffix = 1;
        let id = `${colId}_1`;
        while (this.isTakenServiceColId(id, claimed)) {
            id = `${colId}_${++suffix}`;
        }
        this.beans.log.warn(273, { providedId: colId, usedId: id });
        return id;
    }

    private isTakenServiceColId(colId: string, claimed: ReadonlySet<string> | null): boolean {
        return this.isDefinedColId(colId) || claimed?.has(colId) === true;
    }

    /** Whether a column of the definitions or a pivot result column holds `colId`. */
    private isDefinedColId(colId: string): boolean {
        const colDefBuild = this.colDefBuild;
        if (colDefBuild !== null && buildHasColId(colDefBuild, colId)) {
            return true;
        }
        const pivotResultCols = this.beans.pivotResultCols;
        const pivotBuild = pivotResultCols?.pivotCols != null ? pivotResultCols.pivotBuild : null;
        return pivotBuild != null && buildHasColId(pivotBuild, colId);
    }

    /** Full structural rebuild from current `colDefs` + all contributors (hierarchy, calc cols, …), for a contributor
     *  changing the tree structure. */
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
        this.beans.syncSvc.changes.columnState = true;
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

const snapshotCols = (list: AgColumn[], out?: AgColumn[] | null): AgColumn[] => {
    const len = list.length;
    out ??= [];
    out.length = len;
    for (let i = 0; i < len; ++i) {
        out[i] = list[i];
    }
    return out;
};

const buildHasColId = (build: ColumnTreeBuild, colId: string): boolean => {
    let ids = build.colIds;
    if (ids === null) {
        ids = new Set();
        const cols = build.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            ids.add(cols[i].colId);
        }
        build.colIds = ids;
    }
    return ids.has(colId);
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
