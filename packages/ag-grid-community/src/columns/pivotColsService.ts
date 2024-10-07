import type { AgColumn, ColDef } from 'ag-grid-community';

import type { NamedBean } from '../context/bean';
import type { ColumnEventType } from '../events';
import { _removeFromArray } from '../utils/array';
import { BaseColsService } from './baseColsService';
import type { ColumnServiceEventName } from './baseColsService';
import type { ColKey } from './columnModel';
import type { ModifyPivotColumnsNoEventsCallbacks } from './columnStateService';

export class PivotColsService extends BaseColsService<ModifyPivotColumnsNoEventsCallbacks> implements NamedBean {
    beanName = 'pivotColsService' as const;

    public override getModifyColumnsNoEventsCallbacks(): ModifyPivotColumnsNoEventsCallbacks {
        return {
            addPivotCol: (column) => this.columns.push(column),
            removePivotCol: (column) => _removeFromArray(this.columns, column),
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
