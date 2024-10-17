import type {
    AgColumn,
    ColDef,
    ColKey,
    ColumnEventType,
    ColumnState,
    ColumnStateParams,
    IColsService,
    NamedBean,
} from 'ag-grid-community';
import { BaseColsService, _removeFromArray } from 'ag-grid-community';

export class PivotColsService extends BaseColsService implements NamedBean, IColsService {
    beanName = 'pivotColsService' as const;

    private modifyColumnsNoEventsCallbacks = {
        addCol: (column: AgColumn) => this.columns.push(column),
        removeCol: (column: AgColumn) => _removeFromArray(this.columns, column),
    };

    protected override getEventName(): 'columnPivotChanged' {
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
        columnStateAccumulator: { [colId: string]: ColumnState },
        incomingColumnState: { [colId: string]: ColumnState }
    ): { [colId: string]: ColumnState } {
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
        getValue: <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(
            key1: U,
            key2?: S
        ) => { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined },
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
