import type { AgEvent, AgPropertyChangeSet, AgPropertyChangedSource } from 'ag-stack';

import type { ColumnAnimationService } from './columnMove/columnAnimationService';
import type { ColumnModel } from './columns/columnModel';
import type { ColumnStateChanges } from './columns/columnStateUtils';
import { dispatchColumnMoved } from './columns/columnStateUtils';
import { _convertColumnEventSourceType } from './columns/columnUtils';
import type { VisibleColsService } from './columns/visibleColsService';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { CtrlsService } from './ctrlsService';
import type { RowDragService } from './dragAndDrop/rowDragService';
import type { ColDef, ColGroupDef } from './entities/colDef';
import type { GridOptions } from './entities/gridOptions';
import type { ColumnEventType, ColumnStateUpdatedEvent } from './events';
import type { FilterManager } from './filter/filterManager';
import { GridChanges, HEADER_CHANGE_FLAG_SHOW_VALUES_AS, RowChanges } from './gridChanges';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { IFormulaService } from './interfaces/formulas';
import type { IRowModel } from './interfaces/iRowModel';
import type { StateService } from './misc/state/stateService';
import type { RowRenderer } from './rendering/rowRenderer';
import { _logIfDebug } from './utils/log';

/** A column or provided column group, whose own events a column update queues. */
export interface ColEventOwner {
    /** Its last entry in the queue, or a stale index into an emptied one; never negative, to read in bounds. */
    lastQueuedEventAt: number;
    isAlive(): boolean;
    dispatchLocalEvent(event: AgEvent<string>): void;
}
type QueuedColEvents = (ColEventOwner | AgEvent<string> | number)[];

/** Starts the columns and rows, then runs each column update: its column events queued, its rows refreshed once. */
export class SyncService extends BeanStub implements NamedBean {
    beanName = 'syncSvc' as const;

    /** Set while a grid created without columns waits for its first `columnDefs` to start its rows. */
    public waitingForColumns: boolean = false;

