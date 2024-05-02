import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional } from "../context/context";
import { ColDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { ColumnEventType, Events } from "../events";
import { IAggFuncService } from "../interfaces/iAggFuncService";
import { removeFromArray } from "../utils/array";
import { attrToBoolean, attrToNumber, exists, missingOrEmpty } from "../utils/generic";
import { ModifyColumnsNoEventsCallbacks } from "./columnApplyStateService";
import { ColumnEventDispatcher } from "./columnEventDispatcher";
import { ColKey, ColumnModel, ColumnState, Maybe } from "./columnModel";

@Bean('functionColumnsService')
export class FunctionColumnsService extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Optional('aggFuncService') private aggFuncService?: IAggFuncService;

    private rowGroupColumns: Column[] = [];
    private valueColumns: Column[] = [];
    private pivotColumns: Column[] = [];

    // niall note - this needs to change, it's horrible, it's here as it keeps
    // with the old algorithm
    public getModifyColumnsNoEventsCallbacks(): ModifyColumnsNoEventsCallbacks {
        return {
            addGroupCol: (column) => this.rowGroupColumns.push(column),
            removeGroupCol: (column) => removeFromArray(this.rowGroupColumns, column),
            addPivotCol: (column) => this.pivotColumns.push(column),
            removePivotCol: (column) => removeFromArray(this.pivotColumns, column),
            addValueCol: (column) => this.valueColumns.push(column),
            removeValueCol: (column) => removeFromArray(this.valueColumns, column)
        };
    }
    
    public getSourceColumnsForGroupColumn(groupCol: Column): Column[] | null {
        const sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }

        if (sourceColumnId === true) {
            return this.rowGroupColumns.slice(0);
        }

        const column = this.columnModel.getPrimaryColumn(sourceColumnId);
        return column ? [column] : null;
    }

    // niall note - needs to change, breaks encapsulation, shouldn't be allowing external source to sort
    public sortRowGroupColumns(compareFn?: (a: Column, b: Column) => number): void {
        this.rowGroupColumns.sort(compareFn);
    }

    // niall note - needs to change, breaks encapsulation, shouldn't be allowing external source to sort
    public sortPivotColumns(compareFn?: (a: Column, b: Column) => number): void {
        this.pivotColumns.sort(compareFn);
    }

    // + rowController
    public getValueColumns(): Column[] {
        return this.valueColumns ? this.valueColumns : [];
    }

    // + rowController
    public getPivotColumns(): Column[] {
        return this.pivotColumns ? this.pivotColumns : [];
    }

    // + toolPanel
    public getRowGroupColumns(): Column[] {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    }

    public isRowGroupEmpty(): boolean {
        return missingOrEmpty(this.rowGroupColumns);
    }

    public setRowGroupColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.columnModel.setAutoGroupsNeedBuilding();
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED, true,
            this.setRowGroupActive.bind(this),
            source);
    }
    
    private setRowGroupActive(active: boolean, column: Column, source: ColumnEventType): void {
        if (active === column.isRowGroupActive()) { return; }

        column.setRowGroupActive(active, source);

        if (active && !this.gos.get('suppressRowGroupHidesColumns')) {
            this.columnModel.setColumnsVisible([column], false, source);
        }
        if (!active && !this.gos.get('suppressMakeColumnVisibleAfterUnGroup')) {
            this.columnModel.setColumnsVisible([column], true, source);
        }
    }

    public addRowGroupColumns(keys: Maybe<ColKey>[], source: ColumnEventType): void {
        this.columnModel.setAutoGroupsNeedBuilding();
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true,
            this.setRowGroupActive.bind(this, true),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            source
        );
    }

    public removeRowGroupColumns(keys: Maybe<ColKey>[] | null, source: ColumnEventType): void {
        this.columnModel.setAutoGroupsNeedBuilding();
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false,
            this.setRowGroupActive.bind(this, false),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            source);
    }

    public addPivotColumns(keys: ColKey[], source: ColumnEventType): void {
        this.updatePrimaryColumnList(keys, this.pivotColumns, true,
            column => column.setPivotActive(true, source),
            Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    }

    public setPivotColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.setPrimaryColumnList(colKeys, this.pivotColumns, Events.EVENT_COLUMN_PIVOT_CHANGED, true,
            (added: boolean, column: Column) => {
                column.setPivotActive(added, source);
            }, source
        );
    }

    public removePivotColumns(keys: ColKey[], source: ColumnEventType): void {
        this.updatePrimaryColumnList(
            keys,
            this.pivotColumns,
            false,
            column => column.setPivotActive(false, source),
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            source
        );
    }

    public setValueColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.setPrimaryColumnList(colKeys, this.valueColumns,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            false,
            this.setValueActive.bind(this),
            source
        );
    }

    private setValueActive(active: boolean, column: Column, source: ColumnEventType): void {
        if (active === column.isValueActive()) { return; }

        column.setValueActive(active, source);

        if (active && !column.getAggFunc() && this.aggFuncService) {
            const initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    }

    public addValueColumns(keys: ColKey[], source: ColumnEventType): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, true,
            this.setValueActive.bind(this, true),
            Events.EVENT_COLUMN_VALUE_CHANGED,
            source
        );
    }

    public removeValueColumns(keys: ColKey[], source: ColumnEventType): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, false,
            this.setValueActive.bind(this, false),
            Events.EVENT_COLUMN_VALUE_CHANGED,
            source
        );
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        if (this.isRowGroupEmpty()) { return; }

        const column = this.rowGroupColumns[fromIndex];

        const impactedColumns = this.rowGroupColumns.slice(fromIndex, toIndex);
        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);

        this.eventDispatcher.rowGroupChanged(impactedColumns, source);
    }

    private setPrimaryColumnList(
        colKeys: ColKey[],
        masterList: Column[],
        eventName: string,
        detectOrderChange: boolean,
        columnCallback: (added: boolean, column: Column) => void,
        source: ColumnEventType,
    ): void {
        const gridColumns = this.columnModel.getAllGridColumns();
        if (missingOrEmpty(gridColumns)) { return; }

        const changes: Map<Column, number> = new Map();
        // store all original cols and their index.
        masterList.forEach((col, idx) => changes.set(col, idx));

        masterList.length = 0;

        if (exists(colKeys)) {
            colKeys.forEach(key => {
                const column = this.columnModel.getPrimaryColumn(key);
                if (column) {
                    masterList.push(column);
                }
            });
        }

        masterList.forEach((col, idx) => {
            const oldIndex = changes.get(col);
            // if the column was not in the list, we add it as it's a change
            // idx is irrelevant now.
            if (oldIndex === undefined) {
                changes.set(col, 0);
                return;
            }

            if (detectOrderChange && oldIndex !== idx) {
                // if we're detecting order changes, and the indexes differ, we retain this as it's changed
                return;
            }
            
            // otherwise remove this col, as it's unchanged.
            changes.delete(col);
        });

        const primaryCols = this.columnModel.getAllPrimaryColumns();
        (primaryCols || []).forEach(column => {
            const added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });

        if (this.columnModel.isAutoGroupsNeedBuilding()) {
            this.columnModel.updateGridColumns();
        }

        this.columnModel.updateDisplayedColumns(source);

        this.eventDispatcher.columnChanged(eventName, [...changes.keys()], source);
    }

    private updatePrimaryColumnList(
        keys: Maybe<ColKey>[] | null,
        masterList: Column[],
        actionIsAdd: boolean,
        columnCallback: (column: Column) => void,
        eventType: string,
        source: ColumnEventType
    ) {

        if (!keys || missingOrEmpty(keys)) { return; }

        let atLeastOne = false;

        keys.forEach(key => {
            if (!key) { return; }
            const columnToAdd = this.columnModel.getPrimaryColumn(key);
            if (!columnToAdd) { return; }

            if (actionIsAdd) {
                if (masterList.indexOf(columnToAdd) >= 0) { return; }
                masterList.push(columnToAdd);
            } else {
                if (masterList.indexOf(columnToAdd) < 0) { return; }
                removeFromArray(masterList, columnToAdd);
            }

            columnCallback(columnToAdd);
            atLeastOne = true;
        });

        if (!atLeastOne) { return; }

        if (this.columnModel.isAutoGroupsNeedBuilding()) {
            this.columnModel.updateGridColumns();
        }

        this.columnModel.updateDisplayedColumns(source);

        this.eventDispatcher.genericColumnEvent(eventType, masterList, source);
    }

    public extractColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.extractRowGroupColumns(source, oldPrimaryColumns);
        this.extractPivotColumns(source, oldPrimaryColumns);
        this.extractValueColumns(source, oldPrimaryColumns);
    }

    private extractValueColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.valueColumns = this.extractColumnsCommon(
            oldPrimaryColumns,
            this.valueColumns,
            (col: Column, flag: boolean) => col.setValueActive(flag, source),
            // aggFunc doesn't have index variant, cos order of value cols doesn't matter, so always return null
            () => undefined,
            () => undefined,
            // aggFunc is a string, so return it's existence
            (colDef: ColDef) => {
                const aggFunc = colDef.aggFunc;
                // null or empty string means clear
                if (aggFunc === null || aggFunc === '') {
                    return null;
                }
                if (aggFunc === undefined) {
                    return;
                }

                return !!aggFunc;
            },
            (colDef: ColDef) => {
                // return false if any of the following: null, undefined, empty string
                return colDef.initialAggFunc != null && colDef.initialAggFunc != '';
            }
        );

        // all new columns added will have aggFunc missing, so set it to what is in the colDef
        this.valueColumns.forEach(col => {
            const colDef = col.getColDef();
            // if aggFunc provided, we always override, as reactive property
            if (colDef.aggFunc != null && colDef.aggFunc != '') {
                col.setAggFunc(colDef.aggFunc);
            } else {
                // otherwise we use initialAggFunc only if no agg func set - which happens when new column only
                if (!col.getAggFunc()) {
                    col.setAggFunc(colDef.initialAggFunc);
                }
            }
        });
    }

    private extractRowGroupColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.rowGroupColumns = this.extractColumnsCommon(oldPrimaryColumns, this.rowGroupColumns,
            (col: Column, flag: boolean) => col.setRowGroupActive(flag, source),
            (colDef: ColDef) => colDef.rowGroupIndex,
            (colDef: ColDef) => colDef.initialRowGroupIndex,
            (colDef: ColDef) => colDef.rowGroup,
            (colDef: ColDef) => colDef.initialRowGroup,
        );
    }

    private extractPivotColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.pivotColumns = this.extractColumnsCommon(
            oldPrimaryColumns,
            this.pivotColumns,
            (col: Column, flag: boolean) => col.setPivotActive(flag, source),
            (colDef: ColDef) => colDef.pivotIndex,
            (colDef: ColDef) => colDef.initialPivotIndex,
            (colDef: ColDef) => colDef.pivot,
            (colDef: ColDef) => colDef.initialPivot,
        );
    }

    private extractColumnsCommon(
        oldPrimaryColumns: Column[] = [],
        previousCols: Column[] = [],
        setFlagFunc: (col: Column, flag: boolean) => void,
        getIndexFunc: (colDef: ColDef) => number | null | undefined,
        getInitialIndexFunc: (colDef: ColDef) => number | null | undefined,
        getValueFunc: (colDef: ColDef) => boolean | null | undefined,
        getInitialValueFunc: (colDef: ColDef) => boolean | undefined
    ): Column[] {

        const colsWithIndex: Column[] = [];
        const colsWithValue: Column[] = [];

        const primaryCols = this.columnModel.getAllPrimaryColumns() || [];

        // go though all cols.
        // if value, change
        // if default only, change only if new
        primaryCols.forEach(col => {
            const colIsNew = oldPrimaryColumns.indexOf(col) < 0;
            const colDef = col.getColDef();

            const value = attrToBoolean(getValueFunc(colDef));
            const initialValue = attrToBoolean(getInitialValueFunc(colDef));
            const index = attrToNumber(getIndexFunc(colDef));
            const initialIndex = attrToNumber(getInitialIndexFunc(colDef));

            let include: boolean;

            const valuePresent = value !== undefined;
            const indexPresent = index !== undefined;
            const initialValuePresent = initialValue !== undefined;
            const initialIndexPresent = initialIndex !== undefined;

            if (valuePresent) {
                include = value!; // boolean value is guaranteed as attrToBoolean() is used above
            } else if (indexPresent) {
                if (index === null) {
                    // if col is new we don't want to use the default / initial if index is set to null. Similarly,
                    // we don't want to include the property for existing columns, i.e. we want to 'clear' it.
                    include = false;
                } else {
                    // note that 'null >= 0' evaluates to true which means 'rowGroupIndex = null' would enable row
                    // grouping if the null check didn't exist above.
                    include = index! >= 0;
                }
            } else {
                if (colIsNew) {
                    // as no value or index is 'present' we use the default / initial when col is new
                    if (initialValuePresent) {
                        include = initialValue!;
                    } else if (initialIndexPresent) {
                        include = initialIndex != null && initialIndex >= 0;
                    } else {
                        include = false;
                    }
                } else {
                    // otherwise include it if included last time, e.g. if we are extracting row group cols and this col
                    // is an existing row group col (i.e. it exists in 'previousCols') then we should include it.
                    include = previousCols.indexOf(col) >= 0;
                }
            }

            if (include) {
                const useIndex = colIsNew ? (index != null || initialIndex != null) : index != null;
                useIndex ? colsWithIndex.push(col) : colsWithValue.push(col);
            }
        });

        const getIndexForCol = (col: Column): number => {
            const index = getIndexFunc(col.getColDef());
            const defaultIndex = getInitialIndexFunc(col.getColDef());

            return index != null ? index : defaultIndex!;
        };

        // sort cols with index, and add these first
        colsWithIndex.sort((colA, colB) => {
            const indexA = getIndexForCol(colA);
            const indexB = getIndexForCol(colB);

            if (indexA === indexB) { return 0; }
            if (indexA < indexB) { return -1; }

            return 1;
        });

        const res: Column[] = ([] as Column[]).concat(colsWithIndex);

        // second add columns that were there before and in the same order as they were before,
        // so we are preserving order of current grouping of columns that simply have rowGroup=true
        previousCols.forEach(col => {
            if (colsWithValue.indexOf(col) >= 0) {
                res.push(col);
            }
        });

        // lastly put in all remaining cols
        colsWithValue.forEach(col => {
            if (res.indexOf(col) < 0) {
                res.push(col);
            }
        });

        // set flag=false for removed cols
        previousCols.forEach(col => {
            if (res.indexOf(col) < 0) {
                setFlagFunc(col, false);
            }
        });
        // set flag=true for newly added cols
        res.forEach(col => {
            if (previousCols.indexOf(col) < 0) {
                setFlagFunc(col, true);
            }
        });

        return res;
    }
    
    public generateColumnStateForRowGroupAndPivotIndexes(
        updatedRowGroupColumnState: { [colId: string]: ColumnState },
        updatedPivotColumnState: { [colId: string]: ColumnState }
    ): ColumnState[] {
        // Generally columns should appear in the order they were before. For any new columns, these should appear in the original col def order.
        // The exception is for columns that were added via `addGroupColumns`. These should appear at the end.
        // We don't have to worry about full updates, as in this case the arrays are correct, and they won't appear in the updated lists.

        let existingColumnStateUpdates: { [colId: string]: ColumnState } = {};

        const orderColumns = (
            updatedColumnState: { [colId: string]: ColumnState }, colList: Column[],
            enableProp: 'rowGroup' | 'pivot', initialEnableProp: 'initialRowGroup' | 'initialPivot',
            indexProp: 'rowGroupIndex' | 'pivotIndex', initialIndexProp: 'initialRowGroupIndex' | 'initialPivotIndex'
        ) => {
            const primaryCols = this.columnModel.getAllPrimaryColumns();
            if (!colList.length || !primaryCols) { return []; }
            const updatedColIdArray = Object.keys(updatedColumnState);
            const updatedColIds = new Set(updatedColIdArray);
            const newColIds = new Set(updatedColIdArray);
            const allColIds = new Set(colList.map(column => {
                const colId = column.getColId();
                newColIds.delete(colId);
                return colId;
            }).concat(updatedColIdArray));

            const colIdsInOriginalOrder: string[] = [];
            const originalOrderMap: { [colId: string]: number } = {};
            let orderIndex = 0;
            for (let i = 0; i < primaryCols.length; i++) {
                const colId = primaryCols[i].getColId();
                if (allColIds.has(colId)) {
                    colIdsInOriginalOrder.push(colId);
                    originalOrderMap[colId] = orderIndex++;
                }
            }

            // follow approach in `resetColumnState`
            let index = 1000;
            let hasAddedNewCols = false;
            let lastIndex = 0;

            const processPrecedingNewCols = (colId: string) => {
                const originalOrderIndex = originalOrderMap[colId];
                for (let i = lastIndex; i < originalOrderIndex; i++) {
                    const newColId = colIdsInOriginalOrder[i];
                    if (newColIds.has(newColId)) {
                        updatedColumnState[newColId][indexProp] = index++;
                        newColIds.delete(newColId);
                    }
                }
                lastIndex = originalOrderIndex;
            }

            colList.forEach(column => {
                const colId = column.getColId();
                if (updatedColIds.has(colId)) {
                    // New col already exists. Add any other new cols that should be before it.
                    processPrecedingNewCols(colId);
                    updatedColumnState[colId][indexProp] = index++;
                } else {
                    const colDef = column.getColDef();
                    const missingIndex = colDef[indexProp] === null || (colDef[indexProp] === undefined && colDef[initialIndexProp] == null);
                    if (missingIndex) {
                        if (!hasAddedNewCols) {
                            const propEnabled = colDef[enableProp] || (colDef[enableProp] === undefined && colDef[initialEnableProp]);
                            if (propEnabled) {
                                processPrecedingNewCols(colId);
                            } else {
                                // Reached the first manually added column. Add all the new columns now.
                                newColIds.forEach(newColId => {
                                    // Rather than increment the index, just use the original order index - doesn't need to be contiguous.
                                    updatedColumnState[newColId][indexProp] = index + originalOrderMap[newColId];
                                });
                                index += colIdsInOriginalOrder.length;
                                hasAddedNewCols = true;
                            }
                        }
                        if (!existingColumnStateUpdates[colId]) {
                            existingColumnStateUpdates[colId] = { colId };
                        }
                        existingColumnStateUpdates[colId][indexProp] = index++;
                    }
                }
            });
        }

        orderColumns(updatedRowGroupColumnState, this.rowGroupColumns, 'rowGroup', 'initialRowGroup', 'rowGroupIndex', 'initialRowGroupIndex');
        orderColumns(updatedPivotColumnState, this.pivotColumns, 'pivot', 'initialPivot', 'pivotIndex', 'initialPivotIndex');

        return Object.values(existingColumnStateUpdates);
    }
}