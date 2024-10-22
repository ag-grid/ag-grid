import type {
    AgColumn,
    AllEventsWithoutGridCommon,
    ColDef,
    ColKey,
    ColumnEventType,
    ColumnState,
    ColumnStateParams,
    IColsService,
    NamedBean,
} from 'ag-grid-community';
import { BaseColsService, _removeFromArray, _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community';

export class RowGroupColsService extends BaseColsService implements NamedBean, IColsService {
    beanName = 'rowGroupColsService' as const;

    private modifyColumnsNoEventsCallbacks = {
        addCol: (column: AgColumn) => this.columns.push(column),
        removeCol: (column: AgColumn) => _removeFromArray(this.columns, column),
    };

    protected override getEventName(): 'columnRowGroupChanged' {
        return 'columnRowGroupChanged';
    }

    public setColumns(colKeys: ColKey[], source: ColumnEventType): void {
        const processColumn = (added: boolean, column: AgColumn) => this.setRowGroupActive(added, column, source);
        this.setColList(colKeys, this.columns, this.getEventName(), true, true, processColumn, source);
    }

    public override addColumns(colKeys: (ColKey | null | undefined)[], source: ColumnEventType): void {
        const processColumn = (column: AgColumn) => this.setRowGroupActive(true, column, source);
        this.updateColList(colKeys, this.columns, true, true, processColumn, this.getEventName(), source);
    }

    public override removeColumns(colKeys: (ColKey | null | undefined)[] | null, source: ColumnEventType): void {
        const processColumn = (column: AgColumn) => this.setRowGroupActive(false, column, source);
        this.updateColList(colKeys, this.columns, false, true, processColumn, this.getEventName(), source);
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

    public override isRowGroupEmpty(): boolean {
        return this.columns.length === 0;
    }

    public override moveColumn(fromIndex: number, toIndex: number, source: ColumnEventType): void {
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

    public override orderColumns(
        columnStateAccumulator: { [colId: string]: ColumnState },
        incomingColumnState: { [colId: string]: ColumnState }
    ): { [colId: string]: ColumnState } {
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
        getValue: <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(
            key1: U,
            key2?: S
        ) => { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined },
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
