import type {
    AgColumn,
    BeanCollection,
    ColAggFunc,
    ColKey,
    ColumnEventType,
    ColumnState,
    ColumnStateParams,
    IAggFuncService,
    IValueColsService,
    NamedBean,
} from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { BaseColsService } from '../columns/baseColsService';

export class ValueColsSvc extends BaseColsService implements NamedBean, IValueColsService {
    beanName = 'valueColsSvc' as const;
    protected override eventName = 'columnValueChanged' as const;
    private aggFuncSvc?: IAggFuncService;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.aggFuncSvc = beans.aggFuncSvc;
    }

    /** Value cols are included from a truthy aggFunc (never indexed); `undefined` falls back to `initialAggFunc`
     *  (new cols) or the current flag (existing). */
    public override extractCol(col: AgColumn, colIsNew: boolean): void {
        const colDef = col.colDef;
        const aggFunc = colDef.aggFunc;
        let include: boolean;
        if (aggFunc !== undefined) {
            include = aggFunc !== null && aggFunc !== '';
        } else if (colIsNew) {
            const initial = colDef.initialAggFunc;
            include = initial != null && initial !== '';
        } else {
            // At extract time the flag still mirrors the prior active state — read it directly.
            include = col.aggregationActive;
        }
        if (!include) {
            return;
        }
        this.extractAddColWithValue(col);
        if (aggFunc != null && aggFunc !== '') {
            this.writeAggFunc(col, aggFunc);
        } else if (!col.aggFunc) {
            this.writeAggFunc(col, colDef.initialAggFunc);
        }
    }

    // Imperative-only (the base gates on `runSideEffects`); the state/agg-func paths set the func explicitly.
    protected override onColActiveChanged(column: AgColumn, active: boolean): void {
        // A newly-active col with no agg-func picks up the default for its cell-data type.
        const aggFuncSvc = this.aggFuncSvc;
        if (active && !column.getAggFunc() && aggFuncSvc) {
            this.writeAggFunc(column, aggFuncSvc.getDefaultAggFunc(column));
        }
    }

    protected override writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean {
        if (col.aggregationActive === active) {
            return false;
        }
        col.aggregationActive = active;
        col.dispatchColEvent(this.eventName, source);
        return true;
    }

    public setColumnAggFunc(key: ColKey | undefined, aggFunc: ColAggFunc, source: ColumnEventType): void {
        if (key) {
            const column = this.colModel.getNonPivotCol(key);
            if (column && this.applyAggFunc(column, aggFunc, source)) {
                // aggFunc/activation only — stage + flush without a refresh; re-aggregation is event-driven.
                this.stageColChange([column]);
                this.colModel.flushColChanges(source, false);
            }
        }
    }

    public override syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void {
        // Fall back to the default only when the state value is `undefined` (not `null`).
        const stateAggFunc = stateItem?.aggFunc;
        const aggFunc = stateAggFunc !== undefined ? stateAggFunc : defaultState?.aggFunc;
        if (aggFunc === undefined) {
            return;
        }
        if (typeof aggFunc !== 'string' && aggFunc != null) {
            _warn(33); // stateItem.aggFunc must be a string — invalid (object / function) values.
            return;
        }
        this.applyAggFunc(column, aggFunc, source);
    }

    private applyAggFunc(column: AgColumn, aggFunc: ColAggFunc, source: ColumnEventType): boolean {
        if (aggFunc != null && aggFunc !== '') {
            const aggFuncChanged = this.writeAggFunc(column, aggFunc);
            const activeChanged = this.setColActive(column, true, source);
            return aggFuncChanged || activeChanged;
        }
        return this.setColActive(column, false, source);
    }

    private writeAggFunc(column: AgColumn, aggFunc: ColAggFunc): boolean {
        if (column.aggFunc === aggFunc) {
            return false;
        }
        column.aggFunc = aggFunc;
        column.dispatchStateUpdatedEvent('aggFunc');
        return true;
    }
}
