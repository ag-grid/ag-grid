import { BeanStub } from "../context/beanStub";
import { Autowired, Bean } from '../context/context';
import { Column } from '../entities/column';
import {
    ColumnEvent,
    ColumnEventType, Events
} from '../events';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { SortController } from "../sortController";
import { areEqual } from '../utils/array';
import { exists } from '../utils/generic';
import { ColumnEventDispatcher } from './columnEventDispatcher';
import { ColumnModel, ColumnState, ColumnStateParams } from './columnModel';

export interface ModifyColumnsNoEventsCallbacks {
    addGroupCol(col: Column): void;
    removeGroupCol(col: Column): void;
    addPivotCol(col: Column): void;
    removePivotCol(col: Column): void;
    addValueCol(col: Column): void;
    removeValueCol(col: Column): void;
}

@Bean('columnStateService')
export class ColumnStateService extends BeanStub {
    
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Autowired('sortController') private sortController: SortController;
    
    public compareColumnStatesAndDispatchEvents(source: ColumnEventType): () => void {

        const startState = {
            rowGroupColumns: this.columnModel.getRowGroupColumns().slice(),
            pivotColumns: this.columnModel.getPivotColumns().slice(),
            valueColumns: this.columnModel.getValueColumns().slice()
        };

        const columnStateBefore = this.columnModel.getColumnState();
        const columnStateBeforeMap: { [colId: string]: ColumnState; } = {};

        columnStateBefore.forEach(col => {
            columnStateBeforeMap[col.colId!] = col;
        });

        return () => {
            const colsForState = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();

            // dispatches generic ColumnEvents where all columns are returned rather than what has changed
            const dispatchWhenListsDifferent = (eventType: string, colsBefore: Column[], colsAfter: Column[], idMapper: (column: Column) => string) => {
                const beforeList = colsBefore.map(idMapper);
                const afterList = colsAfter.map(idMapper);
                const unchanged = areEqual(beforeList, afterList);

                if (unchanged) { return; }

                const changes = new Set(colsBefore);
                colsAfter.forEach(id => {
                    // if the first list had it, delete it, as it's unchanged.
                    if (!changes.delete(id)) {
                        // if the second list has it, and first doesn't, add it.
                        changes.add(id);
                    }
                });
                
                const changesArr = [...changes];

                const event: WithoutGridCommon<ColumnEvent> = {
                    type: eventType,
                    columns: changesArr,
                    column: changesArr.length === 1 ? changesArr[0] : null,
                    source: source
                };

                this.eventService.dispatchEvent(event);
            };

            // determines which columns have changed according to supplied predicate
            const getChangedColumns = (changedPredicate: (cs: ColumnState, c: Column) => boolean): Column[] => {
                const changedColumns: Column[] = [];

                colsForState.forEach(column => {
                    const colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });

                return changedColumns;
            };

            const columnIdMapper = (c: Column) => c.getColId();

            dispatchWhenListsDifferent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
                startState.rowGroupColumns,
                this.columnModel.getRowGroupColumns(),
                columnIdMapper
            );

            dispatchWhenListsDifferent(Events.EVENT_COLUMN_PIVOT_CHANGED,
                startState.pivotColumns,
                this.columnModel.getPivotColumns(),
                columnIdMapper
            );

            const valueChangePredicate = (cs: ColumnState, c: Column) => {
                const oldActive = cs.aggFunc != null;

                const activeChanged = oldActive != c.isValueActive();
                // we only check aggFunc if the agg is active
                const aggFuncChanged = oldActive && cs.aggFunc != c.getAggFunc();

                return activeChanged || aggFuncChanged;
            };
            const changedValues = getChangedColumns(valueChangePredicate);
            if (changedValues.length > 0) {
                this.eventDispatcher.columnChanged(Events.EVENT_COLUMN_VALUE_CHANGED, changedValues, source);
            }

            const resizeChangePredicate = (cs: ColumnState, c: Column) => cs.width != c.getActualWidth();
            this.eventDispatcher.columnResized(getChangedColumns(resizeChangePredicate), true, source);

            const pinnedChangePredicate = (cs: ColumnState, c: Column) => cs.pinned != c.getPinned();
            this.eventDispatcher.columnPinned(getChangedColumns(pinnedChangePredicate), source);

            const visibilityChangePredicate = (cs: ColumnState, c: Column) => cs.hide == c.isVisible();
            this.eventDispatcher.columnVisible(getChangedColumns(visibilityChangePredicate), source);

            const sortChangePredicate = (cs: ColumnState, c: Column) => cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex();
            const changedColumns = getChangedColumns(sortChangePredicate);
            if (changedColumns.length > 0) {
                this.sortController.dispatchSortChangedEvents(source, changedColumns);
            }

            // special handling for moved column events
            this.normaliseColumnMovedEventForColumnState(columnStateBefore, source);
        };
    }

    private normaliseColumnMovedEventForColumnState(colStateBefore: ColumnState[], source: ColumnEventType) {
        // we are only interested in columns that were both present and visible before and after

        const colStateAfter = this.columnModel.getColumnState();

        const colStateAfterMapped: { [id: string]: ColumnState; } = {};
        colStateAfter.forEach(s => colStateAfterMapped[s.colId!] = s);

        // get id's of cols in both before and after lists
        const colsIntersectIds: { [id: string]: boolean; } = {};
        colStateBefore.forEach(s => {
            if (colStateAfterMapped[s.colId!]) {
                colsIntersectIds[s.colId!] = true;
            }
        });

        // filter state lists, so we only have cols that were present before and after
        const beforeFiltered = colStateBefore.filter(c => colsIntersectIds[c.colId!]);
        const afterFiltered = colStateAfter.filter(c => colsIntersectIds[c.colId!]);

        // see if any cols are in a different location
        const movedColumns: Column[] = [];

        afterFiltered!.forEach((csAfter: ColumnState, index: number) => {
            const csBefore = beforeFiltered && beforeFiltered[index];
            if (csBefore && csBefore.colId !== csAfter.colId) {
                const gridCol = this.columnModel.getGridColumn(csBefore.colId!);
                if (gridCol) {
                    movedColumns.push(gridCol);
                }
            }
        });

        if (!movedColumns.length) { return; }

        this.eventDispatcher.columnMoved({ movedColumns, source, finished: true });
    }

    public syncColumnWithStateItem(
        column: Column | null,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        rowGroupIndexes: { [key: string]: number; } | null,
        pivotIndexes: { [key: string]: number; } | null,
        autoCol: boolean,
        source: ColumnEventType,
        callbacks: ModifyColumnsNoEventsCallbacks
    ): void {

        if (!column) { return; }

        const getValue = <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(key1: U, key2?: S): { value1: ColumnStateParams[U] | undefined, value2: ColumnStateParams[S] | undefined; } => {
            const obj: { value1: ColumnStateParams[U] | undefined, value2: ColumnStateParams[S] | undefined; } = { value1: undefined, value2: undefined };
            let calculated: boolean = false;

            if (stateItem) {
                if (stateItem[key1] !== undefined) {
                    obj.value1 = stateItem[key1];
                    calculated = true;
                }
                if (exists(key2) && stateItem[key2] !== undefined) {
                    obj.value2 = stateItem[key2];
                    calculated = true;
                }
            }

            if (!calculated && defaultState) {
                if (defaultState[key1] !== undefined) {
                    obj.value1 = defaultState[key1];
                }
                if (exists(key2) && defaultState[key2] !== undefined) {
                    obj.value2 = defaultState[key2];
                }
            }

            return obj;
        };

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
        const minColWidth = column.getColDef().minWidth ?? this.environment.getMinColWidth();

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

        const aggFunc = getValue('aggFunc').value1;
        if (aggFunc !== undefined) {
            if (typeof aggFunc === 'string') {
                column.setAggFunc(aggFunc);
                if (!column.isValueActive()) {
                    column.setValueActive(true, source);
                    callbacks.addValueCol(column);
                }
            } else {
                if (exists(aggFunc)) {
                    console.warn('AG Grid: stateItem.aggFunc must be a string. if using your own aggregation ' +
                        'functions, register the functions first before using them in get/set state. This is because it is ' +
                        'intended for the column state to be stored and retrieved as simple JSON.');
                }
                // Note: we do not call column.setAggFunc(null), so that next time we aggregate
                // by this column (eg drag the column to the agg section int he toolpanel) it will
                // default to the last aggregation function.

                if (column.isValueActive()) {
                    column.setValueActive(false, source);
                    callbacks.removeValueCol(column);
                }
            }
        }

        const { value1: rowGroup, value2: rowGroupIndex } = getValue('rowGroup', 'rowGroupIndex');
        if (rowGroup !== undefined || rowGroupIndex !== undefined) {
            if (typeof rowGroupIndex === 'number' || rowGroup) {
                if (!column.isRowGroupActive()) {
                    column.setRowGroupActive(true, source);
                    callbacks.addGroupCol(column);
                }
                if (rowGroupIndexes && typeof rowGroupIndex === 'number') {
                    rowGroupIndexes[column.getId()] = rowGroupIndex;
                }
            } else {
                if (column.isRowGroupActive()) {
                    column.setRowGroupActive(false, source);
                    callbacks.removeGroupCol(column);
                }
            }
        }

        const { value1: pivot, value2: pivotIndex } = getValue('pivot', 'pivotIndex');
        if (pivot !== undefined || pivotIndex !== undefined) {
            if (typeof pivotIndex === 'number' || pivot) {
                if (!column.isPivotActive()) {
                    column.setPivotActive(true, source);
                    callbacks.addPivotCol(column);
                }
                if (pivotIndexes && typeof pivotIndex === 'number') {
                    pivotIndexes[column.getId()] = pivotIndex;
                }
            } else {
                if (column.isPivotActive()) {
                    column.setPivotActive(false, source);
                    callbacks.removePivotCol(column);
                }
            }
        }
    }
}
