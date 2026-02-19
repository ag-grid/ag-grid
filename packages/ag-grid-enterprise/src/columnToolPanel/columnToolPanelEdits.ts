import type {
    AgColumn,
    BeanName,
    ColumnEventType,
    ColumnState,
    IColumnToolPanelEdits,
    NamedBean,
} from 'ag-grid-community';
import { BeanStub, _applyColumnState } from 'ag-grid-community';

const noop = () => {};

export abstract class BaseColumnToolPanelEdits extends BeanStub implements IColumnToolPanelEdits, NamedBean {
    abstract beanName: BeanName;
    abstract applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    abstract moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    abstract setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    abstract setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract commit(): void;
    abstract reset(): void;
}

export class ColumnToolPanelSyncEditStrategy extends BaseColumnToolPanelEdits {
    beanName: BeanName = 'columnToolPanelSyncEditStrategy';

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

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.pivotColsSvc?.setColumns(columns, eventType);
    }
}

export class ColumnToolPanelDeferredEditStrategy extends BaseColumnToolPanelEdits {
    beanName: BeanName = 'columnToolPanelDeferredEditStrategy';
    private state = this.getDefaultState();

    private getDefaultState() {
        return {
            applyColumnState: null as null | [ColumnState[], ColumnEventType],
            moveColumns: null as null | [AgColumn[], number, ColumnEventType],
            setRowGroupColumns: null as null | [AgColumn[], ColumnEventType],
            setColumnsVisible: null as null | [AgColumn[], boolean, ColumnEventType],
            setValueColumns: null as null | [AgColumn[], ColumnEventType],
            setPivotColumns: null as null | [AgColumn[], ColumnEventType],
        };
    }

    public reset() {
        this.state = this.getDefaultState();
    }

    public commit() {}

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        this.state.applyColumnState = [state, eventType];
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.state.moveColumns = [columns, targetIndex, eventType];
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        this.state.setColumnsVisible = [columns, visible, eventType];
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setRowGroupColumns = [columns, eventType];
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setValueColumns = [columns, eventType];
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.setPivotColumns = [columns, eventType];
    }
}
