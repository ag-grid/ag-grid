import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IAggFunc } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColKey, ColumnModel, Maybe } from './columnModel';
import type { ColumnState, ModifyColumnsNoEventsCallbacks } from './columnStateService';
import type { PivotColsService } from './pivotColsService';
import type { RowGroupColsService } from './rowGroupColsService';
import type { ValueColsService } from './valueColsService';

export class FuncColsService extends BeanStub implements NamedBean {
    beanName = 'funcColsService' as const;

    private columnModel: ColumnModel;
    private rowGroupColsService: RowGroupColsService;
    private valueColsService: ValueColsService;
    private pivotColsService: PivotColsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.rowGroupColsService = beans.rowGroupColsService!;
        this.valueColsService = beans.valueColsService!;
        this.pivotColsService = beans.pivotColsService!;
    }

    public get rowGroupCols(): AgColumn[] {
        return this.rowGroupColsService.columns;
    }
    public get valueCols(): AgColumn[] {
        return this.valueColsService.columns;
    }
    public get pivotCols(): AgColumn[] {
        return this.pivotColsService.columns;
    }

    public getModifyColumnsNoEventsCallbacks(): ModifyColumnsNoEventsCallbacks {
        const rowGroupFns = this.rowGroupColsService.getModifyColumnsNoEventsCallbacks();
        const pivotFns = this.pivotColsService.getModifyColumnsNoEventsCallbacks();
        const valueFns = this.valueColsService.getModifyColumnsNoEventsCallbacks();

        return {
            ...rowGroupFns,
            ...pivotFns,
            ...valueFns,
        };
    }

    public getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null {
        return this.rowGroupColsService.getSourceColumnsForGroupColumn(groupCol);
    }

    public sortRowGroupColumns(compareFn?: (a: AgColumn, b: AgColumn) => number): void {
        this.rowGroupColsService.sortColumns(compareFn);
    }

    public sortPivotColumns(compareFn?: (a: AgColumn, b: AgColumn) => number): void {
        this.pivotColsService.sortColumns(compareFn);
    }

    public isRowGroupEmpty(): boolean {
        return this.rowGroupColsService.isRowGroupEmpty();
    }

    public setColumnAggFunc(
        key: Maybe<ColKey>,
        aggFunc: string | IAggFunc | null | undefined,
        source: ColumnEventType
    ): void {
        this.valueColsService.setColumnAggFunc(key, aggFunc, source);
    }

    public setRowGroupColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.rowGroupColsService.setColumns(colKeys, source);
    }

    public addRowGroupColumns(keys: Maybe<ColKey>[], source: ColumnEventType): void {
        this.rowGroupColsService.addColumns(keys, source);
    }

    public removeRowGroupColumns(keys: Maybe<ColKey>[] | null, source: ColumnEventType): void {
        this.rowGroupColsService.removeColumns(keys, source);
    }

    public addPivotColumns(keys: ColKey[], source: ColumnEventType): void {
        this.pivotColsService.addColumns(keys, source);
    }

    public setPivotColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.pivotColsService.setColumns(colKeys, source);
    }

    public removePivotColumns(keys: ColKey[], source: ColumnEventType): void {
        this.pivotColsService.removeColumns(keys, source);
    }

    public setValueColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.valueColsService.setColumns(colKeys, source);
    }

    public addValueColumns(keys: ColKey[], source: ColumnEventType): void {
        this.valueColsService.addColumns(keys, source);
    }

    public removeValueColumns(keys: ColKey[], source: ColumnEventType): void {
        this.valueColsService.removeColumns(keys, source);
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        this.rowGroupColsService.moveColumn(fromIndex, toIndex, source);
    }

    public extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void {
        this.rowGroupColsService.extractCols(source, oldProvidedCols);
        this.pivotColsService.extractCols(source, oldProvidedCols);
        this.valueColsService.extractCols(source, oldProvidedCols);
    }

    public generateColumnStateForRowGroupAndPivotIndexes(
        updatedRowGroupColumnState: { [colId: string]: ColumnState },
        updatedPivotColumnState: { [colId: string]: ColumnState }
    ): ColumnState[] {
        // Generally columns should appear in the order they were before. For any new columns, these should appear in the original col def order.
        // The exception is for columns that were added via `addGroupColumns`. These should appear at the end.
        // We don't have to worry about full updates, as in this case the arrays are correct, and they won't appear in the updated lists.

        const existingColumnStateUpdates: { [colId: string]: ColumnState } = {};

        const orderColumns = (
            updatedColumnState: { [colId: string]: ColumnState },
            colList: AgColumn[],
            enableProp: 'rowGroup' | 'pivot',
            initialEnableProp: 'initialRowGroup' | 'initialPivot',
            indexProp: 'rowGroupIndex' | 'pivotIndex',
            initialIndexProp: 'initialRowGroupIndex' | 'initialPivotIndex'
        ) => {
            const primaryCols = this.columnModel.getColDefCols();
            if (!colList.length || !primaryCols) {
                return [];
            }
            const updatedColIdArray = Object.keys(updatedColumnState);
            const updatedColIds = new Set(updatedColIdArray);
            const newColIds = new Set(updatedColIdArray);
            const allColIds = new Set(
                colList
                    .map((column) => {
                        const colId = column.getColId();
                        newColIds.delete(colId);
                        return colId;
                    })
                    .concat(updatedColIdArray)
            );

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
            };

            colList.forEach((column) => {
                const colId = column.getColId();
                if (updatedColIds.has(colId)) {
                    // New col already exists. Add any other new cols that should be before it.
                    processPrecedingNewCols(colId);
                    updatedColumnState[colId][indexProp] = index++;
                } else {
                    const colDef = column.getColDef();
                    const missingIndex =
                        colDef[indexProp] === null ||
                        (colDef[indexProp] === undefined && colDef[initialIndexProp] == null);
                    if (missingIndex) {
                        if (!hasAddedNewCols) {
                            const propEnabled =
                                colDef[enableProp] || (colDef[enableProp] === undefined && colDef[initialEnableProp]);
                            if (propEnabled) {
                                processPrecedingNewCols(colId);
                            } else {
                                // Reached the first manually added column. Add all the new columns now.
                                newColIds.forEach((newColId) => {
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
        };

        orderColumns(
            updatedRowGroupColumnState,
            this.rowGroupCols,
            'rowGroup',
            'initialRowGroup',
            'rowGroupIndex',
            'initialRowGroupIndex'
        );
        orderColumns(
            updatedPivotColumnState,
            this.pivotCols,
            'pivot',
            'initialPivot',
            'pivotIndex',
            'initialPivotIndex'
        );

        return Object.values(existingColumnStateUpdates);
    }
}
