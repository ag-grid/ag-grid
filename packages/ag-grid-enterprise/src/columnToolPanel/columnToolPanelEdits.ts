import type {
    AgColumn,
    IAggFunc,
    BeanName,
    ColumnEventType,
    ColumnState,
    IColumnToolPanelEdits,
    NamedBean,
    SortDef,
    SortDirection,
} from 'ag-grid-community';
import { BeanStub, _applyColumnState } from 'ag-grid-community';
import type { ColumnToolPanelEditStrategyBean } from 'ag-grid-community';

export type ColumnToolPanelEditParams = { deferApply?: boolean };

const noop = () => {};

export abstract class BaseColumnToolPanelEdits extends BeanStub implements IColumnToolPanelEdits, NamedBean {
    abstract beanName: BeanName;
    abstract applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    abstract moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    abstract setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    abstract setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void;
    abstract getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined;
    abstract setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    abstract progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    abstract commit(): void;
    abstract reset(): void;
}

export class ColumnToolPanelSynchronousEdit extends BaseColumnToolPanelEdits {
    static beanName = 'colToolPanelSynchronousEdit';
    beanName = ColumnToolPanelSynchronousEdit.beanName as ColumnToolPanelEditStrategyBean;

    public reset = noop;
    public commit = noop;

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        if (state.length === 0) {
            return;
        }

        _applyColumnState(this.beans, { state }, eventType);
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.beans.colMoves?.moveColumns(columns, targetIndex, eventType);
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        const allowedCols = columns.filter((column) => !column.getColDef().lockVisible);
        this.beans.colModel.setColsVisible(allowedCols, visible, eventType);
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.rowGroupColsSvc?.setColumns(columns, eventType);
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.valueColsSvc?.setColumns(columns, eventType);
    }

    public setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.beans.valueColsSvc?.setColumnAggFunc?.(column, aggFunc, eventType);
    }

    public getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined {
        return column.getAggFunc();
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.pivotColsSvc?.setColumns(columns, eventType);
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        const { colModel, gos, ctrlsSvc } = this.beans;
        if (pivotMode === colModel.isPivotMode()) {
            return;
        }

        gos.updateGridOptions({ options: { pivotMode }, source: eventType as any });
        for (const c of ctrlsSvc.getHeaderRowContainerCtrls()) {
            c.refresh();
        }
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.beans.sortSvc?.progressSortFromEvent(column, event);
    }
}

export class ColumnToolPanelDeferredEdit extends BaseColumnToolPanelEdits {
    static beanName = 'colToolPanelDeferredEdit';
    beanName = ColumnToolPanelDeferredEdit.beanName as ColumnToolPanelEditStrategyBean;

    private state = this.getDefaultState();

    private static getLastValue<T>(values: T[]): T | undefined {
        return values[values.length - 1];
    }

    private getDefaultState() {
        return {
            applyColumnState: [] as [ColumnState[], ColumnEventType][],
            moveColumns: [] as [AgColumn[], number, ColumnEventType][],
            setRowGroupColumns: [] as [AgColumn[], ColumnEventType][],
            setColumnsVisible: [] as [AgColumn[], boolean, ColumnEventType][],
            setValueColumns: [] as [AgColumn[], ColumnEventType][],
            setColumnAggFunc: [] as [AgColumn, string | IAggFunc | null | undefined, ColumnEventType][],
            setPivotColumns: [] as [AgColumn[], ColumnEventType][],
            setPivotMode: [] as [boolean, ColumnEventType][],
            progressSortFromEvent: [] as [AgColumn, MouseEvent | KeyboardEvent][],
            draftAggFuncsByColId: new Map<string, string | IAggFunc | null | undefined>(),
        };
    }

    public reset() {
        this.state = this.getDefaultState();
    }

