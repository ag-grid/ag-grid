import { _debounce, _getInnerWidth, _jsonEquals, _removeFromArray } from 'ag-stack';

import { dispatchColumnResizedEvent } from '../columns/columnEventUtils';
import { getWidthOfColsInList, isSpecialCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { AgEventTypeParams, ColumnEventType } from '../events';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type {
    AutoSizeStrategy,
    AutoSizeStrategyEvent,
    IColumnLimit,
    ISizeAllColumnsToContentParams,
    ISizeColumnsToFitParams,
    SizeColumnsToContentColumnLimits,
    SizeColumnsToContentStrategy,
} from '../interfaces/autoSize';
import { MIN_CENTER_VIEWPORT_WIDTH } from '../pinnedColumns/pinnedColumnService';
import { _clamp } from '../utils/number';
import { TouchListener } from '../widgets/touchListener';

interface AutoSizeColumnParams {
    colKeys: ColKey[];
    skipHeader?: boolean;
    skipHeaderGroups?: boolean;
    stopAtGroup?: AgColumnGroup;
    defaultMinWidth?: number;
    defaultMaxWidth?: number;
    columnLimits?: SizeColumnsToContentColumnLimits[];
    scaleUpToFitGridWidth?: boolean;
    source?: ColumnEventType;
    /** Source reported by the resulting `columnResized` event. Defaults to `autosizeColumns`. */
    eventSource?: ColumnEventType;
}

type UiActionAutoSizeParams = Omit<ISizeAllColumnsToContentParams, 'colIds'>;

type AutoSizeAllColumnsParams = UiActionAutoSizeParams &
    Pick<AutoSizeColumnParams, 'source' | 'eventSource'> & {
        /** Columns to leave at their current width, resolved after any deferred resize queue drains. */
        excludeColIds?: Set<string>;
    };

type SizeColumnsToFitParams = ISizeColumnsToFitParams & {
    colKeys?: ColKey[];
    onlyScaleUp?: boolean;
    animate?: boolean;
    /** Called once the sizing has actually been applied, which may be several timeouts later. */
    onComplete?: () => void;
};

type SizeColumnsToFitGridBodyParams = ISizeColumnsToFitParams & Pick<SizeColumnsToFitParams, 'colKeys' | 'onComplete'>;

/** The source a resize driven from the header UI reports; a finished one is a manual column width. */
const UI_RESIZE_SOURCE: ColumnEventType = 'uiColumnResized';
const STRATEGY_SOURCE: ColumnEventType = 'autosizeStrategy';
/** Sources that mean a sizing pass caused the event, so a strategy re-run would chase its own tail. */
// declared as `ColumnEventType` so a typo is caught, read as `string` because not every event's
// `source` is a `ColumnEventType`
const SIZING_SOURCES: ReadonlySet<string> = new Set<ColumnEventType>([
    STRATEGY_SOURCE,
    'autosizeColumns',
    'sizeColumnsToFit',
]);
/** Back-to-back event-driven runs beyond this are a feedback loop, not a settling grid. */
const MAX_CONSECUTIVE_STRATEGY_RUNS = 10;
/** A run whose sizing never lands must not silence event-driven re-runs for the grid's lifetime. */
const STRATEGY_RUN_TIMEOUT = 5000;
/** Longer than the re-run debounce, so a run's own echo lands inside the chain rather than after it. */
const STRATEGY_QUIET_DELAY = 100;

export class ColumnAutosizeService extends BeanStub implements NamedBean {
    beanName = 'colAutosize' as const;

    private timesDelayed = 0;

    /** when we're waiting for cell data types to be inferred, we need to defer column resizing */
    public shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

    /** Columns the user has resized by hand, which strategy re-runs leave at their manual width. */
    private readonly userResizedColIds = new Set<string>();
    /** Non-zero while strategy runs are in flight; a run can be queued, so this outlives the tick. */
    private strategyRunsInFlight = 0;
    /** Event-driven runs since the grid last went quiet, so a feedback loop can be broken. */
    private consecutiveStrategyRuns = 0;
    private strategyRunsCapped = false;
    /** Bumped when a stalled run is force-released, so the run's own late release is ignored. */
    private strategyRunGeneration = 0;
    private strategyQuietTimeout?: number;
    private strategyWatchdogTimeout?: number;
    /** True while a UI auto-size gesture dispatches its resize events, which are not manual widths. */
    private withinUiAutoSize = false;
    private removeStrategyEventListeners?: () => void;

    private readonly scheduleStrategyRerun = _debounce(
        this,
        () => {
            // a run dispatches the very events that can trigger it, so anything arriving before the
            // previous run has finished sizing is that run's own echo
            if (this.strategyRunsInFlight > 0) {
                return;
            }
            if (this.consecutiveStrategyRuns >= MAX_CONSECUTIVE_STRATEGY_RUNS) {
                if (!this.strategyRunsCapped) {
                    this.strategyRunsCapped = true;
                    this.warn(326, { events: this.gos.get('autoSizeStrategy')?.events ?? [] });
                }
                return;
            }
            this.consecutiveStrategyRuns++;
            const strategy = this.gos.get('autoSizeStrategy');
            if (strategy) {
                this.applyStrategy(strategy, STRATEGY_SOURCE);
            }
        },
        0
    );

    public postConstruct(): void {
        const { gos } = this;
        const autoSizeStrategy = gos.get('autoSizeStrategy');

        if (autoSizeStrategy) {
            let shouldHideColumns = false;
            const type = autoSizeStrategy.type;
            if (type === 'fitGridWidth' || type === 'fitProvidedWidth') {
                shouldHideColumns = true;
            } else if (type === 'fitCellContents') {
                this.addManagedEventListeners({ firstDataRendered: () => this.onFirstDataRendered(autoSizeStrategy) });
                // Hide columns when we already have row data to display. This avoids jittering when we initially
                // render columns at default width, only to immediately resize them when rows are rendered.
                const rowData = gos.get('rowData');
                shouldHideColumns = rowData != null && rowData.length > 0 && _isClientSideRowModel(gos);
            }
            if (shouldHideColumns) {
                this.beans.colDelayRenderSvc?.hideColumns(type);
            }
        }

        this.setupStrategyRerun(autoSizeStrategy);

        this.addManagedEventListeners({
            columnResized: ({ finished, source, columns }) => {
                if (this.withinUiAutoSize || !finished || source !== UI_RESIZE_SOURCE || !columns) {
                    return;
                }
                const userResizedColIds = this.userResizedColIds;
                for (let i = 0, len = columns.length; i < len; ++i) {
                    userResizedColIds.add(columns[i].getColId());
                }
            },
            // a colId dropped by new column defs would otherwise leak, and come back pre-excluded
            gridColumnsChanged: () => this.pruneUserResizedColIds(),
        });

        this.addManagedPropertyListener('autoSizeStrategy', ({ currentValue, previousValue }) => {
            // object-valued options re-fire on every framework re-render, so only act on a real change
            if (autoSizeStrategiesEqual(currentValue, previousValue)) {
                return;
            }
            this.setupStrategyRerun(currentValue);
            if (currentValue) {
                // manual widths survive an option update; only the explicit API call reclaims them
                this.applyStrategy(currentValue, STRATEGY_SOURCE);
            }
        });
    }

    /** Drops ids of columns that no longer exist, so a later column reusing an id is not pre-excluded. */
    private pruneUserResizedColIds(): void {
        const userResizedColIds = this.userResizedColIds;
        if (!userResizedColIds.size) {
            return;
        }
        const { colModel } = this.beans;
        for (const colId of userResizedColIds) {
            if (!colModel.getCol(colId)) {
                userResizedColIds.delete(colId);
            }
        }
    }

    private setupStrategyRerun(strategy: AutoSizeStrategy | undefined): void {
        this.removeStrategyEventListeners?.();
        this.removeStrategyEventListeners = undefined;

        const events = strategy?.events;
        if (!events?.length) {
            return;
        }

        const handlers: { [K in AutoSizeStrategyEvent]?: (event: AgEventTypeParams[K]) => void } = {};
        const onEvent = (event: AgEventTypeParams[AutoSizeStrategyEvent]) => {
            // a run re-dispatches column events long after it finishes; re-running for those never settles
            if ('source' in event && event.source != null && SIZING_SOURCES.has(event.source)) {
                return;
            }
            this.scheduleStrategyRerun();
        };
        // `fitCellContents` already sizes on first data render, so listening would run a second pass
        const alreadyRunOnFirstDataRendered = strategy?.type === 'fitCellContents';
        for (let i = 0, len = events.length; i < len; ++i) {
            const event = events[i];
            if (event === 'firstDataRendered' && alreadyRunOnFirstDataRendered) {
                continue;
            }
            handlers[event] = onEvent;
        }

        const destroyFuncs = this.addManagedEventListeners(handlers);
        this.removeStrategyEventListeners = () => {
            for (let i = 0, len = destroyFuncs.length; i < len; ++i) {
                destroyFuncs[i]();
            }
        };
    }

    /** Re-applies the configured strategy, reclaiming columns the user had resized by hand. */
    public applyAutoSizeStrategy(): void {
        const strategy = this.gos.get('autoSizeStrategy');
        if (!strategy) {
            return;
        }
        this.userResizedColIds.clear();
        this.applyStrategy(strategy, STRATEGY_SOURCE);
    }

    /**
     * Sizes columns per the given strategy. `eventSource` is only set for re-runs, so the initial
     * application keeps reporting the sources it always has.
     */
    private applyStrategy(strategy: AutoSizeStrategy, eventSource?: ColumnEventType): void {
        if (this.strategyRunsInFlight === 0) {
            this.strategyWatchdogTimeout = window.setTimeout(
                () => this.releaseStalledStrategyRuns(),
                STRATEGY_RUN_TIMEOUT
            );
        }
        this.strategyRunsInFlight++;
        const generation = this.strategyRunGeneration;
        let released = false;
        const release = () => {
            if (released || generation !== this.strategyRunGeneration) {
                return;
            }
            released = true;
            this.finishStrategyRun();
        };

        const type = strategy.type;
        if (type === 'fitCellContents') {
            const { colIds, skipHeader, columnLimits, defaultMinWidth, defaultMaxWidth, scaleUpToFitGridWidth } =
                strategy;
            const params = {
                skipHeader,
                columnLimits,
                defaultMinWidth,
                defaultMaxWidth,
                scaleUpToFitGridWidth,
                source: 'autosizeColumns' as ColumnEventType,
                eventSource,
            };
            // autoSizeAllColumns resolves the column list, and the exclusions, after any queue drains
            const sized = colIds
                ? this.autoSizeCols({ ...params, colKeys: this.strategyColKeys(colIds) })
                : this.autoSizeAllColumns({ ...params, excludeColIds: this.userResizedColIds });
            sized.then(release, release);
            return;
        }

        const source = eventSource ?? 'sizeColumnsToFit';
        const colKeys = this.userResizedColIds.size ? this.strategyColKeys() : undefined;
        if (type === 'fitGridWidth') {
            const { columnLimits: propColumnLimits, defaultMinWidth, defaultMaxWidth } = strategy;
            this.sizeColumnsToFitGridBody(
                {
                    defaultMinWidth,
                    defaultMaxWidth,
                    columnLimits: propColumnLimits?.map(({ colId: key, minWidth, maxWidth }) => ({
                        key,
                        minWidth,
                        maxWidth,
                    })),
                    colKeys,
                    onComplete: release,
                },
                undefined,
                source
            );
        } else {
            this.sizeColumnsToFit(strategy.width, source, false, { colKeys, onComplete: release });
        }
    }

    /** Ends a run, and starts the timer that decides whether the next run belongs to the same chain. */
    private finishStrategyRun(): void {
        this.strategyRunsInFlight--;
        if (this.strategyRunsInFlight > 0) {
            return;
        }
        clearTimeout(this.strategyWatchdogTimeout);
        if (!this.isAlive()) {
            return;
        }
        clearTimeout(this.strategyQuietTimeout);
        this.strategyQuietTimeout = window.setTimeout(() => {
            this.consecutiveStrategyRuns = 0;
            this.strategyRunsCapped = false;
        }, STRATEGY_QUIET_DELAY);
    }

    /**
     * A sizing pass that never reports completion — its deferred resize queue never drained, say —
     * would leave the re-entrancy fence closed for the grid's lifetime, silently.
     */
    private releaseStalledStrategyRuns(): void {
        if (this.strategyRunsInFlight === 0) {
            return;
        }
        this.warn(327);
        // a stalled run may still complete later; that release must not take the count negative
        this.strategyRunGeneration++;
        this.strategyRunsInFlight = 1;
        this.finishStrategyRun();
    }

    /** The columns a strategy targets, minus any the user has since resized by hand. */
    private strategyColKeys(colIds?: string[]): AgColumn[] {
        const { colModel, visibleCols } = this.beans;
        const cols = colIds
            ? colIds.map((colId) => colModel.getCol(colId)).filter((col): col is AgColumn => col != null)
            : visibleCols.allCols;
        const userResizedColIds = this.userResizedColIds;
        return userResizedColIds.size ? cols.filter((col) => !userResizedColIds.has(col.colId)) : cols;
    }

    /**
     * Auto-size params for the built-in UI actions — the column and context menu items, and header
     * double-click. These reuse `autoSizeStrategy` only when it has opted in via `applyToUiActions`.
     */
    public getUiActionAutoSizeParams(): UiActionAutoSizeParams {
        const { gos } = this;
        const skipHeader = gos.get('skipHeaderOnAutoSize');
        const strategy = gos.get('autoSizeStrategy');
        if (strategy?.type !== 'fitCellContents' || !strategy.applyToUiActions) {
            return { skipHeader };
        }

        const { columnLimits, defaultMinWidth, defaultMaxWidth, scaleUpToFitGridWidth } = strategy;
        return {
            skipHeader: strategy.skipHeader ?? skipHeader,
            columnLimits,
            defaultMinWidth,
            defaultMaxWidth,
            scaleUpToFitGridWidth,
        };
    }

    /**
     * As {@link getUiActionAutoSizeParams}, minus `scaleUpToFitGridWidth` — spreading the grid's spare
     * width over a single column, or one group, would leave it far wider than its contents.
     */
    private getUiActionColAutoSizeParams(): UiActionAutoSizeParams {
        const params = this.getUiActionAutoSizeParams();
        params.scaleUpToFitGridWidth = undefined;
        return params;
    }

    public autoSizeCols(params: AutoSizeColumnParams): Promise<void> {
        const { eventSvc, colModel } = this.beans;

        setWidthAnimation(this.beans, true);

        return this.innerAutoSizeCols(params).then((columnsAutoSized) => {
            const dispatch = (cols: Set<AgColumn>) =>
                dispatchColumnResizedEvent(eventSvc, Array.from(cols), true, params.eventSource ?? 'autosizeColumns');

            if (!params.scaleUpToFitGridWidth) {
                setWidthAnimation(this.beans, false);
                return dispatch(columnsAutoSized);
            }

            const availableGridWidth = getAvailableWidth(this.beans);

            // We exclude pinned columns here, we only want columns in the main viewport to be scaled up.
            const colKeys = params.colKeys.filter((col) => {
                const resolved = colModel.getCol(col);
                if (!resolved || resolved.colDef.suppressAutoSize || resolved.colKind === 'row-number') {
                    return false;
                }
                const pinned = resolved.pinned;
                return !(resolved.displayed && (pinned === 'left' || pinned === 'right'));
            });

            this.sizeColumnsToFit(availableGridWidth, params.source, true, {
                defaultMaxWidth: params.defaultMaxWidth,
                defaultMinWidth: params.defaultMinWidth,
                columnLimits: params.columnLimits?.map((limit) => ({ ...limit, key: limit.colId })),
                colKeys,
                onlyScaleUp: true,
                animate: false,
            });

            setWidthAnimation(this.beans, false);

            dispatch(columnsAutoSized);
        });
    }

    private innerAutoSizeCols(params: AutoSizeColumnParams): Promise<Set<AgColumn>> {
        return new Promise((resolve, reject) => {
            if (this.shouldQueueResizeOperations) {
                return this.pushResizeOperation(() => this.innerAutoSizeCols(params).then(resolve, reject));
            }

            const {
                colKeys,
                skipHeader,
                skipHeaderGroups,
                stopAtGroup,
                defaultMaxWidth,
                defaultMinWidth,
                columnLimits = [],
                source = 'api',
            } = params;

            // because of column virtualisation, we can only do this function on columns that are
            // actually rendered, as non-rendered columns (outside the viewport and not rendered
            // due to column virtualisation) are not present. this can result in all rendered columns
            // getting narrowed, which in turn introduces more rendered columns on the RHS which
            // did not get autoSized in the original run, leaving the visible grid with columns on
            // the LHS sized, but RHS no. so we keep looping through the visible columns until
            // no more cols are available (rendered) to be resized

            const { animationFrameSvc, renderStatus, colModel, autoWidthCalc, visibleCols } = this.beans;

            // we autosize after animation frames finish in case any cell renderers need to complete first. this can
            // happen eg if client code is calling api.autoSizeAllColumns() straight after grid is initialised, but grid
            // hasn't fully drawn out all the cells yet (due to cell renderers in animation frames).
            animationFrameSvc?.flushAllFrames();

            if (
                this.timesDelayed < 5 &&
                renderStatus &&
                (!renderStatus.areHeaderCellsRendered() || !renderStatus.areCellsRendered())
            ) {
                // This is needed for React, as it doesn't render the headers or cells synchronously all the time.
                // Added a defensive check to avoid infinite loop in case headers or cells are never rendered.
                this.timesDelayed++;
                setTimeout(() => {
                    if (this.isAlive()) {
                        this.innerAutoSizeCols(params).then(resolve, reject);
                    }
                });
                return;
            }
            this.timesDelayed = 0;

            // keep track of which cols we have resized in here
            const columnsAutoSized = new Set<AgColumn>();
            // initialise with anything except 0 so that while loop executes at least once
            let changesThisTimeAround = -1;

            const columnLimitsIndex = Object.fromEntries(
                columnLimits.map(({ colId, ...dimensions }) => [colId, dimensions])
            );
            const shouldSkipHeader = skipHeader ?? this.gos.get('skipHeaderOnAutoSize');
            const shouldSkipHeaderGroups = skipHeaderGroups ?? shouldSkipHeader;

            while (changesThisTimeAround !== 0) {
                changesThisTimeAround = 0;

                const updatedColumns: AgColumn[] = [];

                for (const key of colKeys) {
                    if (!key) {
                        continue;
                    }
                    const column = colModel.getCol(key);

                    // if already autoSized or suppressed, skip it
                    if (!column || columnsAutoSized.has(column) || column.colDef.suppressAutoSize) {
                        continue;
                    }
                    if (isSpecialCol(column)) {
                        continue;
                    }

                    // get how wide this col should be
                    const preferredWidth = autoWidthCalc!.getPreferredWidthForColumn(column, shouldSkipHeader);

                    // preferredWidth = -1 if this col is not on the screen
                    if (preferredWidth > 0) {
                        const columnLimit = columnLimitsIndex[column.colId] ?? {};
                        columnLimit.minWidth ??= defaultMinWidth;
                        columnLimit.maxWidth ??= defaultMaxWidth;
                        const newWidth = normaliseColumnWidth(column, preferredWidth, columnLimit);
                        column.setActualWidth(newWidth, source);
                        columnsAutoSized.add(column);
                        changesThisTimeAround++;
                    }

                    updatedColumns.push(column);
                }

                if (updatedColumns.length) {
                    // skipTreeBuild=true: autosize only changes widths, leaving liveCols/pins/visibility — and
                    // thus the section/group trees — unchanged.
                    visibleCols.refresh(source, true);
                }
            }

            if (!shouldSkipHeaderGroups) {
                this.autoSizeColumnGroupsByColumns(colKeys, source, stopAtGroup);
            }

            resolve(columnsAutoSized);
        });
    }

    /** Auto-sizes a single column for a built-in UI action. */
    public autoSizeColumn(key: ColKey, source: ColumnEventType): void {
        this.autoSizeCols({ ...this.getUiActionColAutoSizeParams(), colKeys: [key], skipHeaderGroups: true, source });
    }

    private autoSizeColumnGroupsByColumns(keys: ColKey[], source: ColumnEventType, stopAtGroup?: AgColumnGroup): void {
        const { colModel, ctrlsSvc } = this.beans;
        const columnGroups = new Set<AgColumnGroup>();

        for (let i = 0, len = keys.length; i < len; ++i) {
            const col = colModel.getCol(keys[i]);
            let parent = col?.parent;
            while (parent && parent != stopAtGroup) {
                if (!parent.providedColumnGroup.padding) {
                    columnGroups.add(parent);
                }
                parent = parent.parent;
            }
        }

        const headerRowContainerCtrl = ctrlsSvc.getHeaderRowContainerCtrl();
        if (!headerRowContainerCtrl) {
            return;
        }

        for (const columnGroup of columnGroups) {
            const headerGroupCtrl = headerRowContainerCtrl.getHeaderCtrlForColumn(columnGroup) as
                | HeaderGroupCellCtrl
                | undefined;
            headerGroupCtrl?.resizeLeafColumnsToFit(source);
        }
    }

    public autoSizeAllColumns(params: AutoSizeAllColumnsParams): Promise<void> {
        if (this.shouldQueueResizeOperations) {
            return new Promise((resolve, reject) => {
                this.pushResizeOperation(() => this.autoSizeAllColumns(params).then(resolve, reject));
            });
        }

        const { excludeColIds, ...autoSizeParams } = params;
        const allCols = this.beans.visibleCols.allCols;
        const colKeys = excludeColIds?.size ? allCols.filter((col) => !excludeColIds.has(col.colId)) : allCols;
        return this.autoSizeCols({ colKeys, ...autoSizeParams });
    }

    public addColumnAutosizeListeners(element: HTMLElement, column: AgColumn): () => void {
        const autoSizeColListener = () => {
            this.autoSizeColumn(column, UI_RESIZE_SOURCE);
        };

        element.addEventListener('dblclick', autoSizeColListener);
        const touchListener = new TouchListener(element);
        touchListener.addEventListener('doubleTap', autoSizeColListener);

        return () => {
            element.removeEventListener('dblclick', autoSizeColListener);
            touchListener.destroy();
        };
    }

    public addColumnGroupResize(element: HTMLElement, columnGroup: AgColumnGroup, callback: () => void): () => void {
        const listener = () => {
            // get list of all the column keys we are responsible for
            const keys: string[] = [];
            const leafCols = columnGroup.getDisplayedLeafColumns();

            for (const column of leafCols) {
                // not all cols in the group may be participating with auto-resize
                if (!column.colDef.suppressAutoSize) {
                    keys.push(column.colId);
                }
            }

            if (keys.length > 0) {
                this.autoSizeCols({
                    ...this.getUiActionColAutoSizeParams(),
                    colKeys: keys,
                    stopAtGroup: columnGroup,
                    source: UI_RESIZE_SOURCE,
                });
            }

            // the callback fits the group's leaves, reporting `uiColumnResized` — an auto-size gesture,
            // not a width the user chose, so it must not mark the columns as manually resized
            this.withinUiAutoSize = true;
            try {
                callback();
            } finally {
                this.withinUiAutoSize = false;
            }
        };

        element.addEventListener('dblclick', listener);

        return () => element.removeEventListener('dblclick', listener);
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFitGridBody(
        params?: SizeColumnsToFitGridBodyParams,
        nextTimeout?: number,
        source: ColumnEventType = 'sizeColumnsToFit'
    ): void {
        if (!this.isAlive()) {
            return;
        }

        let availableWidth = getAvailableWidth(this.beans);

        // When all visible columns are pinned, cap the available width so the pinned sections
        // don't fill the entire viewport. Without this, the processUnpinnedColumns callback is triggered
        // and would asynchronously unpin columns — visually reversing their order.
        if (availableWidth > 0 && this.beans.visibleCols.centerCols.length === 0) {
            availableWidth = Math.max(availableWidth - MIN_CENTER_VIEWPORT_WIDTH, 0);
        }

        if (availableWidth > 0) {
            this.sizeColumnsToFit(availableWidth, source, false, params);
            return;
        }

        if (nextTimeout === undefined) {
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, 100, source);
            }, 0);
        } else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, 500, source);
            }, 100);
        } else if (nextTimeout === 500) {
            // IMPORTANT! in gridCtrl we add content-visibility:auto `contentVisibilityAutoDelay` ms (default 1000) after
            // first rendering data to avoid breaking size-to-fit. We're relying on the maximum timeout here being less
            // than the default 1000ms. If you increase this timeout, update the default `contentVisibilityAutoDelay` too.
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, -1, source);
            }, 500);
        } else {
            // Grid coming back with zero width, maybe the grid is not visible yet on the screen?
            this.warn(29);
            params?.onComplete?.();
        }
    }

    // called from api
    public sizeColumnsToFit(
        gridWidth: number,
        source: ColumnEventType = 'sizeColumnsToFit',
        silent?: boolean,
        params?: SizeColumnsToFitParams
    ): void {
        if (this.shouldQueueResizeOperations) {
            // the requeued call reports completion, so callers see the sizing that actually happened
            this.pushResizeOperation(() => this.sizeColumnsToFit(gridWidth, source, silent, params));
            return;
        }

        this.sizeColumnsToFitNow(gridWidth, source, silent, params);
        params?.onComplete?.();
    }

    private sizeColumnsToFitNow(
        gridWidth: number,
        source: ColumnEventType,
        silent?: boolean,
        params?: SizeColumnsToFitParams
    ): void {
        const { beans } = this;
        const animate = params?.animate ?? true;
        if (animate) {
            setWidthAnimation(beans, true);
        }

        const limitsMap: { [colId: string]: Omit<IColumnLimit, 'key'> } = Object.create(null);
        for (const { key, ...dimensions } of params?.columnLimits ?? []) {
            limitsMap[typeof key === 'string' ? key : key.getColId()] = dimensions;
        }

        // avoid divide by zero
        const allDisplayedColumns = beans.visibleCols.allCols;

        // a non-finite width comes from an unmeasurable grid body, and would spread NaN column widths
        if (gridWidth <= 0 || !Number.isFinite(gridWidth) || !allDisplayedColumns.length) {
            return;
        }

        const currentTotalColumnWidth = getWidthOfColsInList(allDisplayedColumns);

        if (params?.onlyScaleUp && currentTotalColumnWidth > gridWidth) {
            return;
        }

        const doColumnsAlreadyFit = gridWidth === currentTotalColumnWidth;
        if (doColumnsAlreadyFit) {
            // if all columns fit, check they are within the min and max widths - if so, can quit early.
            const doAllColumnsSatisfyConstraints = allDisplayedColumns.every((column) => {
                if (column.colDef.suppressSizeToFit) {
                    return true;
                }
                const widthOverride = limitsMap?.[column.getId()];
                const minWidth = widthOverride?.minWidth ?? params?.defaultMinWidth;
                const maxWidth = widthOverride?.maxWidth ?? params?.defaultMaxWidth;
                const colWidth = column.getActualWidth();
                return (minWidth == null || colWidth >= minWidth) && (maxWidth == null || colWidth <= maxWidth);
            });
            if (doAllColumnsSatisfyConstraints) {
                return;
            }
        }

        const colsToSpread: AgColumn[] = [];
        const colsToNotSpread: AgColumn[] = [];

        for (const column of allDisplayedColumns) {
            const isIncluded = params?.colKeys?.some((key) => columnsMatch(column, key)) ?? true;
            if (column.colDef.suppressSizeToFit || !isIncluded) {
                colsToNotSpread.push(column);
            } else {
                colsToSpread.push(column);
            }
        }

        // make a copy of the cols that are going to be resized
        const colsToDispatchEventFor = colsToSpread.slice(0);
        let finishedResizing = false;

        const moveToNotSpread = (column: AgColumn) => {
            _removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        };

        const currentWidths: Partial<Record<string, number>> = Object.create(null);

        // resetting cols to their original width makes the sizeColumnsToFit more deterministic,
        // rather than depending on the current size of the columns. most users call sizeColumnsToFit
        // immediately after grid is created, so will make no difference. however if application is calling
        // sizeColumnsToFit repeatedly (eg after column group is opened / closed repeatedly) we don't want
        // the columns to start shrinking / growing over time.
        for (const column of colsToSpread) {
            if (params?.onlyScaleUp) {
                // When `onlyScaleUp`, we store the current widths to act as a true minimum because we don't
                // want any columns to get smaller
                currentWidths[column.colId] = column.getActualWidth();
            }
            column.resetActualWidth(source);

            const widthOverride = limitsMap?.[column.getId()];
            const minOverride = widthOverride?.minWidth ?? params?.defaultMinWidth ?? -Infinity;
            const maxOverride = widthOverride?.maxWidth ?? params?.defaultMaxWidth ?? Infinity;

            const colWidth = column.getActualWidth();
            const targetWidth = _clamp(colWidth, minOverride, maxOverride);

            // NOTE: we assign values to `this.actualWidth` of each column without firing events
            // for this reason we need to manually dispatch resize events after the resize has been done for each column.
            if (targetWidth != colWidth) {
                column.setActualWidth(targetWidth, source, true);
            }
        }

        while (!finishedResizing) {
            finishedResizing = true;
            const availablePixels = gridWidth - getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                for (const column of colsToSpread) {
                    const newWidth =
                        limitsMap?.[column.getId()]?.minWidth ?? params?.defaultMinWidth ?? column.minWidth;
                    column.setActualWidth(newWidth, source, true);
                }
            } else {
                const scale = availablePixels / getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                let pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (let i = colsToSpread.length - 1; i >= 0; i--) {
                    const column = colsToSpread[i];

                    const id = column.colId;
                    const prevWidth = currentWidths[id];
                    const widthOverride = limitsMap?.[id];
                    const minOverride = widthOverride?.minWidth ?? params?.defaultMinWidth ?? prevWidth;
                    const maxOverride = widthOverride?.maxWidth ?? params?.defaultMaxWidth;
                    const minWidth = Math.max(minOverride ?? -Infinity, column.getMinWidth());
                    const maxWidth = Math.min(maxOverride ?? Infinity, column.getMaxWidth());
                    let newWidth = Math.round(column.getActualWidth() * scale);

                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (i === 0) {
                        // if this is the last column
                        newWidth = pixelsForLastCol;
                    }

                    column.setActualWidth(newWidth, source, true);
                    pixelsForLastCol -= newWidth;
                }
            }
        }

        // see NOTE above
        for (const col of colsToDispatchEventFor) {
            col.fireColumnWidthChangedEvent(source);
        }

        const visibleCols = this.beans.visibleCols;
        visibleCols.updateBodyWidths(visibleCols.setLeftValues(source));

        if (silent) {
            return;
        }

        dispatchColumnResizedEvent(this.eventSvc, colsToDispatchEventFor, true, source);

        if (animate) {
            setWidthAnimation(beans, false);
        }
    }

    public applyInitialAutoSizeStrategy(): void {
        const strategy = this.gos.get('autoSizeStrategy');
        if (!strategy) {
            return;
        }
        const type = strategy.type;
        // `fitCellContents` has nothing to measure until the cells exist, so it runs from
        // `onFirstDataRendered` instead
        if (type !== 'fitGridWidth' && type !== 'fitProvidedWidth') {
            return;
        }

        // ensure things like aligned grids have linked first
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.applyStrategy(strategy);
            this.beans.colDelayRenderSvc?.revealColumns(type);
        });
    }

    private onFirstDataRendered(strategy: SizeColumnsToContentStrategy): void {
        // ensure render has finished
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            this.applyStrategy(strategy);
            this.beans.colDelayRenderSvc?.revealColumns(strategy.type);
        });
    }

    public processResizeOperations(): void {
        this.shouldQueueResizeOperations = false;
        const operations = this.resizeOperationQueue;
        this.resizeOperationQueue = [];
        for (let i = 0, len = operations.length; i < len; ++i) {
            operations[i]();
        }
    }

    public pushResizeOperation(func: () => void): void {
        this.resizeOperationQueue.push(func);
    }

    public override destroy(): void {
        this.resizeOperationQueue.length = 0;
        clearTimeout(this.strategyQuietTimeout);
        clearTimeout(this.strategyWatchdogTimeout);
        super.destroy();
    }
}

