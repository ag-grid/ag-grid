import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { Column } from '../interfaces/iColumn';
import { _removeFromArray } from '../utils/array';
import { _errorOnce } from '../utils/function';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import type { ColKey, ColumnModel } from './columnModel';
import { getWidthOfColsInList } from './columnUtils';
import type { ColumnViewportService } from './columnViewportService';
import type { VisibleColsService } from './visibleColsService';

export interface ColumnResizeSet {
    columns: AgColumn[];
    ratios: number[];
    width: number;
}

export interface IColumnLimit {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string;
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}

export interface ISizeColumnsToFitParams {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number;
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number;
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[];
}

type FlexItem = {
    col: AgColumn;
    isFlex: boolean;
    flex: number;
    min: number;
    max: number;
    initialSize: number;
    targetSize: number;
    frozenSize?: number;
    violationType?: 'min' | 'max';
};

export class ColumnSizeService extends BeanStub implements NamedBean {
    beanName = 'columnSizeService' as const;

    private columnModel: ColumnModel;
    private columnViewportService: ColumnViewportService;
    private eventDispatcher: ColumnEventDispatcher;
    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnViewportService = beans.columnViewportService;
        this.eventDispatcher = beans.columnEventDispatcher;
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
    }

    private flexViewportWidth: number;

    public setColumnWidths(
        columnWidths: {
            key: ColKey; // @key - the column who's size we want to change
            newWidth: number; // @newWidth - width in pixels
        }[],
        shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
        finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
        source: ColumnEventType
    ): void {
        const sets: ColumnResizeSet[] = [];

        columnWidths.forEach((columnWidth) => {
            const col = this.columnModel.getColDefCol(columnWidth.key) || this.columnModel.getCol(columnWidth.key);

            if (!col) {
                return;
            }

            sets.push({
                width: columnWidth.newWidth,
                ratios: [1],
                columns: [col],
            });

            // if user wants to do shift resize by default, then we invert the shift operation
            const defaultIsShift = this.gos.get('colResizeDefault') === 'shift';

            if (defaultIsShift) {
                shiftKey = !shiftKey;
            }

            if (shiftKey) {
                const otherCol = this.visibleColsService.getColAfter(col);
                if (!otherCol) {
                    return;
                }

                const widthDiff = col.getActualWidth() - columnWidth.newWidth;
                const otherColWidth = otherCol.getActualWidth() + widthDiff;

                sets.push({
                    width: otherColWidth,
                    ratios: [1],
                    columns: [otherCol],
                });
            }
        });

        if (sets.length === 0) {
            return;
        }

        this.resizeColumnSets({
            resizeSets: sets,
            finished,
            source,
        });
    }

    // method takes sets of columns and resizes them. either all sets will be resized, or nothing
    // be resized. this is used for example when user tries to resize a group and holds shift key,
    // then both the current group (grows), and the adjacent group (shrinks), will get resized,
    // so that's two sets for this method.
    public resizeColumnSets(params: {
        resizeSets: ColumnResizeSet[];
        finished: boolean;
        source: ColumnEventType;
    }): void {
        const { resizeSets, finished, source } = params;
        const passMinMaxCheck =
            !resizeSets || resizeSets.every((columnResizeSet) => this.checkMinAndMaxWidthsForSet(columnResizeSet));

        if (!passMinMaxCheck) {
            // even though we are not going to resize beyond min/max size, we still need to dispatch event when finished
            if (finished) {
                const columns = resizeSets && resizeSets.length > 0 ? resizeSets[0].columns : null;
                this.eventDispatcher.columnResized(columns, finished, source);
            }

            return; // don't resize!
        }

        const changedCols: AgColumn[] = [];
        const allResizedCols: AgColumn[] = [];

        resizeSets.forEach((set) => {
            const { width, columns, ratios } = set;

            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            const newWidths: { [colId: string]: number } = {};
            const finishedCols: { [colId: string]: boolean } = {};

            columns.forEach((col) => allResizedCols.push(col));

            // the loop below goes through each col. if a col exceeds it's min/max width,
            // it then gets set to its min/max width and the column is removed marked as 'finished'
            // and the calculation is done again leaving this column out. take for example columns
            // {A, width: 50, maxWidth: 100}
            // {B, width: 50}
            // {C, width: 50}
            // and then the set is set to width 600 - on the first pass the grid tries to set each column
            // to 200. it checks A and sees 200 > 100 and so sets the width to 100. col A is then marked
            // as 'finished' and the calculation is done again with the remaining cols B and C, which end up
            // splitting the remaining 500 pixels.
            let finishedColsGrew = true;
            let loopCount = 0;

            while (finishedColsGrew) {
                loopCount++;
                if (loopCount > 1000) {
                    // this should never happen, but in the future, someone might introduce a bug here,
                    // so we stop the browser from hanging and report bug properly
                    _errorOnce('infinite loop in resizeColumnSets');
                    break;
                }

                finishedColsGrew = false;

                const subsetCols: AgColumn[] = [];
                let subsetRatioTotal = 0;
                let pixelsToDistribute = width;

                columns.forEach((col, index) => {
                    const thisColFinished = finishedCols[col.getId()];
                    if (thisColFinished) {
                        pixelsToDistribute -= newWidths[col.getId()];
                    } else {
                        subsetCols.push(col);
                        const ratioThisCol = ratios[index];
                        subsetRatioTotal += ratioThisCol;
                    }
                });

                // because we are not using all of the ratios (cols can be missing),
                // we scale the ratio. if all columns are included, then subsetRatioTotal=1,
                // and so the ratioScale will be 1.
                const ratioScale = 1 / subsetRatioTotal;

                subsetCols.forEach((col, index) => {
                    const lastCol = index === subsetCols.length - 1;
                    let colNewWidth: number;

                    if (lastCol) {
                        colNewWidth = pixelsToDistribute;
                    } else {
                        colNewWidth = Math.round(ratios[index] * width * ratioScale);
                        pixelsToDistribute -= colNewWidth;
                    }

                    const minWidth = col.getMinWidth();
                    const maxWidth = col.getMaxWidth();

                    if (colNewWidth < minWidth) {
                        colNewWidth = minWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    } else if (maxWidth > 0 && colNewWidth > maxWidth) {
                        colNewWidth = maxWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    }

                    newWidths[col.getId()] = colNewWidth;
                });
            }

            columns.forEach((col) => {
                const newWidth = newWidths[col.getId()];
                const actualWidth = col.getActualWidth();

                if (actualWidth !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    changedCols.push(col);
                }
            });
        });

        // if no cols changed, then no need to update more or send event.
        const atLeastOneColChanged = changedCols.length > 0;

        let flexedCols: AgColumn[] = [];

        if (atLeastOneColChanged) {
            flexedCols = this.refreshFlexedColumns({ skipSetLeft: true });
            this.visibleColsService.setLeftValues(source);
            this.visibleColsService.updateBodyWidths();
            this.columnViewportService.checkViewportColumns();
        }

        // check for change first, to avoid unnecessary firing of events
        // however we always dispatch 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will dispatch change events
        // in all the columns in the group, but only one with get the pixel.
        const colsForEvent = allResizedCols.concat(flexedCols);

        if (atLeastOneColChanged || finished) {
            this.eventDispatcher.columnResized(colsForEvent, finished, source, flexedCols);
        }
    }

    private checkMinAndMaxWidthsForSet(columnResizeSet: ColumnResizeSet): boolean {
        const { columns, width } = columnResizeSet;

        // every col has a min width, so sum them all up and see if we have enough room
        // for all the min widths
        let minWidthAccumulated = 0;
        let maxWidthAccumulated = 0;
        let maxWidthActive = true;

        columns.forEach((col) => {
            const minWidth = col.getMinWidth();
            minWidthAccumulated += minWidth || 0;

            const maxWidth = col.getMaxWidth();
            if (maxWidth > 0) {
                maxWidthAccumulated += maxWidth;
            } else {
                // if at least one columns has no max width, it means the group of columns
                // then has no max width, as at least one column can take as much width as possible
                maxWidthActive = false;
            }
        });

        const minWidthPasses = width >= minWidthAccumulated;
        const maxWidthPasses = !maxWidthActive || width <= maxWidthAccumulated;

        return minWidthPasses && maxWidthPasses;
    }

    public refreshFlexedColumns(
        params: {
            skipSetLeft?: boolean;
            viewportWidth?: number;
            source?: ColumnEventType;
            fireResizedEvent?: boolean;
            updateBodyWidths?: boolean;
        } = {}
    ): AgColumn[] {
        const source = params.source ? params.source : 'flex';

        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }

        const totalSpace = this.flexViewportWidth;

        if (!totalSpace) {
            return [];
        }

        // NOTE this is an implementation of the "Resolve Flexible Lengths" part
        // of the flex spec, simplified because we only support flex growing not
        // shrinking, and don't support flex-basis.
        // https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-lengths
        let hasFlexItems = false;
        const items = this.visibleColsService.getCenterCols().map((col): FlexItem => {
            const flex = col.getFlex();
            const isFlex = flex != null;

            hasFlexItems ||= isFlex;

            return {
                col,
                isFlex,
                flex: Math.max(0, flex ?? 0),
                initialSize: col.getActualWidth(),
                min: col.getMinWidth(),
                max: col.getMaxWidth(),
                targetSize: 0,
            };
        });

        if (!hasFlexItems) {
            return [];
        }

        let unfrozenItemCount = items.length;
        let unfrozenFlex = items.reduce((acc, item) => acc + item.flex, 0);
        let unfrozenSpace = totalSpace;

        const freeze = (item: FlexItem, width: number) => {
            item.frozenSize = width;
            item.col.setActualWidth(width, source);
            unfrozenSpace -= width;
            unfrozenFlex -= item.flex;
            unfrozenItemCount -= 1;
        };

        const isFrozen = (item: FlexItem) => item.frozenSize != null;

        // Freeze inflexible columns
        for (const item of items) {
            if (!item.isFlex) {
                freeze(item, item.initialSize);
            }
        }

        // a. Check for flexible items. If all the flex items on the line are
        // frozen, free space has been distributed; exit this loop.
        while (unfrozenItemCount > 0) {
            // b. Calculate the remaining free space as for initial free space,
            // above. If the sum of the unfrozen flex items’ flex factors is
            // less than one, multiply the initial free space by this sum.
            const spaceToFill = Math.round(unfrozenFlex < 1 ? unfrozenSpace * unfrozenFlex : unfrozenSpace);

            // c. Distribute free space proportional to the flex factors.
            let lastUnfrozenItem: FlexItem | undefined;
            let actualLeft = 0;
            let idealRight = 0;

            for (const item of items) {
                if (isFrozen(item)) {
                    continue;
                }

                lastUnfrozenItem = item;
                idealRight += spaceToFill * (item.flex / unfrozenFlex);

                const idealSize = idealRight - actualLeft;
                const roundedSize = Math.round(idealSize);

                item.targetSize = roundedSize;
                actualLeft += roundedSize;
            }

            if (lastUnfrozenItem) {
                // Correct cumulative rounding errors: adjust the size of the
                // last item to fill any remaining space
                lastUnfrozenItem.targetSize += spaceToFill - actualLeft;
            }

            // d. Fix min/max violations. Clamp each non-frozen item’s target
            // main size by its used min and max main sizes... If the item’s
            // target main size was made smaller by this, it’s a max violation.
            // If the item’s target main size was made larger by this, it’s a
            // min violation.
            let totalViolation = 0;
            for (const item of items) {
                if (isFrozen(item)) {
                    continue;
                }

                const unclampedSize = item.targetSize;
                const clampedSize = Math.min(Math.max(unclampedSize, item.min), item.max);

                totalViolation += clampedSize - unclampedSize;
                item.violationType =
                    clampedSize === unclampedSize ? undefined : clampedSize < unclampedSize ? 'max' : 'min';

                item.targetSize = clampedSize;
            }

            // e. Freeze over-flexed items. The total violation is the sum of
            // the adjustments from the previous step.
            // If the total violation is:
            //     - Zero, Freeze all items
            //     - Positive, Freeze all the items with min violations
            //     - Negative, Freeze all the items with max violations
            const freezeType = totalViolation === 0 ? 'all' : totalViolation > 0 ? 'min' : 'max';

            for (const item of items) {
                if (isFrozen(item)) {
                    continue;
                }

                if (freezeType === 'all' || item.violationType === freezeType) {
                    freeze(item, item.targetSize);
                }
            }
        }

        if (!params.skipSetLeft) {
            this.visibleColsService.setLeftValues(source);
        }

        if (params.updateBodyWidths) {
            this.visibleColsService.updateBodyWidths();
        }

        const unconstrainedFlexColumns = items
            .filter((item) => item.isFlex && !item.violationType)
            .map((item) => item.col);

        if (params.fireResizedEvent) {
            const changedColumns = items.filter((item) => item.initialSize !== item.frozenSize).map((item) => item.col);
            const flexingColumns = items.filter((item) => item.flex).map((item) => item.col);

            this.eventDispatcher.columnResized(changedColumns, true, source, flexingColumns);
        }

        return unconstrainedFlexColumns;
    }

    // called from api
    public sizeColumnsToFit(
        gridWidth: any,
        source: ColumnEventType = 'sizeColumnsToFit',
        silent?: boolean,
        params?: ISizeColumnsToFitParams
    ): void {
        if (this.columnModel.isShouldQueueResizeOperations()) {
            this.columnModel.pushResizeOperation(() => this.sizeColumnsToFit(gridWidth, source, silent, params));
            return;
        }

        const limitsMap: { [colId: string]: Omit<IColumnLimit, 'key'> } = {};
        if (params) {
            params?.columnLimits?.forEach(({ key, ...dimensions }) => {
                limitsMap[typeof key === 'string' ? key : key.getColId()] = dimensions;
            });
        }

        // avoid divide by zero
        const allDisplayedColumns = this.visibleColsService.getAllCols();

        const doColumnsAlreadyFit = gridWidth === getWidthOfColsInList(allDisplayedColumns);
        if (gridWidth <= 0 || !allDisplayedColumns.length || doColumnsAlreadyFit) {
            return;
        }

        const colsToSpread: AgColumn[] = [];
        const colsToNotSpread: AgColumn[] = [];

        allDisplayedColumns.forEach((column) => {
            if (column.getColDef().suppressSizeToFit === true) {
                colsToNotSpread.push(column);
            } else {
                colsToSpread.push(column);
            }
        });

        // make a copy of the cols that are going to be resized
        const colsToDispatchEventFor = colsToSpread.slice(0);
        let finishedResizing = false;

        const moveToNotSpread = (column: AgColumn) => {
            _removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        };

        // resetting cols to their original width makes the sizeColumnsToFit more deterministic,
        // rather than depending on the current size of the columns. most users call sizeColumnsToFit
        // immediately after grid is created, so will make no difference. however if application is calling
        // sizeColumnsToFit repeatedly (eg after column group is opened / closed repeatedly) we don't want
        // the columns to start shrinking / growing over time.
        //
        // NOTE: the process below will assign values to `this.actualWidth` of each column without firing events
        // for this reason we need to manually dispatch resize events after the resize has been done for each column.
        colsToSpread.forEach((column) => {
            column.resetActualWidth(source);

            const widthOverride = limitsMap?.[column.getId()];
            const minOverride = widthOverride?.minWidth ?? params?.defaultMinWidth;
            const maxOverride = widthOverride?.maxWidth ?? params?.defaultMaxWidth;

            const colWidth = column.getActualWidth();
            if (typeof minOverride === 'number' && colWidth < minOverride) {
                column.setActualWidth(minOverride, source, true);
            } else if (typeof maxOverride === 'number' && colWidth > maxOverride) {
                column.setActualWidth(maxOverride, source, true);
            }
        });

        while (!finishedResizing) {
            finishedResizing = true;
            const availablePixels = gridWidth - getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach((column) => {
                    const widthOverride = limitsMap?.[column.getId()]?.minWidth ?? params?.defaultMinWidth;
                    if (typeof widthOverride === 'number') {
                        column.setActualWidth(widthOverride, source, true);
                        return;
                    }
                    column.setMinimum(source);
                });
            } else {
                const scale = availablePixels / getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                let pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (let i = colsToSpread.length - 1; i >= 0; i--) {
                    const column = colsToSpread[i];

                    const widthOverride = limitsMap?.[column.getId()];
                    const minOverride = widthOverride?.minWidth ?? params?.defaultMinWidth;
                    const maxOverride = widthOverride?.maxWidth ?? params?.defaultMaxWidth;
                    const colMinWidth = column.getMinWidth();
                    const colMaxWidth = column.getMaxWidth();
                    const minWidth =
                        typeof minOverride === 'number' && minOverride > colMinWidth ? minOverride : colMinWidth;
                    const maxWidth =
                        typeof maxOverride === 'number' && maxOverride < colMaxWidth ? maxOverride : colMaxWidth;
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

        // see notes above
        colsToDispatchEventFor.forEach((col) => {
            col.fireColumnWidthChangedEvent(source);
        });

        this.visibleColsService.setLeftValues(source);
        this.visibleColsService.updateBodyWidths();

        if (silent) {
            return;
        }

        this.eventDispatcher.columnResized(colsToDispatchEventFor, true, source);
    }

    public applyAutosizeStrategy(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (!autoSizeStrategy) {
            return;
        }

        const { type } = autoSizeStrategy;
        // ensure things like aligned grids have linked first
        setTimeout(() => {
            if (type === 'fitGridWidth') {
                const { columnLimits: propColumnLimits, defaultMinWidth, defaultMaxWidth } = autoSizeStrategy;
                const columnLimits = propColumnLimits?.map(({ colId: key, minWidth, maxWidth }) => ({
                    key,
                    minWidth,
                    maxWidth,
                }));
                this.ctrlsService.getGridBodyCtrl().sizeColumnsToFit({
                    defaultMinWidth,
                    defaultMaxWidth,
                    columnLimits,
                });
            } else if (type === 'fitProvidedWidth') {
                this.sizeColumnsToFit(autoSizeStrategy.width, 'sizeColumnsToFit');
            }
        });
    }
}
