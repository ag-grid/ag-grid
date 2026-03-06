import type { SortDef } from '../agStack/utils/aria';
import type { ColumnState } from '../columns/columnStateUtils';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColumnToolPanelState } from './gridState';
import type { IToolPanel } from './iToolPanel';

export interface IColumnToolPanel extends IToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void;
    syncLayoutWithGrid(): void;
    setPivotModeSectionVisible(visible: boolean): void;
    setRowGroupsSectionVisible(visible: boolean): void;
    setValuesSectionVisible(visible: boolean): void;
    setPivotSectionVisible(visible: boolean): void;
    getState(): ColumnToolPanelState;
}

export interface IColumnToolPanelEdits {
    applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getValueColumns(): AgColumn[];
    setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getPivotColumns(): AgColumn[];
    setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    getPivotMode(): boolean;
    setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getRowGroupColumns(): AgColumn[];
    getSortDef(column: AgColumn): SortDef | null;
    commit(): void;
    reset(): void;
}

export type ColumnToolPanelEditStrategyBean = 'colToolPanelSynchronousEdit' | 'colToolPanelDeferredEdit';
