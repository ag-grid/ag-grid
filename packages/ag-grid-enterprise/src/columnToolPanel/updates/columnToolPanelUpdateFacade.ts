import type {
    AgColumn,
    ColumnEventType,
    ColumnState,
    ColumnToolPanelUpdatesBean,
    IAggFunc,
    SortDef,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { createSyncColumnToolPanelConcreteUpdateStrategy } from './columnToolPanelUpdates';
import type {
    ColumnToolPanelConcreteUpdateStrategy,
    IColumnToolPanelUpdateStrategy,
} from './columnToolPanelUpdatesTypes';

export class ColumnToolPanelUpdates extends BeanStub implements IColumnToolPanelUpdateStrategy {
    public beanName = 'colToolPanelUpdates' as ColumnToolPanelUpdatesBean;
    private fallbackUpdates?: ColumnToolPanelConcreteUpdateStrategy;

    public applyColumnState(deferMode: boolean, state: ColumnState[], eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.applyColumnState(deferMode, state, eventType), (fallback) =>
            fallback.applyColumnState(state, eventType)
        );
    }

    public commit(deferMode: boolean): void {
        this.execute(
            (strategy) => strategy.commit(deferMode),
            (fallback) => fallback.commit()
        );
    }

    public moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.moveColumns(deferMode, columns, targetIndex, eventType), (fallback) =>
            fallback.moveColumns(columns, targetIndex, eventType)
        );
    }

    public reset(deferMode: boolean): void {
        this.execute(
            (strategy) => strategy.reset(deferMode),
            (fallback) => fallback.reset()
        );
    }

    public setColumnsVisible(
        deferMode: boolean,
        columns: AgColumn[],
        visible: boolean,
        eventType: ColumnEventType
    ): void {
        this.execute((strategy) => strategy.setColumnsVisible(deferMode, columns, visible, eventType), (fallback) =>
            fallback.setColumnsVisible(columns, visible, eventType)
        );
    }

    public isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.execute(
            (strategy) => strategy.isColumnVisibleInToolPanel(deferMode, column),
            (fallback) => fallback.isColumnVisibleInToolPanel(column)
        );
    }

    public setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.setRowGroupColumns(deferMode, columns, eventType), (fallback) =>
            fallback.setRowGroupColumns(columns, eventType)
        );
    }

    public getRowGroupColumns(deferMode: boolean): AgColumn[] {
        return this.execute(
            (strategy) => strategy.getRowGroupColumns(deferMode),
            (fallback) => fallback.getRowGroupColumns()
        );
    }

    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.setValueColumns(deferMode, columns, eventType), (fallback) =>
            fallback.setValueColumns(columns, eventType)
        );
    }

    public getValueColumns(deferMode: boolean): AgColumn[] {
        return this.execute(
            (strategy) => strategy.getValueColumns(deferMode),
            (fallback) => fallback.getValueColumns()
        );
    }

    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.execute((strategy) => strategy.setColumnAggFunc(deferMode, column, aggFunc, eventType), (fallback) =>
            fallback.setColumnAggFunc(column, aggFunc, eventType)
        );
    }

    public getColumnAggFunc(deferMode: boolean, column: AgColumn): string | IAggFunc | null | undefined {
        return this.execute(
            (strategy) => strategy.getColumnAggFunc(deferMode, column),
            (fallback) => fallback.getColumnAggFunc(column)
        );
    }

    public setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.setPivotColumns(deferMode, columns, eventType), (fallback) =>
            fallback.setPivotColumns(columns, eventType)
        );
    }

    public getPivotColumns(deferMode: boolean): AgColumn[] {
        return this.execute(
            (strategy) => strategy.getPivotColumns(deferMode),
            (fallback) => fallback.getPivotColumns()
        );
    }

    public setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void {
        this.execute((strategy) => strategy.setPivotMode(deferMode, pivotMode, eventType), (fallback) =>
            fallback.setPivotMode(pivotMode, eventType)
        );
    }

    public getPivotMode(deferMode: boolean): boolean {
        return this.execute(
            (strategy) => strategy.getPivotMode(deferMode),
            (fallback) => fallback.getPivotMode()
        );
    }

    public isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.execute(
            (strategy) => strategy.isColumnSelectedInPivotModeToolPanel(deferMode, column),
            (fallback) => fallback.isColumnSelectedInPivotModeToolPanel(column)
        );
    }

    public progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.execute((strategy) => strategy.progressSortFromEvent(deferMode, column, event), (fallback) =>
            fallback.progressSortFromEvent(column, event)
        );
    }

    public getSortDef(deferMode: boolean, column: AgColumn): SortDef | null {
        return this.execute(
            (strategy) => strategy.getSortDef(deferMode, column),
            (fallback) => fallback.getSortDef(column)
        );
    }

    private getUpdateStrategy(): IColumnToolPanelUpdateStrategy | undefined {
        return this.beans.colToolPanelUpdateStrategy as IColumnToolPanelUpdateStrategy | undefined;
    }

    private getFallbackUpdates(): ColumnToolPanelConcreteUpdateStrategy {
        return (this.fallbackUpdates ??= createSyncColumnToolPanelConcreteUpdateStrategy(this.beans));
    }

    private execute<T>(
        withStrategy: (strategy: IColumnToolPanelUpdateStrategy) => T,
        withFallback: (fallback: ColumnToolPanelConcreteUpdateStrategy) => T
    ): T {
        const strategy = this.getUpdateStrategy();
        return strategy ? withStrategy(strategy) : withFallback(this.getFallbackUpdates());
    }
}
