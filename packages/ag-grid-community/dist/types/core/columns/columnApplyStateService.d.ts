import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IAggFunc } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColumnPinnedType } from '../interfaces/iColumn';
export interface ModifyColumnsNoEventsCallbacks {
    addGroupCol(col: AgColumn): void;
    removeGroupCol(col: AgColumn): void;
    addPivotCol(col: AgColumn): void;
    removePivotCol(col: AgColumn): void;
    addValueCol(col: AgColumn): void;
    removeValueCol(col: AgColumn): void;
}
export interface ColumnStateParams {
    /** True if the column is hidden */
    hide?: boolean | null;
    /** Width of the column in pixels */
    width?: number;
    /** Column's flex if flex is set */
    flex?: number | null;
    /** Sort applied to the column */
    sort?: 'asc' | 'desc' | null;
    /** The order of the sort, if sorting by many columns */
    sortIndex?: number | null;
    /** The aggregation function applied */
    aggFunc?: string | IAggFunc | null;
    /** True if pivot active */
    pivot?: boolean | null;
    /** The order of the pivot, if pivoting by many columns */
    pivotIndex?: number | null;
    /** Set if column is pinned */
    pinned?: ColumnPinnedType;
    /** True if row group active */
    rowGroup?: boolean | null;
    /** The order of the row group, if grouping by many columns */
    rowGroupIndex?: number | null;
}
export interface ColumnState extends ColumnStateParams {
    /** ID of the column */
    colId: string;
}
export interface ApplyColumnStateParams {
    /** The state from `getColumnState` */
    state?: ColumnState[];
    /** Whether column order should be applied */
    applyOrder?: boolean;
    /** State to apply to columns where state is missing for those columns */
    defaultState?: ColumnStateParams;
}
export declare class ColumnApplyStateService extends BeanStub implements NamedBean {
    beanName: "columnApplyStateService";
    private columnModel;
    private eventDispatcher;
    private sortController;
    private columnGetStateService;
    private funcColsService;
    private visibleColsService;
    private columnAnimationService;
    private pivotResultColsService;
    wireBeans(beans: BeanCollection): void;
    applyColumnState(params: ApplyColumnStateParams, source: ColumnEventType): boolean;
    resetColumnState(source: ColumnEventType): void;
    getColumnStateFromColDef(column: AgColumn): ColumnState;
    private syncColumnWithStateItem;
    private orderLiveColsLikeState;
    compareColumnStatesAndDispatchEvents(source: ColumnEventType): () => void;
    private normaliseColumnMovedEventForColumnState;
}