/** Every field an {@link AutoSizeStrategy} member can carry, flattened so two can be compared. */
interface AutoSizeStrategyFields {
    type?: string;
    width?: number;
    events?: readonly string[];
    skipHeader?: boolean;
    colIds?: readonly string[];
    columnLimits?: readonly unknown[];
    defaultMinWidth?: number;
    defaultMaxWidth?: number;
    scaleUpToFitGridWidth?: boolean;
    applyToUiActions?: boolean;
}

const AUTO_SIZE_STRATEGY_KEYS: (keyof AutoSizeStrategyFields)[] = [
    'type',
    'width',
    'events',
    'skipHeader',
    'colIds',
    'columnLimits',
    'defaultMinWidth',
    'defaultMaxWidth',
    'scaleUpToFitGridWidth',
    'applyToUiActions',
];

/** Compares the known keys, so a framework wrapper re-passing them in another order is not a change. */
function autoSizeStrategiesEqual(a?: AutoSizeStrategyFields, b?: AutoSizeStrategyFields): boolean {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    for (let i = 0, len = AUTO_SIZE_STRATEGY_KEYS.length; i < len; ++i) {
        const key = AUTO_SIZE_STRATEGY_KEYS[i];
        const aValue = a[key];
        const bValue = b[key];
        if (aValue !== bValue && !_jsonEquals(aValue, bValue)) {
            return false;
        }
    }
    return true;
}

