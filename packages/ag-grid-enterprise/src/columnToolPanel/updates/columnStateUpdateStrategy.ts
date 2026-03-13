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
    createSyncColumnStateUpdateExecutionStrategy,
} from './columnStateUpdateExecutionStrategy';
import type { ColumnStateConcreteUpdateStrategy } from './columnStateUpdateTypes';

export class ColumnStateUpdateStrategy extends BeanStub implements IColumnStateUpdateStrategy {
    public beanName = 'columnStateUpdateStrategy' as const;
    private executionStrategy?: ColumnStateUpdateExecutionStrategy;
    private fallbackUpdates?: ColumnStateConcreteUpdateStrategy;

    public applyColumnState(deferMode: boolean, state: ColumnState[], eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.applyColumnState(deferMode, state, eventType);
            return;
        }
        fallback.applyColumnState(state, eventType);
    }

    public commit(deferMode: boolean): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.commit(deferMode);
            return;
        }
        fallback.commit();
    }

    public moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.moveColumns(deferMode, columns, targetIndex, eventType);
            return;
        }
        fallback.moveColumns(columns, targetIndex, eventType);
    }

    public reset(deferMode: boolean): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.reset(deferMode);
            return;
        }
        fallback.reset();
    }

    public setColumnsVisible(
        deferMode: boolean,
        columns: AgColumn[],
        visible: boolean,
        eventType: ColumnEventType
    ): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setColumnsVisible(deferMode, columns, visible, eventType);
            return;
        }
        fallback.setColumnsVisible(columns, visible, eventType);
    }

    public isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy
            ? strategy.isColumnVisibleInToolPanel(deferMode, column)
            : fallback.isColumnVisibleInToolPanel(column);
    }

    public setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setRowGroupColumns(deferMode, columns, eventType);
            return;
        }
        fallback.setRowGroupColumns(columns, eventType);
    }

    public getRowGroupColumns(deferMode: boolean): AgColumn[] {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getRowGroupColumns(deferMode) : fallback.getRowGroupColumns();
    }

    public getPrimaryColumns(deferMode: boolean): AgColumn[] {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getPrimaryColumns(deferMode) : fallback.getPrimaryColumns();
    }

    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setValueColumns(deferMode, columns, eventType);
            return;
        }
        fallback.setValueColumns(columns, eventType);
    }

    public getValueColumns(deferMode: boolean): AgColumn[] {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getValueColumns(deferMode) : fallback.getValueColumns();
    }

    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setColumnAggFunc(deferMode, column, aggFunc, eventType);
            return;
        }
        fallback.setColumnAggFunc(column, aggFunc, eventType);
    }

    public getColumnAggFunc(deferMode: boolean, column: AgColumn): string | IAggFunc | null | undefined {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getColumnAggFunc(deferMode, column) : fallback.getColumnAggFunc(column);
    }

    public setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setPivotColumns(deferMode, columns, eventType);
            return;
        }
        fallback.setPivotColumns(columns, eventType);
    }

    public getPivotColumns(deferMode: boolean): AgColumn[] {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getPivotColumns(deferMode) : fallback.getPivotColumns();
    }

    public setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.setPivotMode(deferMode, pivotMode, eventType);
            return;
        }
        fallback.setPivotMode(pivotMode, eventType);
    }

    public getPivotMode(deferMode: boolean): boolean {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getPivotMode(deferMode) : fallback.getPivotMode();
    }

    public isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy
            ? strategy.isColumnSelectedInPivotModeToolPanel(deferMode, column)
            : fallback.isColumnSelectedInPivotModeToolPanel(column);
    }

    public progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const { strategy, fallback } = this.resolveUpdates();
        if (strategy) {
            strategy.progressSortFromEvent(deferMode, column, event);
            return;
        }
        fallback.progressSortFromEvent(column, event);
    }

    public getSortDef(deferMode: boolean, column: AgColumn): SortDef | null {
        const { strategy, fallback } = this.resolveUpdates();
        return strategy ? strategy.getSortDef(deferMode, column) : fallback.getSortDef(column);
    }

    private getUpdateStrategy(): IColumnStateUpdateStrategy | undefined {
        return (this.executionStrategy ??= this.createManagedBean(new ColumnStateUpdateExecutionStrategy()));
    }

    private getFallbackUpdates(): ColumnStateConcreteUpdateStrategy {
        return (this.fallbackUpdates ??= createSyncColumnStateUpdateExecutionStrategy(this.beans));
    }

    private resolveUpdates(): {
        strategy: IColumnStateUpdateStrategy | undefined;
        fallback: ColumnStateConcreteUpdateStrategy;
    } {
        return {
            strategy: this.getUpdateStrategy(),
            fallback: this.getFallbackUpdates(),
        };
    }
}
