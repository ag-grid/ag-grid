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
        this.dispatch('applyColumnState', deferMode, state, eventType);
    }

    public commit(deferMode: boolean): void {
        this.dispatch('commit', deferMode);
    }

    public hasPendingChanges(deferMode: boolean): boolean {
        return this.dispatch('hasPendingChanges', deferMode);
    }

    public moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.dispatch('moveColumns', deferMode, columns, targetIndex, eventType);
    }

    public reset(deferMode: boolean): void {
        this.dispatch('reset', deferMode);
    }

    public setColumnsVisible(
        deferMode: boolean,
        columns: AgColumn[],
        visible: boolean,
        eventType: ColumnEventType
    ): void {
        this.dispatch('setColumnsVisible', deferMode, columns, visible, eventType);
    }

    public isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.dispatch('isColumnVisibleInToolPanel', deferMode, column);
    }

    public setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.dispatch('setRowGroupColumns', deferMode, columns, eventType);
    }

    public getRowGroupColumns(deferMode: boolean): AgColumn[] {
        return this.dispatch('getRowGroupColumns', deferMode);
    }

    public getPrimaryColumns(deferMode: boolean): AgColumn[] {
        return this.dispatch('getPrimaryColumns', deferMode);
    }

    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.dispatch('setValueColumns', deferMode, columns, eventType);
    }

    public getValueColumns(deferMode: boolean): AgColumn[] {
        return this.dispatch('getValueColumns', deferMode);
    }

    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.dispatch('setColumnAggFunc', deferMode, column, aggFunc, eventType);
    }

    public getColumnAggFunc(deferMode: boolean, column: AgColumn): string | IAggFunc | null | undefined {
        return this.dispatch('getColumnAggFunc', deferMode, column);
    }

    public setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.dispatch('setPivotColumns', deferMode, columns, eventType);
    }

    public getPivotColumns(deferMode: boolean): AgColumn[] {
        return this.dispatch('getPivotColumns', deferMode);
    }

    public setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void {
        this.dispatch('setPivotMode', deferMode, pivotMode, eventType);
    }

    public getPivotMode(deferMode: boolean): boolean {
        return this.dispatch('getPivotMode', deferMode);
    }

    public isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.dispatch('isColumnSelectedInPivotModeToolPanel', deferMode, column);
    }

    public progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.dispatch('progressSortFromEvent', deferMode, column, event);
    }

    public getSortDef(deferMode: boolean, column: AgColumn): SortDef | null {
        return this.dispatch('getSortDef', deferMode, column);
    }

    private getUpdateStrategy(): IColumnStateUpdateStrategy | undefined {
        return (this.executionStrategy ??= this.createManagedBean(new ColumnStateUpdateExecutionStrategy()));
    }

    private getFallbackUpdates(): ColumnStateConcreteUpdateStrategy {
        return (this.fallbackUpdates ??= new SynchronousColumnStateUpdateStrategy(this.beans));
    }

    private dispatch<M extends keyof IColumnStateUpdateStrategy>(
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
