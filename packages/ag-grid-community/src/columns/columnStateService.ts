import { doesMovePassMarryChildren, placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IAggFunc } from '../entities/colDef';
import type { ColumnEvent, ColumnEventType } from '../events';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { IColsService } from '../interfaces/iColsService';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IPivotResultColsService } from '../interfaces/iPivotResultColsService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import type { SortController } from '../sort/sortController';
import { _areEqual, _removeFromArray } from '../utils/array';
import { _exists, _missing } from '../utils/generic';
import { _warn } from '../validation/logging';
import {
    dispatchColumnChangedEvent,
    dispatchColumnPinnedEvent,
    dispatchColumnResizedEvent,
    dispatchColumnVisibleEvent,
} from './columnEventUtils';
import type { ColumnCollections, ColumnModel } from './columnModel';
import { GROUP_AUTO_COLUMN_ID, _getColumnsFromTree, getValueFactory, isColumnSelectionCol } from './columnUtils';
import type { SelectionColService } from './selectionColService';
import type { VisibleColsService } from './visibleColsService';

export type ModifyColumnsNoEventsCallback = {
    addCol(col: AgColumn): void;
    removeCol(col: AgColumn): void;
};

export interface ColumnStateParams {
    /** True if the column is hidden */
    hide?: boolean | null;
    /** Width of the column in pixels */
    width?: number;
    /** Column's flex if flex is set */
    flex?: number | null;
    /** Sort applied to the column */
    sort?: 'asc' | 'desc' | null;
    /** The order of the sort, if sorting by many columns */
    sortIndex?: number | null;
    /** The aggregation function applied */
    aggFunc?: string | IAggFunc | null;
    /** True if pivot active */
    pivot?: boolean | null;
    /** The order of the pivot, if pivoting by many columns */
    pivotIndex?: number | null;
    /** Set if column is pinned */
    pinned?: ColumnPinnedType;
    /** True if row group active */
    rowGroup?: boolean | null;
    /** The order of the row group, if grouping by many columns */
    rowGroupIndex?: number | null;
}

export interface ColumnState extends ColumnStateParams {
    /** ID of the column */
    colId: string;
}

export interface ApplyColumnStateParams {
    /** The state from `getColumnState` */
    state?: ColumnState[];
    /** Whether column order should be applied */
    applyOrder?: boolean;
    /** State to apply to columns where state is missing for those columns */
    defaultState?: ColumnStateParams;
}

export class ColumnStateService extends BeanStub implements NamedBean {
    beanName = 'columnStateService' as const;

