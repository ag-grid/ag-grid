import type { AgColumn, ColDef, ColumnEventType, ColumnStateParams, IColsService, NamedBean } from 'ag-grid-community';
import { BaseColsService, _removeFromArray } from 'ag-grid-community';

export class PivotColsService extends BaseColsService implements NamedBean, IColsService {
    beanName = 'pivotColsService' as const;

    private modifyColumnsNoEventsCallbacks = {
        addCol: (column: AgColumn) => this.columns.push(column),
        removeCol: (column: AgColumn) => _removeFromArray(this.columns, column),
    };

    public postConstruct(): void {
        this.columnProcessors = {
            set: (column: AgColumn, added: boolean, source: ColumnEventType) => column.setPivotActive(true, source),
            add: (column: AgColumn, added: boolean, source: ColumnEventType) => column.setPivotActive(true, source),
            remove: (column: AgColumn, added: boolean, source: ColumnEventType) => column.setPivotActive(false, source),
        };

        this.columnOrdering = {
            enableProp: 'pivot',
            initialEnableProp: 'initialPivot',
            indexProp: 'pivotIndex',
            initialIndexProp: 'initialPivotIndex',
        };
    }

    protected override getEventName(): 'columnPivotChanged' {
        return 'columnPivotChanged';
    }

    public override extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void {
        this.columns = this.extractColumnsCommon(
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
