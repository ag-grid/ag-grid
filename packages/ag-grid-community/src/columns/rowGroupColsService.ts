import { _missingOrEmpty } from 'ag-grid-community';

import type { NamedBean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { AllEventsWithoutGridCommon, ColumnEventType } from '../events';
import { _shouldUpdateColVisibilityAfterGroup } from '../gridOptionsUtils';
import { _removeFromArray } from '../utils/array';
import type { ColumnServiceEventName } from './baseColsService';
import { BaseColsService } from './baseColsService';
import type { ColKey, Maybe } from './columnModel';
import type { ModifyRowGroupColumnsNoEventsCallbacks } from './columnStateService';

export class RowGroupColsService extends BaseColsService<ModifyRowGroupColumnsNoEventsCallbacks> implements NamedBean {
    beanName = 'rowGroupColsService' as const;

    public override getModifyColumnsNoEventsCallbacks(): ModifyRowGroupColumnsNoEventsCallbacks {
        return {
            addGroupCol: (column) => this.columns.push(column),
            removeGroupCol: (column) => _removeFromArray(this.columns, column),
        };
    }

    protected override getEventName(): ColumnServiceEventName {
        return 'columnRowGroupChanged';
    }

    public override setColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._setColumns(colKeys, source, (added, column) => this.setRowGroupActive(added, column, source));
    }

    public override addColumns(colKeys: Maybe<ColKey>[], source: ColumnEventType): void {
        this._addColumns(colKeys, source, (column) => this.setRowGroupActive(true, column, source));
    }

    public override removeColumns(colKeys: Maybe<ColKey>[] | null, source: ColumnEventType): void {
        this._removeColumns(colKeys, source, (column) => this.setRowGroupActive(false, column, source));
    }

    public override extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void {
        this.columns = this._extractColsCommon(
            oldProvidedCols,
            this.columns,
            (col, flag) => col.setRowGroupActive(flag, source),
            (colDef: ColDef) => colDef.rowGroupIndex,
            (colDef: ColDef) => colDef.initialRowGroupIndex,
            (colDef: ColDef) => colDef.rowGroup,
            (colDef: ColDef) => colDef.initialRowGroup
        );
    }

    public isRowGroupEmpty(): boolean {
        return _missingOrEmpty(this.columns);
    }

    public moveColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void {
        if (this.isRowGroupEmpty()) {
            return;
        }

        const column = this.columns[fromIndex];

        const impactedColumns = this.columns.slice(fromIndex, toIndex);
        this.columns.splice(fromIndex, 1);
        this.columns.splice(toIndex, 0, column);

        this.eventService.dispatchEvent({
            type: this.getEventName(),
            columns: impactedColumns,
            column: impactedColumns.length === 1 ? impactedColumns[0] : null,
            source,
        } as AllEventsWithoutGridCommon);
    }

    public getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null {
        const sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }

        if (sourceColumnId === true) {
            return this.columns.slice(0);
        }

        const column = this.columnModel.getColDefCol(sourceColumnId);
        return column ? [column] : null;
    }

    private setRowGroupActive(active: boolean, column: AgColumn, source: ColumnEventType): void {
        if (active === column.isRowGroupActive()) {
            return;
        }

        column.setRowGroupActive(active, source);

        if (_shouldUpdateColVisibilityAfterGroup(this.gos, active)) {
            this.columnModel.setColsVisible([column], !active, source);
        }
    }
}
