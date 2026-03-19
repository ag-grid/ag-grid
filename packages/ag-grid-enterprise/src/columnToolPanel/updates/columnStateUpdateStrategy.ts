import type {
    AgColumn,
    ColumnEventType,
    ColumnState,
    IAggFunc,
    IColumnStateUpdateStrategy,
    SortDef,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import {
    ColumnStateUpdateExecutionStrategy,
    SynchronousColumnStateUpdateStrategy,
} from './columnStateUpdateExecutionStrategy';
import type { ColumnStateConcreteUpdateStrategy } from './columnStateUpdateTypes';

export class ColumnStateUpdateStrategy extends BeanStub implements IColumnStateUpdateStrategy {
    public beanName = 'columnStateUpdateStrategy' as const;
    private executionStrategy?: ColumnStateUpdateExecutionStrategy;
    private fallbackUpdates?: ColumnStateConcreteUpdateStrategy;

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

    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.delegate('setValueColumns', deferMode, columns, eventType);
    }

    public getValueColumns(deferMode: boolean): AgColumn[] {
        return this.delegate('getValueColumns', deferMode);
    }

    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.delegate('setColumnAggFunc', deferMode, column, aggFunc, eventType);
    }

    public getColumnAggFunc(deferMode: boolean, column: AgColumn): string | IAggFunc | null | undefined {
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

    private getUpdateStrategy(): IColumnStateUpdateStrategy | undefined {
        return (this.executionStrategy ??= this.createManagedBean(new ColumnStateUpdateExecutionStrategy()));
    }

    private getFallbackUpdates(): ColumnStateConcreteUpdateStrategy {
        return (this.fallbackUpdates ??= new SynchronousColumnStateUpdateStrategy(this.beans));
    }

    private delegate<M extends keyof IColumnStateUpdateStrategy>(
        method: M,
        deferMode: boolean,
        ...args: Parameters<IColumnStateUpdateStrategy[M]> extends [any, ...infer Rest] ? Rest : []
    ): ReturnType<IColumnStateUpdateStrategy[M]> {
        const strategy = this.getUpdateStrategy();
        if (strategy) {
            return (strategy as any)[method](deferMode, ...args);
        }
        return (this.getFallbackUpdates() as any)[method](...args);
    }
}
