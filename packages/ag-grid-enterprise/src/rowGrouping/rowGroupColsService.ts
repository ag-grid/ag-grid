import { _missingOrEmpty } from 'ag-grid-community';
import type { ColumnOrderState, ColumnServiceEventName } from 'ag-grid-community/src/columns/baseColsService';
import { BaseColsService } from 'ag-grid-community/src/columns/baseColsService';
import type { ColKey, Maybe } from 'ag-grid-community/src/columns/columnModel';
import type {
    ColumnStateParams,
    ModifyColumnsNoEventsCallback,
} from 'ag-grid-community/src/columns/columnStateService';
import type { GetValueFn } from 'ag-grid-community/src/columns/columnUtils';
import type { NamedBean } from 'ag-grid-community/src/context/bean';
import type { AgColumn } from 'ag-grid-community/src/entities/agColumn';
import type { ColDef } from 'ag-grid-community/src/entities/colDef';
import type { AllEventsWithoutGridCommon, ColumnEventType } from 'ag-grid-community/src/events';
import { _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community/src/gridOptionsUtils';
import { _removeFromArray } from 'ag-grid-community/src/utils/array';

export class RowGroupColsService extends BaseColsService implements NamedBean {
    beanName = 'rowGroupColsService' as const;

    private modifyColumnsNoEventsCallbacks: ModifyColumnsNoEventsCallback = {
        addCol: (column) => this.columns.push(column),
        removeCol: (column) => _removeFromArray(this.columns, column),
    };

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

    public override orderColumns(
        columnStateAccumulator: ColumnOrderState,
        incomingColumnState: ColumnOrderState
    ): ColumnOrderState {
        return this._orderColumns(
            columnStateAccumulator,
            incomingColumnState,
            this.columns,
            'rowGroup',
            'initialRowGroup',
            'rowGroupIndex',
            'initialRowGroupIndex'
        );
    }

    public syncColumnWithState(
        column: AgColumn,
        source: ColumnEventType,
        getValue: GetValueFn<keyof ColumnStateParams, keyof ColumnStateParams>,
        rowIndex: { [key: string]: number } | null
    ): void {
        const { value1: rowGroup, value2: rowGroupIndex } = getValue('rowGroup', 'rowGroupIndex');
        if (rowGroup !== undefined || rowGroupIndex !== undefined) {
            if (typeof rowGroupIndex === 'number' || rowGroup) {
                if (!column.isRowGroupActive()) {
                    column.setRowGroupActive(true, source);
                    this.modifyColumnsNoEventsCallbacks.addCol(column);
                }
                if (rowIndex && typeof rowGroupIndex === 'number') {
                    rowIndex[column.getId()] = rowGroupIndex;
                }
            } else {
                if (column.isRowGroupActive()) {
                    column.setRowGroupActive(false, source);
                    this.modifyColumnsNoEventsCallbacks.removeCol(column);
                }
            }
        }
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
