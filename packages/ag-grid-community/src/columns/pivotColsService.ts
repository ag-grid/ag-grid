import type { AgColumn, ColDef } from 'ag-grid-community';

import type { NamedBean } from '../context/bean';
import type { ColumnEventType } from '../events';
import { _removeFromArray } from '../utils/array';
import { BaseColsService } from './baseColsService';
import type { ColumnOrderState, ColumnServiceEventName } from './baseColsService';
import type { ColKey } from './columnModel';
import type { ModifyColumnsNoEventsCallback } from './columnStateService';

export class PivotColsService extends BaseColsService implements NamedBean {
    beanName = 'pivotColsService' as const;

    public override getModifyColumnsNoEventsCallbacks(): ModifyColumnsNoEventsCallback {
        return {
            addCol: (column) => this.columns.push(column),
            removeCol: (column) => _removeFromArray(this.columns, column),
        };
    }

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
}