/** returns the width we can set to this col, taking into consideration min and max widths */
function normaliseColumnWidth(
    column: AgColumn,
    newWidth: number,
    limits: { minWidth?: number; maxWidth?: number } = {}
): number {
    const minWidth = limits.minWidth ?? column.getMinWidth();

    if (newWidth < minWidth) {
        newWidth = minWidth;
    }

    const maxWidth = limits.maxWidth ?? column.getMaxWidth();
    if (newWidth > maxWidth) {
        newWidth = maxWidth;
    }

    return newWidth;
}

function getAvailableWidth({ ctrlsSvc, scrollVisibleSvc }: BeanCollection): number {
    const gridBodyCtrl = ctrlsSvc.getGridBodyCtrl();
    const removeScrollWidth = scrollVisibleSvc.isVerticalScrollShowing();
    // `getScrollbarWidth` is null until the DOM can be measured; subtracting that would give NaN
    const scrollWidthToRemove = removeScrollWidth ? (scrollVisibleSvc.getScrollbarWidth() ?? 0) : 0;
    // bodyViewportWidth should be calculated from eGridBody, not eBodyViewport
    // because we change the width of the bodyViewport to hide the real browser scrollbar
    const bodyViewportWidth = _getInnerWidth(gridBodyCtrl.eGridBody);
    return bodyViewportWidth - scrollWidthToRemove;
}

const WIDTH_ANIMATION_CLASS = 'ag-animate-autosize';

function setWidthAnimation({ ctrlsSvc, gos }: BeanCollection, enable: boolean): void {
    if (!gos.get('animateColumnResizing') || gos.get('enableRtl') || !ctrlsSvc.isAlive()) {
        return;
    }

    const classList = ctrlsSvc.getGridBodyCtrl().eGridBody.classList;
    if (enable) {
        classList.add(WIDTH_ANIMATION_CLASS);
    } else {
        classList.remove(WIDTH_ANIMATION_CLASS);
    }
}

function columnsMatch(column: AgColumn, key: ColKey): boolean {
    return column === key || column.colId == key || column.colDef === key;
}