    public commit() {
        console.log(this.state);
    }

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        this.state.applyColumnState.push([state, eventType]);
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.state.moveColumns.push([columns, targetIndex, eventType]);
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        this.state.setColumnsVisible.push([columns, visible, eventType]);
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setRowGroupColumns.push([columns, eventType]);
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setValueColumns.push([columns, eventType]);
    }

    public setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.state.setColumnAggFunc.push([column, aggFunc, eventType]);
        this.state.draftAggFuncsByColId.set(column.getColId(), aggFunc);
    }

    public getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined {
        const colId = column.getColId();
        if (this.state.draftAggFuncsByColId.has(colId)) {
            return this.state.draftAggFuncsByColId.get(colId);
        }
        return column.getAggFunc();
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setPivotColumns.push([columns, eventType]);
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        this.state.setPivotMode.push([pivotMode, eventType]);
    }

    public getDraftRowGroupColumns(): AgColumn[] {
        const latest = ColumnToolPanelDeferredEdit.getLastValue(this.state.setRowGroupColumns);
        return latest ? latest[0] : this.beans.rowGroupColsSvc?.columns ?? [];
    }

    public getDraftValueColumns(): AgColumn[] {
        const latest = ColumnToolPanelDeferredEdit.getLastValue(this.state.setValueColumns);
        return latest ? latest[0] : this.beans.valueColsSvc?.columns ?? [];
    }

    public getDraftPivotColumns(): AgColumn[] {
        const latest = ColumnToolPanelDeferredEdit.getLastValue(this.state.setPivotColumns);
        return latest ? latest[0] : this.beans.pivotColsSvc?.columns ?? [];
    }

    public getDraftPivotMode(): boolean {
        const latest = ColumnToolPanelDeferredEdit.getLastValue(this.state.setPivotMode);
        return latest ? latest[0] : this.beans.colModel.isPivotMode();
    }

    public getDraftSortDirection(column: AgColumn): SortDirection {
        const draftSortState = this.getDraftSortState();
        const draftSortDefs = draftSortState.sortDefs;
        const colId = column.getColId();
        if (draftSortDefs.has(colId)) {
            return draftSortDefs.get(colId)?.direction ?? null;
        }
        if (draftSortState.baselineCleared) {
            return null;
        }
        return column.getSort();
    }

    public getDraftSortDef(column: AgColumn): SortDef | null {
        const draftSortState = this.getDraftSortState();
        const draftSortDefs = draftSortState.sortDefs;
        const colId = column.getColId();
        if (draftSortDefs.has(colId)) {
            return draftSortDefs.get(colId)!;
        }
        if (draftSortState.baselineCleared) {
            return null;
        }
        return column.getSortDef();
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.state.progressSortFromEvent.push([column, event]);
    }

    /**
     * @returns { baselineCleared: boolean } indicates that at least one queued sort event was single-sort (not multi-sort),
     *                                       so the original live sort state for other columns should be treated as wiped.
     *
     * TODO: there is an opportunity to move deferred sort replay helpers into SortService
     *       as pure utilities so queue squashing logic is shared with core sorting behaviour.
     */
    private getDraftSortState(): { sortDefs: Map<string, SortDef>; baselineCleared: boolean } {
        const draftSortDefs = new Map<string, SortDef>();
        const { sortSvc } = this.beans;
        let baselineCleared = false;

        for (const [column, event] of this.state.progressSortFromEvent) {
            const colId = column.getColId();
            const currentSortDef = draftSortDefs.has(colId)
                ? draftSortDefs.get(colId)
                : baselineCleared
                  ? null
                  : column.getSortDef();
            const nextSortDef = sortSvc!.getNextSortDirection(column, currentSortDef);

            const sortUsingCtrl = this.gos.get('multiSortKey') === 'ctrl';
            const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
            const doingMultiSort = (multiSort || this.gos.get('alwaysMultiSort')) && !this.gos.get('suppressMultiSort');

            if (!doingMultiSort) {
                draftSortDefs.clear();
                baselineCleared = true;
            }

            if (nextSortDef.direction) {
                draftSortDefs.set(colId, nextSortDef);
            } else {
                draftSortDefs.delete(colId);
            }
        }

        return { sortDefs: draftSortDefs, baselineCleared };
    }
}
