import { _removeFromArray } from '../agStack/utils/array';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColKey } from '../entities/colDef';
import type { ColumnEvent, ColumnEventType } from '../events';
import type { IAggFuncService } from '../interfaces/iAggFuncService';
import type {
    ColumnExtractors,
    ColumnOrdering,
    ColumnProcessor,
    ColumnProcessors,
    IColsService,
} from '../interfaces/iColsService';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IGroupHierarchyColService } from '../interfaces/iGroupHierarchyColService';
import type { ColumnChangedEventType } from './columnApi';
import { dispatchColumnChangedEvent } from './columnEventUtils';
import type { ColumnModel, Maybe } from './columnModel';
import type { ColumnState, ColumnStateParams } from './columnStateUtils';
import type { VisibleColsService } from './visibleColsService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseColsService extends BeanStub implements IColsService {
    protected colModel: ColumnModel;
    protected aggFuncSvc?: IAggFuncService;
    protected visibleCols: VisibleColsService;
    protected groupHierarchCols?: IGroupHierarchyColService;
    protected dispatchColumnChangedEvent = dispatchColumnChangedEvent;

    abstract eventName: ColumnChangedEventType;
    abstract columnProcessors: ColumnProcessors;
    abstract columnExtractors: ColumnExtractors;
    columnOrdering: ColumnOrdering;

    public columns: AgColumn[] = [];
    public columnIndexMap: { [key: string]: number } = {};

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.aggFuncSvc = beans.aggFuncSvc;
        this.visibleCols = beans.visibleCols;
        this.groupHierarchCols = beans.groupHierarchyColSvc;
    }

    public sortColumns(compareFn: (a: AgColumn, b: AgColumn) => number): void {
        const { groupHierarchCols } = this;
        this.columns.sort((a, b) => groupHierarchCols?.compareVirtualColumns(a, b) ?? compareFn(a, b));
        this.updateIndexMap();
    }

    public setColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void {
        this.setColList(colKeys, this.columns, this.eventName, true, true, this.columnProcessors.set, source);
    }

    public addColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void {
        this.updateColList(colKeys, this.columns, true, true, this.columnProcessors.add, this.eventName, source);
    }

    public removeColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void {
        this.updateColList(colKeys, this.columns, false, true, this.columnProcessors.remove, this.eventName, source);
    }

    public getColumnIndex(colId: string): number | undefined {
        return this.columnIndexMap[colId];
    }

    protected updateIndexMap = (): void => {
        const indexMap: { [key: string]: number } = {};
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            indexMap[cols[i].colId] = i;
        }
        this.columnIndexMap = indexMap;
    };

    private setColList(
        colKeys: ColKey[] = [],
        masterList: AgColumn[],
        eventName: IColsService['eventName'],
        detectOrderChange: boolean,
        autoGroupsNeedBuilding: boolean,
        columnCallback: ColumnProcessor,
        source: ColumnEventType
    ): void {
        const gridColumns = this.colModel.getCols();
        if (!gridColumns || gridColumns.length === 0) {
            return;
        }

        const changes: Map<AgColumn, number> = new Map();
        // store all original cols and their index.
        masterList.forEach((col, idx) => changes.set(col, idx));

        masterList.length = 0;

        for (const key of colKeys) {
            const column = this.colModel.getColDefCol(key);
            if (column) {
                masterList.push(column);
            }
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

        this.updateIndexMap();

        const primaryCols = this.colModel.getColDefCols();

        for (const column of primaryCols ?? []) {
            const added = masterList.indexOf(column) >= 0;
            columnCallback(column, added, source);
        }

        if (autoGroupsNeedBuilding) {
            this.colModel.refreshCols(false, source);
        }

        this.visibleCols.refresh(source);

        this.dispatchColumnChangedEvent(this.eventSvc, eventName, [...changes.keys()], source);
    }

    private updateColList(
        keys: Maybe<ColKey>[] = [],
        masterList: AgColumn[],
        actionIsAdd: boolean,
        autoGroupsNeedBuilding: boolean,
        columnCallback: ColumnProcessor,
        eventType: IColsService['eventName'],
        source: ColumnEventType
    ) {
        if (!keys || keys.length === 0) {
            return;
        }

        let atLeastOne = false;
        const updatedCols: Set<AgColumn> = new Set();

        for (const key of keys) {
            if (!key) {
                continue;
            }
            const columnToAdd = this.colModel.getColDefCol(key);
            if (!columnToAdd) {
                continue;
            }
            updatedCols.add(columnToAdd);

            if (actionIsAdd) {
                if (masterList.indexOf(columnToAdd) >= 0) {
                    continue;
                }
                masterList.push(columnToAdd);
            } else {
                const currentIndex = masterList.indexOf(columnToAdd);
                if (currentIndex < 0) {
                    continue;
                }
                for (let i = currentIndex + 1; i < masterList.length; i++) {
                    // row indexes of subsequent columns have changed
                    updatedCols.add(masterList[i]);
                }
                _removeFromArray(masterList, columnToAdd);
            }

            columnCallback(columnToAdd, actionIsAdd, source);
            atLeastOne = true;
        }

        if (!atLeastOne) {
            return;
        }

        this.updateIndexMap();

        if (autoGroupsNeedBuilding) {
            this.colModel.refreshCols(false, source);
        }

        this.visibleCols.refresh(source);

        const eventColumns = Array.from(updatedCols);
        this.eventSvc.dispatchEvent({
            type: eventType,
            columns: eventColumns,
            column: eventColumns.length === 1 ? eventColumns[0] : null,
            source,
        } as WithoutGridCommon<ColumnEvent>);
    }

    public extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] = []): AgColumn[] {
        const previousCols = this.columns;
        const { setFlagFunc, getIndexFunc, getInitialIndexFunc, getValueFunc, getInitialValueFunc } =
            this.columnExtractors;
        const primaryCols = this.colModel.getColDefCols();

        // O(1) membership for the prior-set checks below.
        const oldProvidedSet = oldProvidedCols.length > 0 ? new Set(oldProvidedCols) : null;
        const previousSet = previousCols.length > 0 ? new Set(previousCols) : null;

        const colsWithIndex: AgColumn[] = [];
        const colsWithValueSet = new Set<AgColumn>();
        const colsWithValue: AgColumn[] = [];

        for (const col of primaryCols ?? []) {
            const colIsNew = !oldProvidedSet?.has(col);
            const colDef = col.colDef;

            const value = getValueFunc(colDef);
            const initialValue = getInitialValueFunc(colDef);
            const index = getIndexFunc(colDef);
            const initialIndex = getInitialIndexFunc(colDef);

            let include: boolean;

            const valuePresent = value !== undefined;
            const indexPresent = index !== undefined;

            if (valuePresent) {
                include = value!;
            } else if (indexPresent) {
                // `index === null` clears the prop on existing cols; otherwise `index >= 0`
                // (note `null >= 0 === true`, hence the null guard).
                include = index !== null && index >= 0;
            } else if (colIsNew) {
                if (initialValue !== undefined) {
                    include = initialValue!;
                } else if (initialIndex !== undefined) {
                    include = initialIndex != null && initialIndex >= 0;
                } else {
                    include = false;
                }
            } else {
                // Existing col with no value/index: keep its prior inclusion.
                include = previousSet?.has(col) ?? false;
            }

            if (include) {
                const useIndex = colIsNew ? index != null || initialIndex != null : index != null;
                if (useIndex) {
                    colsWithIndex.push(col);
                } else {
                    colsWithValue.push(col);
                    colsWithValueSet.add(col);
                }
            }
        }

        colsWithIndex.sort((colA, colB) => {
            const a = getIndexFunc(colA.colDef) ?? getInitialIndexFunc(colA.colDef)!;
            const b = getIndexFunc(colB.colDef) ?? getInitialIndexFunc(colB.colDef)!;
            return a - b;
        });

        // Build `res` in order: indexed cols first, then prior-order value cols, then remaining.
        // `expandColumnInto` (when hierarchy is active) emits `[...virtuals, source]` deduped
        // against `resSet` — the shared dedup state keeps total cost O(N) across the loop.
        const groupHierarchCols = this.groupHierarchCols;
        const res: AgColumn[] = [];
        const resSet = new Set<AgColumn>();
        const addCol = (col: AgColumn): void => {
            if (groupHierarchCols) {
                groupHierarchCols.expandColumnInto(res, resSet, col);
            } else if (!resSet.has(col)) {
                res.push(col);
                resSet.add(col);
            }
        };

        for (let i = 0, len = colsWithIndex.length; i < len; ++i) {
            addCol(colsWithIndex[i]);
        }
        for (let i = 0, len = previousCols.length; i < len; ++i) {
            const col = previousCols[i];
            if (colsWithValueSet.has(col)) {
                addCol(col);
            }
        }
        for (let i = 0, len = colsWithValue.length; i < len; ++i) {
            addCol(colsWithValue[i]);
        }

        for (const col of previousCols) {
            if (!resSet.has(col)) {
                setFlagFunc(col, false, source);
            }
        }
        if (previousSet !== null) {
            for (const col of res) {
                if (!previousSet.has(col)) {
                    setFlagFunc(col, true, source);
                }
            }
        } else {
            for (const col of res) {
                setFlagFunc(col, true, source);
            }
        }

        this.columns = res;
        this.updateIndexMap();
        return this.columns;
    }

    public abstract syncColumnWithState(
        column: AgColumn,
        source: ColumnEventType,
        getValue: <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(
            key1: U,
            key2?: S
        ) => { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined },
        rowIndex: { [key: string]: number } | null
    ): void;

    public restoreColumnOrder(
        columnStateAccumulator: { [colId: string]: ColumnState },
        incomingColumnState: { [colId: string]: ColumnState }
    ): { [colId: string]: ColumnState } {
        const colList = this.columns;

        const primaryCols = this.colModel.getColDefCols();
        if (!colList.length || !primaryCols) {
            return columnStateAccumulator;
        }
        const updatedColIdArray = Object.keys(incomingColumnState);
        const updatedColIds = new Set(updatedColIdArray);
        const newColIds = new Set(updatedColIdArray);
        const allColIds = new Set(
            colList
                .map((column) => {
                    const colId = column.colId;
                    newColIds.delete(colId);
                    return colId;
                })
                .concat(updatedColIdArray)
        );

        const colIdsInOriginalOrder: string[] = [];
        const originalOrderMap: { [colId: string]: number } = {};
        let orderIndex = 0;
        for (let i = 0; i < primaryCols.length; i++) {
            const colId = primaryCols[i].colId;
            if (allColIds.has(colId)) {
                colIdsInOriginalOrder.push(colId);
                originalOrderMap[colId] = orderIndex++;
            }
        }

        // follow approach in `resetColumnState`
        let index = 1000;
        let hasAddedNewCols = false;
        let lastIndex = 0;

        const enableProp = this.columnOrdering.enableProp;
        const initialEnableProp = this.columnOrdering.initialEnableProp;
        const indexProp = this.columnOrdering.indexProp;
        const initialIndexProp = this.columnOrdering.initialIndexProp;

        const processPrecedingNewCols = (colId: string) => {
            const originalOrderIndex = originalOrderMap[colId];
            for (let i = lastIndex; i < originalOrderIndex; i++) {
                const newColId = colIdsInOriginalOrder[i];
                if (newColIds.has(newColId)) {
                    incomingColumnState[newColId][indexProp] = index++;
                    newColIds.delete(newColId);
                }
            }
            lastIndex = originalOrderIndex;
        };

        for (const column of colList) {
            const colId = column.colId;
            if (updatedColIds.has(colId)) {
                // New col already exists. Add any other new cols that should be before it.
                processPrecedingNewCols(colId);
                incomingColumnState[colId][indexProp] = index++;
            } else {
                const colDef = column.colDef;
                const missingIndex =
                    colDef[indexProp] === null || (colDef[indexProp] === undefined && colDef[initialIndexProp] == null);
                if (missingIndex) {
                    if (!hasAddedNewCols) {
                        const propEnabled =
                            colDef[enableProp] || (colDef[enableProp] === undefined && colDef[initialEnableProp]);
                        if (propEnabled) {
                            processPrecedingNewCols(colId);
                        } else {
                            // Reached the first manually added column. Add all the new columns now.
                            for (const newColId of newColIds) {
                                // Rather than increment the index, just use the original order index - doesn't need to be contiguous.
                                incomingColumnState[newColId][indexProp] = index + originalOrderMap[newColId];
                            }
                            index += colIdsInOriginalOrder.length;
                            hasAddedNewCols = true;
                        }
                    }
                    if (!columnStateAccumulator[colId]) {
                        columnStateAccumulator[colId] = { colId };
                    }
                    columnStateAccumulator[colId][indexProp] = index++;
                }
            }
        }

        return columnStateAccumulator;
    }
}
