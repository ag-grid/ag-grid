import type { AgColumn, ColDef, ColumnStateParams } from 'ag-grid-community';

import type { NamedBean } from '../context/bean';
import type { ColumnEventType } from '../events';
import { _removeFromArray } from '../utils/array';
import { BaseColsService } from './baseColsService';
import type { ColumnOrderState, ColumnServiceEventName } from './baseColsService';
import type { ColKey } from './columnModel';
import type { GetValueFn, ModifyColumnsNoEventsCallback } from './columnStateService';

export class PivotColsService extends BaseColsService implements NamedBean {
    beanName = 'pivotColsService' as const;

    private modifyColumnsNoEventsCallbacks: ModifyColumnsNoEventsCallback = {
        addCol: (column) => this.columns.push(column),
        removeCol: (column) => _removeFromArray(this.columns, column),
    };

    protected override getEventName(): ColumnServiceEventName {
        return 'columnPivotChanged';
    }

    public override setColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._setColumns(colKeys, source, (added, column) => column.setPivotActive(true, source));
    }

    public override addColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._addColumns(colKeys, source, (column) => column.setPivotActive(true, source));
    }

    public override removeColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._removeColumns(colKeys, source, (column) => column.setPivotActive(false, source));
    }

    public override orderColumns(
        columnStateAccumulator: ColumnOrderState,
        incomingColumnState: ColumnOrderState
    ): ColumnOrderState {
        return this._orderColumns(
            columnStateAccumulator,
            incomingColumnState,
            this.columns,
            'pivot',
            'initialPivot',
            'pivotIndex',
            'initialPivotIndex'
        );
    }

    public override extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void {
        this.columns = this._extractColsCommon(
            oldProvidedCols,
            this.columns,
            (col, flag) => col.setPivotActive(flag, source),
            (colDef: ColDef) => colDef.pivotIndex,
            (colDef: ColDef) => colDef.initialPivotIndex,
            (colDef: ColDef) => colDef.pivot,
            (colDef: ColDef) => colDef.initialPivot
        );
    }

    public syncColumnWithState(
        column: AgColumn,
        source: ColumnEventType,
        getValue: GetValueFn<keyof ColumnStateParams, keyof ColumnStateParams>,
        rowIndex: { [key: string]: number } | null
    ): void {
        const { value1: pivot, value2: pivotIndex } = getValue('pivot', 'pivotIndex');
        if (pivot !== undefined || pivotIndex !== undefined) {
            if (typeof pivotIndex === 'number' || pivot) {
                if (!column.isPivotActive()) {
                    column.setPivotActive(true, source);
                    this.modifyColumnsNoEventsCallbacks.addCol(column);
                }
                if (rowIndex && typeof pivotIndex === 'number') {
                    rowIndex[column.getId()] = pivotIndex;
                }
            } else {
                if (column.isPivotActive()) {
                    column.setPivotActive(false, source);
                    this.modifyColumnsNoEventsCallbacks.removeCol(column);
                }
            }
        }
    }
}
