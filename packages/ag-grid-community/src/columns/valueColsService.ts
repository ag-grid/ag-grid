import type { AgColumn, BeanCollection, ColDef, IAggFunc } from 'ag-grid-community';

import type { NamedBean } from '../context/bean';
import type { ColumnEventType } from '../events';
import { _removeFromArray } from '../utils/array';
import { BaseColsService } from './baseColsService';
import type { ColumnServiceEventName } from './baseColsService';
import { dispatchColumnChangedEvent } from './columnEventUtils';
import type { ColKey, Maybe } from './columnModel';
import type { ModifyValueColumnsNoEventsCallbacks } from './columnStateService';

export class ValueColsService extends BaseColsService<ModifyValueColumnsNoEventsCallbacks> implements NamedBean {
    beanName = 'valueColsService' as const;

    public override wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.aggFuncService = beans.aggFuncService;
        this.visibleColsService = beans.visibleColsService;
    }

    public override getModifyColumnsNoEventsCallbacks(): ModifyValueColumnsNoEventsCallbacks {
        return {
            addValueCol: (column) => this.columns.push(column),
            removeValueCol: (column) => _removeFromArray(this.columns, column),
        };
    }

    protected override getEventName(): ColumnServiceEventName {
        return 'columnPivotChanged';
    }

    public override setColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._setColumns(colKeys, source, (added, column) => this.setValueActive(added, column, source));
    }

    public override addColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._addColumns(colKeys, source, (column) => this.setValueActive(true, column, source));
    }

    public override removeColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this._removeColumns(colKeys, source, (column) => this.setValueActive(false, column, source));
    }

    public override extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void {
        this.columns = this._extractColsCommon(
            oldProvidedCols,
            this.columns,
            (col, flag) => col.setValueActive(flag, source),
            // aggFunc doesn't have index variant, cos order of value cols doesn't matter, so always return null
            () => undefined,
            () => undefined,
            // aggFunc is a string, so return it's existence
            (colDef: ColDef) => {
                const aggFunc = colDef.aggFunc;
                // null or empty string means clear
                if (aggFunc === null || aggFunc === '') {
                    return null;
                }
                if (aggFunc === undefined) {
                    return;
                }

                return !!aggFunc;
            },
            (colDef: ColDef) => {
                // return false if any of the following: null, undefined, empty string
                return colDef.initialAggFunc != null && colDef.initialAggFunc != '';
            }
        );

        // all new columns added will have aggFunc missing, so set it to what is in the colDef
        this.columns.forEach((col) => {
            const colDef = col.getColDef();
            // if aggFunc provided, we always override, as reactive property
            if (colDef.aggFunc != null && colDef.aggFunc != '') {
                col.setAggFunc(colDef.aggFunc);
            } else {
                // otherwise we use initialAggFunc only if no agg func set - which happens when new column only
                if (!col.getAggFunc()) {
                    col.setAggFunc(colDef.initialAggFunc);
                }
            }
        });
    }

    public setColumnAggFunc(
        key: Maybe<ColKey>,
        aggFunc: string | IAggFunc | null | undefined,
        source: ColumnEventType
    ): void {
        if (!key) {
            return;
        }

        const column = this.columnModel.getColDefCol(key);
        if (!column) {
            return;
        }

        column.setAggFunc(aggFunc);

        dispatchColumnChangedEvent(this.eventService, this.getEventName(), [column], source);
    }

    private setValueActive(active: boolean, column: AgColumn, source: ColumnEventType): void {
        if (active === column.isValueActive()) {
            return;
        }

        column.setValueActive(active, source);

        if (active && !column.getAggFunc() && this.aggFuncService) {
            const initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    }
}