    private columnModel: ColumnModel;
    private sortController?: SortController;
    private rowGroupColsService?: IColsService;
    private valueColsService?: IColsService;
    private pivotColsService?: IColsService;
    private visibleColsService: VisibleColsService;
    private columnAnimationService?: ColumnAnimationService;
    private pivotResultColsService?: IPivotResultColsService;
    private autoColService?: IAutoColService;
    private selectionColService?: SelectionColService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.sortController = beans.sortController;
        this.rowGroupColsService = beans.rowGroupColsService;
        this.valueColsService = beans.valueColsService;
        this.pivotColsService = beans.pivotColsService;
        this.visibleColsService = beans.visibleColsService;
        this.columnAnimationService = beans.columnAnimationService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.autoColService = beans.autoColService;
        this.selectionColService = beans.selectionColService;
    }

    public applyColumnState(params: ApplyColumnStateParams, source: ColumnEventType): boolean {
        const providedCols = this.columnModel.getColDefCols() || [];
        if (!providedCols?.length) {
            return false;
        }

        if (!params?.state?.forEach) {
            // state is not an array
            _warn(32);
            return false;
        }

        const applyStates = (
            states: ColumnState[],
            existingColumns: AgColumn[],
            getById: (id: string) => AgColumn | null
        ) => {
            const dispatchEventsFunc = this.compareColumnStatesAndDispatchEvents(source);

            // at the end below, this list will have all columns we got no state for
            const columnsWithNoState = existingColumns.slice();

            const rowGroupIndexes: { [key: string]: number } = {};
            const pivotIndexes: { [key: string]: number } = {};
            const autoColStates: ColumnState[] = [];
            const selectionColStates: ColumnState[] = [];
            // If pivoting is modified, these are the states we try to reapply after
            // the pivot result cols are re-generated
            const unmatchedAndAutoStates: ColumnState[] = [];
            let unmatchedCount = 0;

            const previousRowGroupCols = this.rowGroupColsService?.columns.slice() ?? [];
            const previousPivotCols = this.pivotColsService?.columns.slice() ?? [];

            states.forEach((state) => {
                const colId = state.colId;

                // auto group columns are re-created so deferring syncing with ColumnState
                const isAutoGroupColumn = colId.startsWith(GROUP_AUTO_COLUMN_ID);
                if (isAutoGroupColumn) {
                    autoColStates.push(state);
                    unmatchedAndAutoStates.push(state);
                    return;
                }

                if (isColumnSelectionCol(colId)) {
                    selectionColStates.push(state);
                    unmatchedAndAutoStates.push(state);
                    return;
                }

                const column = getById(colId);

                if (!column) {
                    unmatchedAndAutoStates.push(state);
                    unmatchedCount += 1;
                } else {
                    this.syncColumnWithStateItem(
                        column,
                        state,
                        params.defaultState,
                        rowGroupIndexes,
                        pivotIndexes,
                        false,
                        source
                    );
                    _removeFromArray(columnsWithNoState, column);
                }
            });

            // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
            const applyDefaultsFunc = (col: AgColumn) =>
                this.syncColumnWithStateItem(
                    col,
                    null,
                    params.defaultState,
                    rowGroupIndexes,
                    pivotIndexes,
                    false,
                    source
                );

            columnsWithNoState.forEach(applyDefaultsFunc);

            this.rowGroupColsService?.sortColumns(comparatorByIndex.bind(this, rowGroupIndexes, previousRowGroupCols));
            this.pivotColsService?.sortColumns(comparatorByIndex.bind(this, pivotIndexes, previousPivotCols));

            this.columnModel.refreshCols(false);

            const syncColStates = (
                getCol: (colId: string) => AgColumn | null,
                colStates: ColumnState[],
                columns: AgColumn[] = []
            ) => {
                colStates.forEach((stateItem) => {
                    const col = getCol(stateItem.colId);
                    _removeFromArray(columns, col);
                    this.syncColumnWithStateItem(col, stateItem, params.defaultState, null, null, true, source);
                });
                columns.forEach(applyDefaultsFunc);
            };

            // sync newly created auto group columns with ColumnState
            syncColStates(
                (colId: string) => this.autoColService?.getAutoCol(colId) ?? null,
                autoColStates,
                this.autoColService?.getAutoCols()?.slice()
            );

            // sync selection columns with ColumnState
            syncColStates(
                (colId: string) => this.selectionColService?.getSelectionCol(colId) ?? null,
                selectionColStates,
                this.selectionColService?.getSelectionCols()?.slice()
            );

            this.orderLiveColsLikeState(params);
            this.visibleColsService.refresh(source);
            this.eventService.dispatchEvent({
                type: 'columnEverythingChanged',
                source,
            });

            dispatchEventsFunc(); // Will trigger pivot result col changes if pivoting modified
            return { unmatchedAndAutoStates, unmatchedCount };
        };

        this.columnAnimationService?.start();

        // eslint-disable-next-line prefer-const
        let { unmatchedAndAutoStates, unmatchedCount } = applyStates(params.state || [], providedCols, (id) =>
            this.columnModel.getColDefCol(id)
        );

        // If there are still states left over, see if we can apply them to newly generated
        // pivot result cols or auto cols. Also if defaults exist, ensure they are applied to pivot resul cols
        if (unmatchedAndAutoStates.length > 0 || _exists(params.defaultState)) {
            const pivotResultColsList = this.pivotResultColsService?.getPivotResultCols()?.list ?? [];
            unmatchedCount = applyStates(
                unmatchedAndAutoStates,
                pivotResultColsList,
                (id) => this.pivotResultColsService?.getPivotResultCol(id) ?? null
            ).unmatchedCount;
        }
        this.columnAnimationService?.finish();

        return unmatchedCount === 0; // Successful if no states unaccounted for
    }

    public resetColumnState(source: ColumnEventType): void {
        const primaryCols = this.columnModel.getColDefCols();
        if (!primaryCols?.length) {
            return;
        }

        // NOTE = there is one bug here that no customer has noticed - if a column has colDef.lockPosition,
        // this is ignored  below when ordering the cols. to work, we should always put lockPosition cols first.
        // As a work around, developers should just put lockPosition columns first in their colDef list.

        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        const primaryColumnTree = this.columnModel.getColDefColTree();
        const primaryColumns = _getColumnsFromTree(primaryColumnTree);
        const columnStates: ColumnState[] = [];

        // we start at 1000, so if user has mix of rowGroup and group specified, it will work with both.
        // eg IF user has ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=true,
        // THEN result will be ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=1000
        let letRowGroupIndex = 1000;
        let letPivotIndex = 1000;

        let colsToProcess: AgColumn[] = [];
        const groupAutoCols = this.autoColService?.getAutoCols();
        if (groupAutoCols) {
            colsToProcess = colsToProcess.concat(groupAutoCols);
        }

        if (primaryColumns) {
            colsToProcess = colsToProcess.concat(primaryColumns);
        }

        colsToProcess.forEach((column) => {
            const stateItem = this.getColumnStateFromColDef(column);

            if (_missing(stateItem.rowGroupIndex) && stateItem.rowGroup) {
                stateItem.rowGroupIndex = letRowGroupIndex++;
            }

            if (_missing(stateItem.pivotIndex) && stateItem.pivot) {
                stateItem.pivotIndex = letPivotIndex++;
            }

            columnStates.push(stateItem);
        });

        this.applyColumnState({ state: columnStates, applyOrder: true }, source);
    }

    public getColumnStateFromColDef(column: AgColumn): ColumnState {
        const getValueOrNull = (a: any, b: any) => (a != null ? a : b != null ? b : null);

        const colDef = column.getColDef();
        const sort = getValueOrNull(colDef.sort, colDef.initialSort);
        const sortIndex = getValueOrNull(colDef.sortIndex, colDef.initialSortIndex);
        const hide = getValueOrNull(colDef.hide, colDef.initialHide);
        const pinned = getValueOrNull(colDef.pinned, colDef.initialPinned);

        const width = getValueOrNull(colDef.width, colDef.initialWidth);
        const flex = getValueOrNull(colDef.flex, colDef.initialFlex);

        let rowGroupIndex: number | null | undefined = getValueOrNull(
            colDef.rowGroupIndex,
            colDef.initialRowGroupIndex
        );
        let rowGroup: boolean | null | undefined = getValueOrNull(colDef.rowGroup, colDef.initialRowGroup);

        if (rowGroupIndex == null && (rowGroup == null || rowGroup == false)) {
            rowGroupIndex = null;
            rowGroup = null;
        }

        let pivotIndex: number | null | undefined = getValueOrNull(colDef.pivotIndex, colDef.initialPivotIndex);
        let pivot: boolean | null | undefined = getValueOrNull(colDef.pivot, colDef.initialPivot);

        if (pivotIndex == null && (pivot == null || pivot == false)) {
            pivotIndex = null;
            pivot = null;
        }

        const aggFunc = getValueOrNull(colDef.aggFunc, colDef.initialAggFunc);

        return {
            colId: column.getColId(),
            sort,
            sortIndex,
            hide,
            pinned,
            width,
            flex,
            rowGroup,
            rowGroupIndex,
            pivot,
            pivotIndex,
            aggFunc,
        };
    }

    private syncColumnWithStateItem(
        column: AgColumn | null,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        rowGroupIndexes: { [key: string]: number } | null,
        pivotIndexes: { [key: string]: number } | null,
        autoCol: boolean,
        source: ColumnEventType
    ): void {
        if (!column) {
            return;
        }

        const getValue = getValueFactory(stateItem, defaultState);

        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        const hide = getValue('hide').value1;
        if (hide !== undefined) {
            column.setVisible(!hide, source);
        }

        // sets pinned to 'left' or 'right'
        const pinned = getValue('pinned').value1;
        if (pinned !== undefined) {
            column.setPinned(pinned);
        }

        // if width provided and valid, use it, otherwise stick with the old width
        const minColWidth = column.getColDef().minWidth ?? this.gos.environment.getDefaultColumnMinWidth();

        // flex
        const flex = getValue('flex').value1;
        // if flex is null or a value, set into the col
        if (flex !== undefined) {
            column.setFlex(flex);
        }

        // if flex is null or undefined, fall back to setting width
        if (flex == null) {
            // if no flex, then use width if it's there
            const width = getValue('width').value1;
            if (width != null) {
                if (minColWidth != null && width >= minColWidth) {
                    column.setActualWidth(width, source);
                }
            }
        }

        const sort = getValue('sort').value1;
        if (sort !== undefined) {
            if (sort === 'desc' || sort === 'asc') {
                column.setSort(sort, source);
            } else {
                column.setSort(undefined, source);
            }
        }

        const sortIndex = getValue('sortIndex').value1;
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }

        // we do not do aggFunc, rowGroup or pivot for auto cols or secondary cols
        if (autoCol || !column.isPrimary()) {
            return;
        }

        this.valueColsService?.syncColumnWithState(column, source, getValue);
        this.rowGroupColsService?.syncColumnWithState(column, source, getValue, rowGroupIndexes);
        this.pivotColsService?.syncColumnWithState(column, source, getValue, pivotIndexes);
    }

    private orderLiveColsLikeState(params: ApplyColumnStateParams): void {
        if (!params.applyOrder || !params.state) {
            return;
        }
        const colIds: string[] = [];
        params.state.forEach((item) => {
            if (item.colId != null) {
                colIds.push(item.colId);
            }
        });
        this.sortColsLikeKeys(this.columnModel.cols, colIds);
    }

    private sortColsLikeKeys(cols: ColumnCollections | undefined, colIds: string[]): void {
        if (cols == null) {
            return;
        }

        let newOrder: AgColumn[] = [];
        const processedColIds: { [id: string]: boolean } = {};

        colIds.forEach((colId) => {
            if (processedColIds[colId]) {
                return;
            }
            const col = cols.map[colId];
            if (col) {
                newOrder.push(col);
                processedColIds[colId] = true;
            }
        });

        // add in all other columns
        let autoGroupInsertIndex = 0;
        cols.list.forEach((col) => {
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
                newOrder.splice(autoGroupInsertIndex++, 0, col);
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

        if (!doesMovePassMarryChildren(newOrder, this.columnModel.getColTree())) {
            _warn(39);
            return;
        }

        cols.list = newOrder;
    }

    // calculates what events to fire between column state changes. gets used when:
    // a) apply column state
    // b) apply new column definitions (so changes from old cols)
    public compareColumnStatesAndDispatchEvents(source: ColumnEventType): () => void {
        const startState = {
            rowGroupColumns: this.rowGroupColsService?.columns.slice() ?? [],
            pivotColumns: this.pivotColsService?.columns.slice() ?? [],
            valueColumns: this.valueColsService?.columns.slice() ?? [],
        };

        const columnStateBefore = this.getColumnState();
        const columnStateBeforeMap: { [colId: string]: ColumnState } = {};

        columnStateBefore.forEach((col) => {
            columnStateBeforeMap[col.colId!] = col;
        });

        return () => {
            const colsForState = this.columnModel.getAllCols();

            // dispatches generic ColumnEvents where all columns are returned rather than what has changed
            const dispatchWhenListsDifferent = (
                eventType: 'columnPivotChanged' | 'columnRowGroupChanged',
                colsBefore: AgColumn[],
                colsAfter: AgColumn[],
                idMapper: (column: AgColumn) => string
            ) => {
                const beforeList = colsBefore.map(idMapper);
                const afterList = colsAfter.map(idMapper);
                const unchanged = _areEqual(beforeList, afterList);

                if (unchanged) {
                    return;
                }

                const changes = new Set(colsBefore);
                colsAfter.forEach((id) => {
                    // if the first list had it, delete it, as it's unchanged.
                    if (!changes.delete(id)) {
                        // if the second list has it, and first doesn't, add it.
                        changes.add(id);
                    }
                });

                const changesArr = [...changes];

                this.eventService.dispatchEvent({
                    type: eventType,
                    columns: changesArr,
                    column: changesArr.length === 1 ? changesArr[0] : null,
                    source: source,
                } as WithoutGridCommon<ColumnEvent>);
            };

            // determines which columns have changed according to supplied predicate
            const getChangedColumns = (changedPredicate: (cs: ColumnState, c: AgColumn) => boolean): AgColumn[] => {
                const changedColumns: AgColumn[] = [];

                colsForState.forEach((column) => {
                    const colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });

                return changedColumns;
            };

            const columnIdMapper = (c: AgColumn) => c.getColId();

            dispatchWhenListsDifferent(
                'columnRowGroupChanged',
                startState.rowGroupColumns,
                this.rowGroupColsService?.columns ?? [],
                columnIdMapper
            );

            dispatchWhenListsDifferent(
                'columnPivotChanged',
                startState.pivotColumns,
                this.pivotColsService?.columns ?? [],
                columnIdMapper
            );

            const valueChangePredicate = (cs: ColumnState, c: AgColumn) => {
                const oldActive = cs.aggFunc != null;

                const activeChanged = oldActive != c.isValueActive();
                // we only check aggFunc if the agg is active
                const aggFuncChanged = oldActive && cs.aggFunc != c.getAggFunc();

                return activeChanged || aggFuncChanged;
            };
            const changedValues = getChangedColumns(valueChangePredicate);
            if (changedValues.length > 0) {
                dispatchColumnChangedEvent(this.eventService, 'columnValueChanged', changedValues, source);
            }

            const resizeChangePredicate = (cs: ColumnState, c: AgColumn) => cs.width != c.getActualWidth();
            dispatchColumnResizedEvent(this.eventService, getChangedColumns(resizeChangePredicate), true, source);

            const pinnedChangePredicate = (cs: ColumnState, c: AgColumn) => cs.pinned != c.getPinned();
            dispatchColumnPinnedEvent(this.eventService, getChangedColumns(pinnedChangePredicate), source);

            const visibilityChangePredicate = (cs: ColumnState, c: AgColumn) => cs.hide == c.isVisible();
            dispatchColumnVisibleEvent(this.eventService, getChangedColumns(visibilityChangePredicate), source);

            const sortChangePredicate = (cs: ColumnState, c: AgColumn) =>
                cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex();
            const changedColumns = getChangedColumns(sortChangePredicate);
            if (changedColumns.length > 0) {
                this.sortController?.dispatchSortChangedEvents(source, changedColumns);
            }

            // special handling for moved column events
            this.normaliseColumnMovedEventForColumnState(columnStateBefore, source);
        };
    }

    private normaliseColumnMovedEventForColumnState(colStateBefore: ColumnState[], source: ColumnEventType) {
        // we are only interested in columns that were both present and visible before and after

        const colStateAfter = this.getColumnState();

        const colStateAfterMapped: { [id: string]: ColumnState } = {};
        colStateAfter.forEach((s) => (colStateAfterMapped[s.colId!] = s));

        // get id's of cols in both before and after lists
        const colsIntersectIds: { [id: string]: boolean } = {};
        colStateBefore.forEach((s) => {
            if (colStateAfterMapped[s.colId!]) {
                colsIntersectIds[s.colId!] = true;
            }
        });

        // filter state lists, so we only have cols that were present before and after
        const beforeFiltered = colStateBefore.filter((c) => colsIntersectIds[c.colId!]);
        const afterFiltered = colStateAfter.filter((c) => colsIntersectIds[c.colId!]);

        // see if any cols are in a different location
        const movedColumns: AgColumn[] = [];

        afterFiltered!.forEach((csAfter: ColumnState, index: number) => {
            const csBefore = beforeFiltered && beforeFiltered[index];
            if (csBefore && csBefore.colId !== csAfter.colId) {
                const gridCol = this.columnModel.getCol(csBefore.colId!);
                if (gridCol) {
                    movedColumns.push(gridCol);
                }
            }
        });

        if (!movedColumns.length) {
            return;
        }

        this.eventService.dispatchEvent({
            type: 'columnMoved',
            columns: movedColumns,
            column: movedColumns.length === 1 ? movedColumns[0] : null,
            finished: true,
            source,
        });
    }

    public getColumnState(): ColumnState[] {
        const primaryCols = this.columnModel.getColDefCols();

        if (_missing(primaryCols) || !this.columnModel.isAlive()) {
            return [];
        }

        const colsForState = this.columnModel.getAllCols();
        const res = colsForState.map((col) => this.createStateItemFromColumn(col));

        this.orderColumnStateList(res);

        return res;
    }

    private createStateItemFromColumn(column: AgColumn): ColumnState {
        const rowGroupColumns = this.rowGroupColsService?.columns;
        const pivotColumns = this.pivotColsService?.columns;

        const rowGroupIndex = column.isRowGroupActive() && rowGroupColumns ? rowGroupColumns.indexOf(column) : null;
        const pivotIndex = column.isPivotActive() && pivotColumns ? pivotColumns.indexOf(column) : null;

        const aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        const sort = column.getSort() != null ? column.getSort() : null;
        const sortIndex = column.getSortIndex() != null ? column.getSortIndex() : null;

        const res: ColumnState = {
            colId: column.getColId(),
            width: column.getActualWidth(),
            hide: !column.isVisible(),
            pinned: column.getPinned(),
            sort,
            sortIndex,
            aggFunc,
            rowGroup: column.isRowGroupActive(),
            rowGroupIndex,
            pivot: column.isPivotActive(),
            pivotIndex: pivotIndex,
            flex: column.getFlex() ?? null,
        };

        return res;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        const gridColumns = this.columnModel.getCols();
        // for fast looking, store the index of each column
        const colIdToGridIndexMap = new Map<string, number>(gridColumns.map((col, index) => [col.getColId(), index]));

        columnStateList.sort((itemA: any, itemB: any) => {
            const posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            const posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA! - posB!;
        });
    }
}

// sort the lists according to the indexes that were provided
const comparatorByIndex = (indexes: { [key: string]: number }, oldList: AgColumn[], colA: AgColumn, colB: AgColumn) => {
    const indexA = indexes[colA.getId()];
    const indexB = indexes[colB.getId()];

    const aHasIndex = indexA != null;
    const bHasIndex = indexB != null;

    if (aHasIndex && bHasIndex) {
        // both a and b are new cols with index, so sort on index
        return indexA - indexB;
    }

    if (aHasIndex) {
        // a has an index, so it should be before a
        return -1;
    }

    if (bHasIndex) {
        // b has an index, so it should be before a
        return 1;
    }

    const oldIndexA = oldList.indexOf(colA);
    const oldIndexB = oldList.indexOf(colB);

    const aHasOldIndex = oldIndexA >= 0;
    const bHasOldIndex = oldIndexB >= 0;

    if (aHasOldIndex && bHasOldIndex) {
        // both a and b are old cols, so sort based on last order
        return oldIndexA - oldIndexB;
    }

    if (aHasOldIndex) {
        // a is old, b is new, so b is first
        return -1;
    }

    // this bit does matter, means both are new cols
    // but without index or that b is old and a is new
    return 1;
};