    /** >0 between {@link beginUpdate} and {@link endUpdate}, queueing the column events raised and deferring the
     *  role changes staged. */
    public updateDepth = 0;
    /** What changed that its readers have not followed, each taking its part at its own point. */
    public readonly changes = new GridChanges();
    /** The column definitions' version the last settle pass followed; none before the first. */
    private settledColDefsVersion = -1;
    /** The options change sets applied: each is told once per changed option. */
    private readonly appliedChangeSets = new WeakSet<AgPropertyChangeSet<GridOptionsWithDefaults>>();
    /** The options whose change is a column update: the column model's, the header cells' and each column service's. */
    private readonly columnOptionKeys = new Set<keyof GridOptions>();
    /** The changed options of the call generating its columns: an option set meanwhile joins them. */
    private joiningProps: Set<keyof GridOptions> | null = null;
    /** Each queued column or group, its event and the index of its previous entry (`-1` for none): nothing allocated
     *  per event. */
    private readonly queuedColEvents: QueuedColEvents = [];
    /** While the queue is raised, the index past the event being raised, so a change to an owner already told queues
     *  anew. */
    private colEventsRaisingAt = 0;

    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;
    private rowModel: IRowModel;
    private rowRenderer: RowRenderer;
    private ctrlsSvc: CtrlsService;
    private formula: IFormulaService | undefined;
    private filterManager: FilterManager | undefined;
    private colAnimation: ColumnAnimationService | undefined;
    private stateSvc: StateService | undefined;
    private rowDragSvc: RowDragService | undefined;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
        this.rowModel = beans.rowModel;
        this.rowRenderer = beans.rowRenderer;
        this.ctrlsSvc = beans.ctrlsSvc;
        this.formula = beans.formula;
        this.filterManager = beans.filterManager;
        this.colAnimation = beans.colAnimation;
        this.stateSvc = beans.stateSvc;
        this.rowDragSvc = beans.rowDragSvc;
    }

    public postConstruct(): void {
        const autoGenColsSvc = this.beans.autoGenColsSvc;
        autoGenColsSvc?.generateColumns(true);
        const columnKeys = this.columnOptionKeys;
        this.colModel.addOptionKeysTo(columnKeys);
        const keys = new Set(columnKeys);
        autoGenColsSvc?.addOptionKeysTo(keys);
        this.rowModel.addOptionKeysTo?.(keys);
        this.addManagedPropertyListeners([...keys], (event) => this.applyOptions(event.changeSet, event.source));
    }

    /** Applies an options change once: its row options alone, or one column update for its columns and rows. */
    private applyOptions(
        changeSet: AgPropertyChangeSet<GridOptionsWithDefaults> | undefined,
        eventSource: AgPropertyChangedSource
    ): void {
        const applied = this.appliedChangeSets;
        // the set's first run applies every option it changed
        if (!changeSet || applied.has(changeSet)) {
            return;
        }
        applied.add(changeSet);
        const properties = changeSet.properties;
        const joiningProps = this.joiningProps;
        if (joiningProps !== null) {
            for (let i = 0, len = properties.length; i < len; ++i) {
                joiningProps.add(properties[i]);
            }
            return;
        }
        const { rowModel, colModel } = this;
        const autoGenColsSvc = this.beans.autoGenColsSvc;
        const changedProps = new Set(properties);
        let generated = false;
        if (autoGenColsSvc?.isGenerateOwed(changedProps)) {
            // first: the `columnDefs` it sets, and an option its callback sets, are applied as this call's own
            this.joiningProps = changedProps;
            try {
                generated = autoGenColsSvc.generateColumns(false);
            } finally {
                this.joiningProps = null;
            }
        }
        const columnKeys = this.columnOptionKeys;
        let columnUpdate = false;
        for (const property of changedProps) {
            if (columnUpdate) {
                break;
            }
            columnUpdate = columnKeys.has(property);
        }
        if (!columnUpdate) {
            rowModel.applyOptions?.(changedProps);
            return;
        }
        // before the update, whose header pass reads it: what its event raises is not held
        this.beans.advancedFilter?.applyOptions(changedProps);
        this.beginUpdate();
        try {
            const rowsWaiting = this.waitingForColumns;
            if (rowsWaiting) {
                // rows not started hold the call's options and rowData for the columns that start them
                rowModel.applyOptions?.(changedProps);
            }
            // generated columns are told as an options change, whoever set their rowData
            colModel.applyOptions(
                changedProps,
                _convertColumnEventSourceType(generated ? 'optionsUpdated' : eventSource)
            );
            // after the build, so a row refreshed on its new data reads the new columns
            if (!rowsWaiting) {
                rowModel.applyOptions?.(changedProps);
            }
            this.changes.headerOptionsChanged(changedProps);
        } finally {
            this.endUpdate();
        }
        if (changedProps.has('rowNumbers')) {
            // after the update's layout events, which a resize's `columnResized` follows
            this.beans.rowNumbersSvc?.fitUnfittedColumn();
        }
    }

    /** Queues the column events raised, and defers the role changes staged, until the matching {@link endUpdate},
     *  so an update's listeners see every column it changes final. Nests: the outermost end runs them all. */
    public beginUpdate(): void {
        ++this.updateDepth;
    }

    /** Call from a `finally`. The outermost end settles staged changes and raises queued column events, then the
     *  layout events, after a throw too; a throw drops the queue, and what stays staged runs at the next end. */
    public endUpdate(): void {
        const depth = this.updateDepth;
        if (depth > 1) {
            this.updateDepth = depth - 1;
            return;
        }
        // held at 1 while it ends, so what a listener changes joins this update; an unmatched close still runs it
        this.updateDepth = 1;
        const { colModel, visibleCols, formula, queuedColEvents, changes } = this;
        try {
            let raised = 0;
            while (true) {
                const colDefsVersion = colModel.colDefsVersion;
                // each owner of pending state answers for its own: an update with nothing to settle runs no pass
                if (
                    colDefsVersion !== this.settledColDefsVersion ||
                    colModel.isSettleOwed() ||
                    changes.rowChanges.isFlushOwed() ||
                    visibleCols.isGridLayoutOwed() ||
                    formula?.isColRefreshOwed()
                ) {
                    // one settle pass: the staged columns, the recorded changes' readers, then the grid layout events
                    colModel.settleColChanges();
                    colModel.raiseGridColumnsChangedBeforeRows();
                    // the rows this pass's refresh makes draw its redefined columns
                    const rowRenderer = this.rowRenderer;
                    const rowsMade = rowRenderer.rowCtrlsMade;
                    this.flushChanges();
                    // owed when no rows refresh raised it
                    this.settleRefreshedColumns();
                    // the columns the pass redefined, before their colDefChanged
                    rowRenderer.refreshRedefinedCells(rowsMade);
                    formula?.refreshCellsForColChanges();
                    visibleCols.raiseDeferredGridLayoutEvents();
                    colModel.raiseEverythingChanged();
                    this.settledColDefsVersion = colDefsVersion;
                } else if (raised < queuedColEvents.length) {
                    const at = raised;
                    raised += 3;
                    this.colEventsRaisingAt = raised;
                    const owner = queuedColEvents[at] as ColEventOwner;
                    // one destroyed since it was queued has dropped its listeners
                    if (owner.isAlive()) {
                        owner.dispatchLocalEvent(queuedColEvents[at + 1] as AgEvent<string>);
                    }
                } else {
                    break;
                }
            }
        } finally {
            this.colEventsRaisingAt = 0;
            queuedColEvents.length = 0;
            this.updateDepth = 0;
            // after a throw too: a call changing no column would leave the cells unlaid and the animations open
            try {
                // owed by changes no pass settled: a reset's formula cells, a listener's hide's events
                visibleCols.flushLayout();
                formula?.refreshCellsForColChanges();
                visibleCols.raiseDeferredLayoutEvents();
                colModel.raiseEverythingChanged();
                this.applyHeaderChanges();
            } finally {
                // the animations last, so every layout the update made animates
                this.colAnimation?.finish();
                this.stateSvc?.refreshColumnState(changes);
            }
        }
    }

    /** Raises `columnMoved` for a state change: after the rows' refresh when it rebuilds the pivot result columns. */
    public columnMovedAfterRows(source: ColumnEventType, changes: ColumnStateChanges): void {
        const rowChanges = this.changes.rowChanges;
        if (this.colModel.pivotMode && rowChanges.isColumnsChange()) {
            rowChanges.columnsMoved ??= { source, changes };
        } else {
            dispatchColumnMoved(this.beans, source, changes);
        }
    }

    /** Refreshes the rows for a filter change: at once, or as the open column update ends. */
    public filterChanged(modelChanged: boolean, primary: boolean): void {
        this.changes.filterChanged(modelChanged, primary);
        if (this.updateDepth === 0) {
            this.flushChanges();
        }
    }

    /** The header cells follow a show-values mode or grouping change: at once, or as the open column update ends. */
    public showValuesAsChanged(): void {
        this.changes.headerChanges |= HEADER_CHANGE_FLAG_SHOW_VALUES_AS;
        if (this.updateDepth === 0) {
            this.flushChanges();
        }
    }

    /** The header cells follow what no layout walked their rows for: as the update ends, or outside one. */
    private applyHeaderChanges(): void {
        const headerChanges = this.changes.takeHeaderChanges();
        if (headerChanges !== 0) {
            this.ctrlsSvc.getHeaderRowContainerCtrl()?.applyGridChanges(headerChanges);
        }
    }

    /** The columns a rows refresh built are told, then laid out: before `modelUpdated`, and after a pass's rows. */
    public settleRefreshedColumns(): void {
        this.colModel.raiseGridColumnsChanged();
        this.visibleCols.flushLayout();
    }

    /** Flushes the recorded changes to their readers: filters, formulas, the one row refresh owed; outside an update,
     *  the header cells. */
    public flushChanges(): void {
        const changes = this.changes;
        const change = changes.rowChanges;
        if (this.updateDepth > 0) {
            // formulas and filters follow the update's column changes first, so this refresh reads and re-filters them
            this.formula?.refreshForColChanges();
            this.filterManager?.applyRowChanges(change);
            // read once: they owe the rows nothing
            change.columnsVisible = false;
            change.dataTypesInferred = false;
        }
        // set only with a columns change: the record is replaced below
        const columnsMoved = change.columnsMoved;
        const rowsOwed = change.isRowsRefreshOwed();
        if (rowsOwed) {
            // the refresh takes them: what it records owes the next one
            changes.rowChanges = new RowChanges();
        }
        try {
            if (!rowsOwed) {
                return;
            }
            const rowsMade = this.rowRenderer.rowCtrlsMade;
            this.rowModel.refreshAfterChange?.(change);
            this.rowDragSvc?.refreshAfterChange(change);
            if (change.rowGroups) {
                this.rowRenderer.refreshShowRowGroupCells(rowsMade);
            }
            if (change.rowGroups || change.pivot || change.pivotMode || change.columnsLoaded) {
                // a regroup or repivot opens or resets group nodes silently
                this.stateSvc?.onRowGroupsChanged();
            }
        } finally {
            try {
                // after the rows, a failed refresh too; inside an update, its layout or its end follows them
                if (this.updateDepth === 0) {
                    this.applyHeaderChanges();
                }
            } finally {
                if (columnsMoved) {
                    dispatchColumnMoved(this.beans, columnsMoved.source, columnsMoved.changes);
                }
            }
        }
    }

    /** Raises a column's or group's own event, at once or as the open update ends: there an owner is told once per
     *  type (and state key), in its first event's place, with its latest. */
    public raiseColEvent(owner: ColEventOwner, event: AgEvent<string>): void {
        if (this.updateDepth === 0) {
            owner.dispatchLocalEvent(event);
            return;
        }
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

    public start(): void {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.ctrlsSvc.whenReady(this, () => {
            const gos = this.gos;
            const columnDefs = gos.get('columnDefs');
            if (columnDefs) {
                this.setColumnsAndData(columnDefs);
            } else {
                this.waitingForColumns = true;
            }
            this.eventSvc.dispatchEvent({ type: 'gridReady' });
            _logIfDebug(gos, `initialised successfully, enterprise = ${gos.isModuleRegistered('EnterpriseCore')}`);
        });
    }

    /** Starts the grid's columns and rows with its first `columnDefs`. */
    public setColumnsAndData(columnDefs: (ColDef | ColGroupDef)[]): void {
        this.waitingForColumns = false;
        this.colModel.setColumnDefs(columnDefs, 'gridInitializing', false);
        // the build's row refresh is owed to rows not started yet: their start refreshes them
        this.flushChanges();
        this.rowModel.start();
    }
}
