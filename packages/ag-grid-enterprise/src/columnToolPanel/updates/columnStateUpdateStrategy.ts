import type {
    AgColumn,
    ColAggFunc,
    ColumnEventType,
    ColumnState,
    IColumnStateUpdateStrategy,
    SortDef,
    SortDirection,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { ColumnStateUpdateExecutionStrategy } from './columnStateUpdateExecutionStrategy';

export class ColumnStateUpdateStrategy extends BeanStub implements IColumnStateUpdateStrategy {
    public beanName = 'columnStateUpdateStrategy' as const;
    private executionStrategy?: ColumnStateUpdateExecutionStrategy;

    public applyColumnState(deferMode: boolean, state: ColumnState[], eventType: ColumnEventType): void {
        this.delegate('applyColumnState', deferMode, state, eventType);
    }

    public commit(deferMode: boolean): void {
        this.delegate('commit', deferMode);
    }

    public hasPendingChanges(deferMode: boolean): boolean {
        return this.delegate('hasPendingChanges', deferMode);
    }

    public moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.delegate('moveColumns', deferMode, columns, targetIndex, eventType);
    }

    public reset(deferMode: boolean): void {
        this.delegate('reset', deferMode);
    }

    public setColumnsVisible(
        deferMode: boolean,
        columns: AgColumn[],
        visible: boolean,
        eventType: ColumnEventType
    ): void {
        this.delegate('setColumnsVisible', deferMode, columns, visible, eventType);
    }

    public isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.delegate('isColumnVisibleInToolPanel', deferMode, column);
    }

    public setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.delegate('setRowGroupColumns', deferMode, columns, eventType);
    }

    public getRowGroupColumns(deferMode: boolean): AgColumn[] {
        return this.delegate('getRowGroupColumns', deferMode);
    }

    public getPrimaryColumns(deferMode: boolean): AgColumn[] {
        return this.delegate('getPrimaryColumns', deferMode);
    }

    public hasDeferredColumnOrder(deferMode: boolean): boolean {
        return this.delegate('hasDeferredColumnOrder', deferMode);
    }

    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.delegate('setValueColumns', deferMode, columns, eventType);
    }

    public getValueColumns(deferMode: boolean): AgColumn[] {
        return this.delegate('getValueColumns', deferMode);
    }

    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: ColAggFunc,
        eventType: ColumnEventType
    ): void {
        this.delegate('setColumnAggFunc', deferMode, column, aggFunc, eventType);
    }

    public getColumnAggFunc(deferMode: boolean, column: AgColumn): ColAggFunc {
        return this.delegate('getColumnAggFunc', deferMode, column);
    }

    public setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.delegate('setPivotColumns', deferMode, columns, eventType);
    }

    public getPivotColumns(deferMode: boolean): AgColumn[] {
        return this.delegate('getPivotColumns', deferMode);
    }

    public setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void {
        this.delegate('setPivotMode', deferMode, pivotMode, eventType);
    }

    public getPivotMode(deferMode: boolean): boolean {
        return this.delegate('getPivotMode', deferMode);
    }

    public isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.delegate('isColumnSelectedInPivotModeToolPanel', deferMode, column);
    }

    public progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.delegate('progressSortFromEvent', deferMode, column, event);
    }

    public getSortDef(deferMode: boolean, column: AgColumn): SortDef | null {
        return this.delegate('getSortDef', deferMode, column);
    }

    public progressPivotSortFromEvent(deferMode: boolean, column: AgColumn): void {
        this.delegate('progressPivotSortFromEvent', deferMode, column);
    }

    public getPivotSort(deferMode: boolean, column: AgColumn): SortDirection | undefined {
        return this.delegate('getPivotSort', deferMode, column);
    }

    private getUpdateStrategy(): IColumnStateUpdateStrategy {
        return (this.executionStrategy ??= this.createManagedBean(new ColumnStateUpdateExecutionStrategy()));
    }

    private delegate<M extends keyof IColumnStateUpdateStrategy>(
        method: M,
        ...args: Parameters<IColumnStateUpdateStrategy[M]>
    ): ReturnType<IColumnStateUpdateStrategy[M]> {
        const strategy = this.getUpdateStrategy();
        const fn = strategy[method].bind(strategy) as any as (
            ...args: Parameters<IColumnStateUpdateStrategy[M]>
        ) => ReturnType<IColumnStateUpdateStrategy[M]>;
        return fn(...args);
    }
}
