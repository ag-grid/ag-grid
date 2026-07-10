import { _getInnerWidth, _removeFromArray } from 'ag-stack';

import { dispatchColumnResizedEvent } from '../columns/columnEventUtils';
import { getWidthOfColsInList, isSpecialCol } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type {
    IColumnLimit,
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
}

export class ColumnAutosizeService extends BeanStub implements NamedBean {
    beanName = 'colAutosize' as const;

    private timesDelayed = 0;

    /** when we're waiting for cell data types to be inferred, we need to defer column resizing */
    public shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

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
    }

    public autoSizeCols(params: AutoSizeColumnParams): void {
        const { eventSvc, colModel } = this.beans;

        setWidthAnimation(this.beans, true);

        this.innerAutoSizeCols(params).then((columnsAutoSized) => {
            const dispatch = (cols: Set<AgColumn>) =>
                dispatchColumnResizedEvent(eventSvc, Array.from(cols), true, 'autosizeColumns');

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

    public autoSizeColumn(key: ColKey, source: ColumnEventType, skipHeader?: boolean): void {
        this.autoSizeCols({ colKeys: [key], skipHeader, skipHeaderGroups: true, source });
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

    public autoSizeAllColumns(params: {
        skipHeader?: boolean;
        defaultMinWidth?: number;
        defaultMaxWidth?: number;
        columnLimits?: SizeColumnsToContentColumnLimits[];
        source?: ColumnEventType;
    }): void {
        if (this.shouldQueueResizeOperations) {
            this.pushResizeOperation(() => this.autoSizeAllColumns(params));
            return;
        }

        this.autoSizeCols({ colKeys: this.beans.visibleCols.allCols, ...params });
    }

    public addColumnAutosizeListeners(element: HTMLElement, column: AgColumn): () => void {
        const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

        const autoSizeColListener = () => {
            this.autoSizeColumn(column, 'uiColumnResized', skipHeaderOnAutoSize);
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
        const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

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
                    colKeys: keys,
                    skipHeader: skipHeaderOnAutoSize,
                    stopAtGroup: columnGroup,
                    source: 'uiColumnResized',
                });
            }

            callback();
        };

        element.addEventListener('dblclick', listener);

        return () => element.removeEventListener('dblclick', listener);
    }

    // method will call itself if no available width. this covers if the grid
    // isn't visible, but is just about to be visible.
    public sizeColumnsToFitGridBody(params?: ISizeColumnsToFitParams, nextTimeout?: number): void {
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
            this.sizeColumnsToFit(availableWidth, 'sizeColumnsToFit', false, params);
            return;
        }

        if (nextTimeout === undefined) {
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, 100);
            }, 0);
        } else if (nextTimeout === 100) {
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, 500);
            }, 100);
        } else if (nextTimeout === 500) {
            window.setTimeout(() => {
                this.sizeColumnsToFitGridBody(params, -1);
            }, 500);
        } else {
            // Grid coming back with zero width, maybe the grid is not visible yet on the screen?
            this.warn(29);
        }
    }

    // called from api
    public sizeColumnsToFit(
        gridWidth: number,
        source: ColumnEventType = 'sizeColumnsToFit',
        silent?: boolean,
        params?: ISizeColumnsToFitParams & { colKeys?: ColKey[]; onlyScaleUp?: boolean; animate?: boolean }
    ): void {
        if (this.shouldQueueResizeOperations) {
            this.pushResizeOperation(() => this.sizeColumnsToFit(gridWidth, source, silent, params));
            return;
        }

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

        if (gridWidth <= 0 || !allDisplayedColumns.length) {
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

    public applyAutosizeStrategy(): void {
        const { gos, colDelayRenderSvc } = this.beans;
        const autoSizeStrategy = gos.get('autoSizeStrategy');
        if (autoSizeStrategy?.type !== 'fitGridWidth' && autoSizeStrategy?.type !== 'fitProvidedWidth') {
            return;
        }

        // ensure things like aligned grids have linked first
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            const type = autoSizeStrategy.type;
            if (type === 'fitGridWidth') {
                const { columnLimits: propColumnLimits, defaultMinWidth, defaultMaxWidth } = autoSizeStrategy;
                const columnLimits = propColumnLimits?.map(({ colId: key, minWidth, maxWidth }) => ({
                    key,
                    minWidth,
                    maxWidth,
                }));
                this.sizeColumnsToFitGridBody({
                    defaultMinWidth,
                    defaultMaxWidth,
                    columnLimits,
                });
            } else if (type === 'fitProvidedWidth') {
                this.sizeColumnsToFit(autoSizeStrategy.width, 'sizeColumnsToFit');
            }
            colDelayRenderSvc?.revealColumns(type);
        });
    }

    private onFirstDataRendered({ colIds: colKeys, ...params }: SizeColumnsToContentStrategy): void {
        // ensure render has finished
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            const source = 'autosizeColumns';

            if (colKeys) {
                this.autoSizeCols({ ...params, source, colKeys });
            } else {
                this.autoSizeAllColumns({ ...params, source });
            }
            this.beans.colDelayRenderSvc?.revealColumns(params.type);
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
        super.destroy();
    }
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
    const scrollWidthToRemove = removeScrollWidth ? scrollVisibleSvc.getScrollbarWidth() : 0;
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
